from django.db import models
from django.utils import timezone
import datetime


class PaymentManager(models.Manager):
    def get_late_payments(self):
        """
        Returns payments that are already late by timeout, not filtering their status
        """
        return self.get_queryset().filter(provider_tx__isnull=False,
                                          provider_tx__timeout__lte=timezone.now())

    def get_cancelled_payments(self):
        """
        Returns payments that are already late and should be timed out
        """
        return self.get_late_payments().filter(status__in=[self.model.PAYMENT_STATUS_PENDING])

    def get_timed_out_payments(self):
        """
        Returns payments that are timed out
        """
        return self.get_late_payments().filter(status__in=[self.model.PAYMENT_STATUS_TIMEOUT])

    def mark_timed_out_payments(self):
        """
        Marks late payments as timed out
        """
        return self.get_late_payments().update(status=self.model.PAYMENT_STATUS_TIMEOUT)

    def get_pending_payments(self):
        return self.get_queryset() \
            .filter(status__in=[self.model.PAYMENT_STATUS_PENDING]) \
            .exclude(id__in=self.get_late_payments())

    def get_successful_payments(self):
        """
        Returns successfully paid payments
        """
        return self.get_queryset().filter(status__in=[self.model.PAYMENT_STATUS_PAID])


class WithdrawalManager(models.Manager):
    def get_completed_withdrawals(self):
        """
        Returns withdrawals with completed status 
        """
        return self.get_queryset().filter(provider_tx__isnull=False,
                                          status=self.model.WITHDRAWAL_STATUS_COMPLETED)
    
    def get_pending_withdrawals(self):
        """
        Returns withdrawals that are pending
        """
        return self.get_queryset().filter(provider_tx__isnull=False,
                                          status__in=[self.model.WITHDRAWAL_STATUS_PENDING,
                                          self.model.WITHDRAWAL_STATUS_WAITING])

    def get_cancelled_withdrawals(self):
        """
        Returns withdrawals that are cancelled
        """
        return self.get_queryset().filter(provider_tx__isnull=False,
                                          status__in=[self.model.WITHDRAWAL_STATUS_CANCELLED])
