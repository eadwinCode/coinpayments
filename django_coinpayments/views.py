# -*- coding: utf-8 -*-
from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    UpdateView,
    ListView
)

from .models import (
    CoinPaymentsTransaction,
    Payment,
)

from django.views.decorators.csrf import csrf_exempt
from django.http.response import HttpResponseBadRequest
from django.http import HttpResponse
from django.conf import settings
from .utils import create_ipn_hmac
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class CoinPaymentsTransactionCreateView(CreateView):
    model = CoinPaymentsTransaction


class CoinPaymentsTransactionDeleteView(DeleteView):
    model = CoinPaymentsTransaction


class CoinPaymentsTransactionDetailView(DetailView):
    model = CoinPaymentsTransaction


class CoinPaymentsTransactionUpdateView(UpdateView):
    model = CoinPaymentsTransaction


class CoinPaymentsTransactionListView(ListView):
    model = CoinPaymentsTransaction


class PaymentCreateView(CreateView):
    model = Payment


class PaymentDeleteView(DeleteView):
    model = Payment


class PaymentDetailView(DetailView):
    model = Payment


class PaymentUpdateView(UpdateView):
    model = Payment


class PaymentListView(ListView):
    model = Payment


# ipn_version = '1.0'
# ipn_id = 'ce041097ff2647f3c01375eacdc90e1d'
# ipn_mode = 'hmac'
# merchant = '8d683f17575a9544c6180206f52d4a9c'
# ipn_type = 'api'
# txn_id = 'CPCH5TRXAUDLO6ANAV2UCKDFN2'
# status = '0'
# status_text = 'Waiting for buyer funds...'
# currency1 = 'BCH'
# currency2 = 'BCH'
# amount1 = '1'
# amount2 = '1'
# fee = '0.006'
# buyer_name = 'CoinPayments API'
# invoice = '128fee28-2d37-448e-a339-71980a8950c1'
# received_amount = '0'
# received_confirms = '0'

@csrf_exempt
def ipn_view(request):
    p = request.POST.dict()
    ipn_mode = p.get('ipn_mode')
    if ipn_mode != 'hmac':
        return HttpResponseBadRequest('IPN Mode is not HMAC')
    http_hmac = request.META.get('HTTP_HMAC')
    if not http_hmac:
        return HttpResponseBadRequest('No HMAC signature sent.')
    our_hmac = create_ipn_hmac(p)
    if our_hmac != http_hmac:
        return HttpResponseBadRequest('Invalid HMAC signature sent')

    merchant_id = getattr(settings, 'COIN_PAYMENTS_MERCHANT_ID', None)
    if p.get('merchant') != merchant_id:
        return HttpResponseBadRequest('Invalid merchant id')
    tx_id = p.get('txn_id')
    payment = Payment.objects.filter(provider_tx_id__exact=tx_id).first()
    if payment:
        if payment.currency_original != p.get('currency1'):
            return HttpResponseBadRequest('Currency mismatch')
        if payment.status != Payment.PAYMENT_STATUS_PAID:
            # Payments statuses: https://www.coinpayments.net/merchant-tools-ipn
            # Safe statuses: 2 and >= 100
            status = int(p['status'])
            if status == 2 or status >= 100:
                logger.info('Received payment for transaction {} - payment {} ({})'
                            .format(str(tx_id), str(payment.id), str(payment.amount)))
                payment.amount_paid = payment.amount
            else:
                payment.amount_paid = Decimal(p['received_amount'])

            if payment.amount_paid == payment.amount:
                payment.status = Payment.PAYMENT_STATUS_PAID
            payment.save()
    return HttpResponse("OK", content_type="text/plain")
# payment = Payment.objects.create(currency_original=tariff.currency, currency_paid=form_data['currency'],
#                                          status=PAYMENT_STATUS_PROVIDER_PENDING,
#                                          amount=tariff.cost, amount_paid=decimal.Decimal(0), order=order)
# return create_tx_and_redirect(payment, form_data['name'], service.pk)

# def create_tx_and_redirect(payment, name, number):
#     try:
#         tx = payment.create_tx(item_name=name, item_number=number)
#         payment.status = PAYMENT_STATUS_PENDING
#         payment.save()
#         return redirect(reverse('main:payment_detail', kwargs={'pk': payment.pk}))
#     except ProviderError as e:
#         # TODO redirect to error page with info about provider error
#         return ''
#
# def create_new_payment(request, pk):
#     payment = get_object_or_404(Payment, pk)
#     if payment.status in [PAYMENT_STATUS_PROVIDER_PENDING, PAYMENT_STATUS_TIMEOUT]:
#         pass
#     elif payment.status in [PAYMENT_STATUS_PENDING]:
#         payment.provider_tx.delete()
#     else:
#         # TODO: redirect to payment status mismatch error page
#         return ''
#     service = payment.order.get_service()
#     return create_tx_and_redirect(payment, service.name, service.pk)
