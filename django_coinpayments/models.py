# -*- coding: utf-8 -*-

from django.db import models

from model_utils.models import TimeStampedModel
import uuid
from django.utils import timezone
from .coinpayments import CoinPayments
from .exceptions import CoinPaymentsProviderError
from .utils import get_coins_list, USD
import datetime
from decimal import Decimal
from django.utils.translation import ugettext_lazy as _
from .manager import PaymentManager, WithdrawalManager


class CoinPaymentsTransaction(TimeStampedModel):
    id = models.CharField(max_length=100, verbose_name=_('id'), primary_key=True, editable=True)
    address = models.CharField(max_length=150, verbose_name=_('Address'))
    amount = models.DecimalField(max_digits=65, decimal_places=18, verbose_name=_('Amount'))
    confirms_needed = models.PositiveSmallIntegerField(verbose_name=_('Confirms needed'))
    qrcode_url = models.URLField(verbose_name=_('QR Code Url'))
    checkout_url = models.URLField(verbose_name=_('Checkout Url'))
    status_url = models.URLField(verbose_name=_('Status Url'))
    timeout = models.DateTimeField(verbose_name=_('Valid until'))

    def __str__(self):
        return self.id

    class Meta:
        verbose_name = _('CoinPayments Transaction')
        verbose_name_plural = _('CoinPayments Transactions')


class CoinWithdrawalTransaction(TimeStampedModel):
    class Meta:
        verbose_name = _('Withdrawal Transaction')
        verbose_name_plural = _('Withdrawals Transactions')
    
    id = models.CharField(max_length=100, verbose_name=_('id'), primary_key=True, editable=True)
    send_address = models.CharField(max_length=150, verbose_name=_('Send Address'))
    amount = models.DecimalField(max_digits=65, decimal_places=18, verbose_name=_('Amount'))
    coin = models.CharField(max_length=20, verbose_name=_('Coin'))


