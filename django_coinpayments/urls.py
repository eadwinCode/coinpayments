# -*- coding: utf-8 -*-
from django.conf.urls import url
from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from . import views, other_views

app_name = 'django_coin_payments'

urlpatterns = [
    path('ipn', views.ipn_view, name="notification_view")
]

urlpatterns +=  [
    path('debug/mark_as_paid/<str:tx_id>', other_views.mark_as_paid, name='mark_as_paid'),
]
