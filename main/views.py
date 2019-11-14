from django import forms
from django.conf import settings
from django_coinpayments.models import Payment, Withdrawal, CoinPayments
from django_coinpayments.exceptions import CoinPaymentsProviderError
from django.views.generic import FormView, ListView, DetailView
from django.shortcuts import render, get_object_or_404
from decimal import Decimal
from django.shortcuts import render_to_response, reverse



class ExamplePaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = ['amount', 'currency_original', 'currency_paid']

class ExampleWithdrawalForm(forms.ModelForm):
    class Meta:
        model = Withdrawal
        fields = ['amount', 'currency', 'currency2', 'send_address', 'auto_confirm', 'add_tx_fee' ]


def create_tx(request, payment):
    context = {}
    try:
        tx = payment.create_tx()
        payment.status = Payment.PAYMENT_STATUS_PENDING
        payment.save()
        context['object'] = payment
    except CoinPaymentsProviderError as e:
        context['error'] = e
    return render(request, 'django_coinpayments/payment_result.html', context)


def create_wx(request, withdrawal):
    context = {}
    try:
        tx = withdrawal.create_wx()
        withdrawal.save()
        context['object'] = withdrawal
    except CoinPaymentsProviderError as e:
        context['error'] = e
    return render(request, 'django_coinpayments/withdrawal_result.html', context)


class PaymentDetail(DetailView):
    model = Payment
    template_name = 'django_coinpayments/payment_result.html'
    context_object_name = 'object'


class PaymentSetupView(FormView):
    template_name = 'django_coinpayments/payment_setup.html'
    form_class = ExamplePaymentForm

    def form_valid(self, form):
        cl = form.cleaned_data
        payment = Payment(currency_original=cl['currency_original'],
                          currency_paid=cl['currency_paid'],
                          amount=cl['amount'],
                          amount_paid=Decimal(0),
                          status=Payment.PAYMENT_STATUS_PROVIDER_PENDING)
        return create_tx(self.request, payment)


class WithdrawalSetupView(FormView):
    template_name = 'django_coinpayments/withdrawal_setup.html'
    form_class = ExampleWithdrawalForm

    def form_valid(self, form):
        withdrawal = form.save(commit=False)
        return create_wx(self.request, withdrawal)


class PaymentList(ListView):
    model = Payment
    template_name = 'django_coinpayments/payment_list.html'


class WithdrawalList(ListView):
    model = Withdrawal
    template_name = 'django_coinpayments/withdrawal_list.html'


class WithdrawalDetail(DetailView):
    model = Withdrawal
    template_name = 'django_coinpayments/withdrawal_result.html'
    context_object_name = 'object'


def create_new_payment(request, pk):
    payment = get_object_or_404(Payment, pk=pk)
    if payment.status in [Payment.PAYMENT_STATUS_PROVIDER_PENDING, Payment.PAYMENT_STATUS_TIMEOUT]:
        pass
    elif payment.status in [Payment.PAYMENT_STATUS_PENDING]:
        payment.provider_tx.delete()
    else:
        error = "Invalid status - {}".format(payment.get_status_display())
        return render(request, 'django_coinpayments/payment_result.html', {'error': error})
    return create_tx(request, payment)


def payments_info(request, tx_id):
    payment = get_object_or_404(Payment, provider_tx_id__exact=tx_id)
    res = payment.get_tx_info()
    if res['error'] == 'ok':
        payment.provider_tx.status = res['status_text']
        payment.provider_tx.amount = res['amountf']
    
    return render_to_response('django_coinpayments/payment-info.html',{'obj': payment})


def withdrawal_info(request, tx_id):
    withdrawal = get_object_or_404(Withdrawal, provider_tx_id__exact=tx_id)
    coin_payments = CoinPayments.get_instance()
    res = coin_payments.get_withdrawal_info()
    if res['error'] == 'ok':
        withdrawal.provider_tx.status = res['status_text']
        withdrawal.provider_tx.amount = res['amountf']
    
    return render_to_response('django_coinpayments/payment-info.html',{'obj': withdrawal})