class Withdrawal(TimeStampedModel):
    WITHDRAWAL_STATUS_CANCELLED = 'CANCEL'
    WITHDRAWAL_STATUS_WAITING = 'WAIT'
    WITHDRAWAL_STATUS_PENDING = 'PEND'
    WITHDRAWAL_STATUS_COMPLETED = 'COMPL'
    
    class Meta:
        verbose_name = _('Withdrawal')
        verbose_name_plural = _('Withdrawals')

    WITHDRAWAL_STATUS = (
        (WITHDRAWAL_STATUS_CANCELLED, _('Cancelled')),
        (WITHDRAWAL_STATUS_WAITING, _('Waiting for email confirmation')),
        (WITHDRAWAL_STATUS_PENDING, _('Pending')),
        (WITHDRAWAL_STATUS_COMPLETED, _('Completed'))
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    currency = models.CharField(max_length=8, choices=get_coins_list(), verbose_name=_('Withdrawal currency'))
    currency2 = models.CharField(max_length=8, choices=get_coins_list(), default=USD, verbose_name=_('Exchange currency'))
    note = models.TextField(verbose_name=_('Note'), null=True, blank=True)
    status = models.CharField(max_length=8, choices=WITHDRAWAL_STATUS)

    amount = models.DecimalField(max_digits=65, decimal_places=18, verbose_name=_('Amount'))
    send_address = models.CharField(max_length=150, verbose_name=_('Send Address'))
    auto_confirm = models.BooleanField(default=False,verbose_name=_('Auto Confirm'))
    add_tx_fee = models.BooleanField(default=True,verbose_name=_('Add Transaction Fee'))

    provider_tx = models.OneToOneField(CoinWithdrawalTransaction, on_delete=models.CASCADE,
                                       verbose_name=_('Withdrawal transaction'), null=True, blank=True)
    objects = WithdrawalManager()

    def __str__(self):
        return f"Paid {self.amount}"
    
    def create_wx(self, **kwargs):
        """
        :param kwargs:
            address      The address to send the funds to in currency_paid network
            amount       The amount to transfer.

            currency     The cryptocurrency to withdraw. (BTC, LTC, etc.)
            currency2    Optional currency to use to to withdraw 'amount' worth of 'currency2' in 'currency' coin. 
                         This is for exchange rate calculation only and will not convert coins or change which currency is withdrawn.
                         For example, to withdraw 1.00 USD worth of BTC you would specify 'currency'='BTC', 'currency2'='USD', and 'amount'='1.00'
            
            ipn_url      URL for your IPN callbacks.
                         If not set it will use the IPN URL in your Edit Settings page if you have one set.
        :return: `CoinWithdrawalTransaction` instance
        """
        obj = CoinPayments.get_instance()

        auto_confirm = 1 if self.auto_confirm else 0
        add_tx_fee = 1 if self.add_tx_fee else 0

        params = dict(amount=self.amount.normalize, currency=self.currency,auto_confirm=auto_confirm,
                      add_tx_fee=add_tx_fee, currency2=self.currency2, address=self.send_address, note=self.note)  
        params.update(**kwargs)
        result = obj.create_withdrawal(params)
        if result['error'] == 'ok':
            result = result['result']
            w = CoinWithdrawalTransaction.objects.create(id=result['id'],
                                                       amount=Decimal(result['amount']),
                                                       address=self.send_address,
                                                       confirms_needed=int(result['confirms_needed']),
                                                       qrcode_url=result['qrcode_url'],
                                                       status_url=result['status_url'])
            if int(result['status']) == 0:
                self.status = self.WITHDRAWAL_STATUS_WAITING
            self.provider_tx = w
            self.save()
        else:
            raise CoinPaymentsProviderError(result['error'])

        return w
    
    def get_withdrawal_info(self):
        obj = CoinPayments.get_instance()
        params = dict(id=self.provider_tx.id)
        return obj.get_withdrawal_info(params)


class Payment(TimeStampedModel):
    PAYMENT_STATUS_PAID = 'PAID'
    PAYMENT_STATUS_TIMEOUT = 'TOUT'
    PAYMENT_STATUS_PENDING = 'PEND'
    PAYMENT_STATUS_PROVIDER_PENDING = 'PRPE'
    PAYMENT_STATUS_CANCELLED = 'CNCL'
    PAYMENT_STATUS_CHOICES = (
        (PAYMENT_STATUS_PROVIDER_PENDING, _('Provider-related payment pending')),
        (PAYMENT_STATUS_PENDING, _('Pending')),
        (PAYMENT_STATUS_CANCELLED, _('Cancelled')),
        (PAYMENT_STATUS_TIMEOUT, _('Timed out')),
        (PAYMENT_STATUS_PAID, _('Paid'))
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    currency_original = models.CharField(max_length=8, choices=get_coins_list(), default=USD, verbose_name=_('Original currency'))
    currency_paid = models.CharField(max_length=8, choices=get_coins_list(), verbose_name=_('Payment currency'))
    amount = models.DecimalField(max_digits=65, decimal_places=18, verbose_name=_('Amount'))
    amount_paid = models.DecimalField(max_digits=65, decimal_places=18, verbose_name=_('Amount paid'))
    provider_tx = models.OneToOneField(CoinPaymentsTransaction, on_delete=models.CASCADE,
                                       verbose_name=_('Payment transaction'), null=True, blank=True)
    status = models.CharField(max_length=4, choices=PAYMENT_STATUS_CHOICES)
    coin_payment_status = models.CharField(max_length=4, default="Waiting for buyer")
    objects = PaymentManager()

    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')

    def __str__(self):
        return "{} of {} - {}".format(str(self.amount_paid.normalize()), str(self.amount.normalize()),
                                      self.get_status_display())

    def is_paid(self):
        return self.status == self.PAYMENT_STATUS_PAID

    def amount_left(self):
        return self.amount - self.amount_paid

    def is_cancelled(self):
        if self.provider_tx:
            return self.provider_tx.timeout < timezone.now()

    def create_tx(self, invoice=None, **kwargs):
        """
        :param invoice: Field for custom use. Default - payment id
        :param kwargs:
            address      The address to send the funds to in currency_paid network
            buyer_email  Optionally (but highly recommended) set the buyer's email address.
                         This will let us send them a notice if they underpay or need a refund.
            buyer_name   Optionally set the buyer's name for your reference.
            item_name    Item name for your reference,
                         will be on the payment information page and in the IPNs for the transaction.
            item_number  Item number for your reference,
                         will be on the payment information page and in the IPNs for the transaction.
            custom       Field for custom use.
            ipn_url      URL for your IPN callbacks.
                         If not set it will use the IPN URL in your Edit Settings page if you have one set.
        :return: `CoinPaymentsTransaction` instance
        """
        obj = CoinPayments.get_instance()
        if not invoice:
            invoice = self.id
        params = dict(amount=self.amount_left(), currency1=self.currency_original,
                      currency2=self.currency_paid, invoice=invoice)
        params.update(**kwargs)
        result = obj.create_transaction(params)
        if result['error'] == 'ok':
            result = result['result']
            timeout = timezone.now() + datetime.timedelta(seconds=result['timeout'])
            c = CoinPaymentsTransaction.objects.create(id=result['txn_id'],
                                                       amount=Decimal(result['amount']),
                                                       address=result['address'],
                                                       confirms_needed=int(result['confirms_needed']),
                                                       qrcode_url=result['qrcode_url'],
                                                       status_url=result['status_url'],
                                                       checkout_url=result['checkout_url'],
                                                       timeout=timeout)
            self.provider_tx = c
            self.save()
        else:
            raise CoinPaymentsProviderError(result['error'])

        return c

    def get_tx_info(self, **kwargs):
        """
        :param kwargs:
            txid = transition id
            full = Set to 1 to also include the raw checkout and shipping data for the payment if available. (default: 0)
        """
        obj = CoinPayments.get_instance()
        params = dict(txid=self.provider_tx.id)
        params.update(**kwargs)
        return obj.get_tx_info(params)
