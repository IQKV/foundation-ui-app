export interface Refund {
  id: string;
  tenantKey: string;
  externalRefundId: string;
  externalPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  occurredAt: string;
}
