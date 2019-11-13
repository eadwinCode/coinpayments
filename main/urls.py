from django.conf.urls import url, include
from django.contrib import admin
from .views import PaymentSetupView, PaymentList, create_new_payment, PaymentDetail

urlpatterns = [
    url(r'^$', PaymentSetupView.as_view(), name='payment_setup'),
    url(r'^payments/$', PaymentList.as_view(), name='payment_list'),
    url(r'^payment/(?P<pk>[0-9a-f-]+)$', PaymentDetail.as_view(), name='payment_detail'),
    url(r'^payment/new/(?P<pk>[0-9a-f-]+)$', create_new_payment, name='payment_new'),
]