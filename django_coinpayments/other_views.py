from django.core.exceptions import ImproperlyConfigured
from django.shortcuts import render_to_response, reverse, get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from django_coinpayments.coinpayments import CoinPayments
from django_coinpayments.exceptions import CoinPaymentsProviderError
from django_coinpayments.models import Payment, Withdrawal
from django.conf import settings
from django.http import QueryDict


@csrf_exempt
def mark_as_paid(request, tx_id):
    payment = Payment.objects.filter(provider_tx_id__exact=tx_id).first()
    coin_payments = CoinPayments.get_instance()
    merchant = getattr(settings, 'COIN_PAYMENTS_MERCHANT_ID')
    ipn_id = getattr(settings, 'COIN_PAYMENTS_IPN_SECRET')

    params = dict(
        amount1=1, amount2=1, buyer_name='CoinPayments API',
        currency1=payment.currency_original, currency2=payment.currency_paid,
        fee=0.006, invoice=str(payment.id),ipn_id=ipn_id, ipn_mode='hmac', ipn_type='api', ipn_version=1.0,
        merchant=merchant, received_amount=payment.amount, received_confirms=2,status=2,
        status_text='Waiting for buyer funds...', txn_id=payment.provider_tx.id
    )

    coin_payments.url = request.build_absolute_uri(reverse(settings.COIN_PAYMENTS_IPN_URL))
    response = coin_payments.example_request(**params)
    render_to_response('django_coinpayments/payment-successful.html', {'payment': payment})
# redirect to successful payment
# params = QueryDict(
#        f"amount1=1&amount2=1&buyer_name=CoinPayments API \
#       &currency1={payment.currency_original}&currency2={payment.currency_paid} \
#        &fee=0.006&invoice={payment.id}&ipn_id={ipn_id}&ipn_mode=hmac&ipn_type=api&ipn_version=1.0 \
#        &merchant={merchant}&received_amount={payment.amount}&received_confirms=2&status=2 \
#        &status_text=Waiting for buyer funds...&txn_id={payment.provider_tx.id}"
#    )