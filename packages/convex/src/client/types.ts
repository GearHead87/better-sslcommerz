import type {
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpRouter,
} from "convex/server";

import type * as BetterSslcommerz from "@better-sslcommerz/sdk";

export type SslcommerzClient = ReturnType<
  typeof BetterSslcommerz.createSslcommerzClient
>;
type SslcommerzCoreApi = SslcommerzClient["core"];
type SslcommerzInvoiceApi = SslcommerzClient["invoice"];

type MethodInput<T> = T extends (
  input: infer TInput,
  ...rest: unknown[]
) => unknown
  ? TInput
  : never;
type MethodOutput<T> = T extends (...args: unknown[]) => infer TOutput
  ? Awaited<TOutput>
  : never;

export type SslcommerzEnvironment = SslcommerzClient["environment"];
export type ValidateOrderInput = MethodInput<
  SslcommerzCoreApi["validateOrder"]
>;
export type OrderValidationResponse = MethodOutput<
  SslcommerzCoreApi["validateOrder"]
>;
export type RefundInitiateInput = MethodInput<
  SslcommerzCoreApi["refundInitiate"]
>;
export type RefundInitiateResponse = MethodOutput<
  SslcommerzCoreApi["refundInitiate"]
>;
export type RefundStatusInput = MethodInput<SslcommerzCoreApi["refundStatus"]>;
export type RefundStatusResponse = MethodOutput<
  SslcommerzCoreApi["refundStatus"]
>;
export type TransactionQueryBySessionInput = MethodInput<
  SslcommerzCoreApi["transactionQueryBySession"]
>;
export type TransactionQueryBySessionResponse = MethodOutput<
  SslcommerzCoreApi["transactionQueryBySession"]
>;
export type TransactionQueryByTranIdInput = MethodInput<
  SslcommerzCoreApi["transactionQueryByTranId"]
>;
export type TransactionQueryByTranIdResponse = MethodOutput<
  SslcommerzCoreApi["transactionQueryByTranId"]
>;
export type IpnPayload = MethodOutput<SslcommerzCoreApi["parseIpnPayload"]>;
export type CreateSessionResponse = MethodOutput<
  SslcommerzCoreApi["createSession"]
>;
export type CreateInvoiceInput = MethodInput<
  SslcommerzInvoiceApi["createInvoice"]
>;
export type CreateInvoiceResponse = MethodOutput<
  SslcommerzInvoiceApi["createInvoice"]
>;
export type InvoiceStatusInput = MethodInput<
  SslcommerzInvoiceApi["invoiceStatus"]
>;
export type InvoiceStatusResponse = MethodOutput<
  SslcommerzInvoiceApi["invoiceStatus"]
>;
export type InvoiceCancelInput = MethodInput<
  SslcommerzInvoiceApi["invoiceCancel"]
>;
export type InvoiceCancelResponse = MethodOutput<
  SslcommerzInvoiceApi["invoiceCancel"]
>;

export interface RunQueryCtx {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
}

export interface RunMutationCtx {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
}

export interface RunActionCtx {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
}

export interface SslCommerzComponentConfig {
  storeId?: string;
  storePasswd?: string;
  environment?: SslcommerzEnvironment;
  validateResponse?: boolean;
}

export interface CustomerInfo {
  name: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  phone: string;
  fax?: string;
}

export interface ProductInfo {
  name: string;
  category: string;
  profile:
    | "general"
    | "physical-goods"
    | "non-physical-goods"
    | "telecom-vertical"
    | "travel-vertical"
    | "airline-tickets";
}

export interface ShippingInfo {
  method: "YES" | "NO" | "Courier" | "SSLCOMMERZ_LOGISTIC";
  name?: string;
  address1?: string;
  address2?: string;
  area?: string;
  city?: string;
  subCity?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface CreatePaymentSessionArgs {
  tranId: string;
  totalAmount: number | string;
  currency: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl?: string;
  customerInfo: CustomerInfo;
  productInfo: ProductInfo;
  shippingInfo?: ShippingInfo;
  userId?: string;
  orgId?: string;
  metadata?: Record<string, unknown>;
  valueA?: string;
  valueB?: string;
  valueC?: string;
  valueD?: string;
}

export interface CreatePaymentSessionResult {
  tranId: string;
  sessionKey: string;
  gatewayUrl: string;
}

export interface RegisterRoutesConfig {
  ipnPath?: string;
  successPath?: string;
  failPath?: string;
  cancelPath?: string;
  successRedirectUrl?: string;
  failRedirectUrl?: string;
  cancelRedirectUrl?: string;
  onIpn?: (
    ctx: RunMutationCtx,
    ipn: IpnPayload,
    session: unknown,
  ) => Promise<void>;
  onSuccess?: (ctx: RunMutationCtx, session: unknown) => Promise<void>;
  onFail?: (ctx: RunMutationCtx, session: unknown) => Promise<void>;
  onCancel?: (ctx: RunMutationCtx, session: unknown) => Promise<void>;
}

export type { HttpRouter };
