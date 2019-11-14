from django.conf.urls import url, include
from django.urls import path
from django.contrib import admin
from .views import (
    PaymentSetupView, PaymentList, create_new_payment, PaymentDetail,
    WithdrawalSetupView, WithdrawalDetail, WithdrawalList,
    payments_info, withdrawal_info
)

urlpatterns = [
    url(r'^$', PaymentSetupView.as_view(), name='payment_setup'),
    url(r'^payments/$', PaymentList.as_view(), name='payment_list'),
    url(r'^payment/(?P<pk>[0-9a-f-]+)$', PaymentDetail.as_view(), name='payment_detail'),
    url(r'^payment/new/(?P<pk>[0-9a-f-]+)$', create_new_payment, name='payment_new'),
    path('payments/<str:tx_id/info', payments_info, name='payment_info'),
]

urlpatterns += [
    path('withdrawal/<str:tx_id/info', withdrawal_info, name='withdrawal_info'),
    path('withdrawal', WithdrawalList.as_view(), name='withdrawal_list'),
    path('withdrawal/new/', WithdrawalSetupView.as_view(), name='withdrawal_setup'),
    path('withdrawal/<str:pk>/', WithdrawalDetail.as_view(), name='withdrawal_detail'),
]