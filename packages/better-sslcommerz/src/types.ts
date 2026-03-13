import type {
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  InvoiceCancelRequest,
  InvoiceCancelResponse,
  InvoiceStatusRequest,
  InvoiceStatusResponse,
  IpnPayload,
  OrderValidationRequest,
  OrderValidationResponse,
  RefundInitiateRequest,
  RefundInitiateResponse,
  RefundStatusRequest,
  RefundStatusResponse,
  TransactionQueryBySessionRequest,
  TransactionQueryBySessionResponse,
  TransactionQueryByTranIdRequest,
  TransactionQueryByTranIdResponse,
} from "@better-sslcommerz/validators";

export type SslcommerzEnvironment = "sandbox" | "live";

export type FetchLike = typeof fetch;

export interface SslcommerzRequestOptions {
  signal?: AbortSignal;
  validateResponse?: boolean;
}

export interface SslcommerzTransport {
  get(
    endpointPath: string,
    params: Record<string, unknown>,
    options?: SslcommerzRequestOptions,
  ): Promise<unknown>;
  post(
    endpointPath: string,
    body: Record<string, unknown>,
    options?: SslcommerzRequestOptions,
  ): Promise<unknown>;
}

export interface CreateSslcommerzClientOptions {
  storeId: string;
  storePasswd: string;
  environment?: SslcommerzEnvironment;
  validateResponse?: boolean;
  baseUrl?: string;
  fetch?: FetchLike;
  timeoutMs?: number;
}

type AuthFields = "store_id" | "store_passwd";
type WithAuth<T> = T & { store_id: string; store_passwd: string };

export type CreateSessionInput = Omit<CreateSessionRequest, AuthFields>;
export type ValidateOrderInput = Omit<OrderValidationRequest, AuthFields>;
export type RefundInitiateInput = Omit<RefundInitiateRequest, AuthFields>;
export type RefundStatusInput = Omit<RefundStatusRequest, AuthFields>;
export type TransactionQueryBySessionInput = Omit<
  TransactionQueryBySessionRequest,
  AuthFields
>;
export type TransactionQueryByTranIdInput = Omit<
  TransactionQueryByTranIdRequest,
  AuthFields
>;
export type CreateInvoiceInput = Omit<CreateInvoiceRequest, AuthFields>;
export type InvoiceStatusInput = Omit<
  Omit<InvoiceStatusRequest, AuthFields>,
  "action"
>;
export type InvoiceCancelInput = Omit<
  Omit<InvoiceCancelRequest, AuthFields>,
  "action"
>;

export interface SslcommerzRuntimeContext {
  readonly auth: {
    readonly store_id: string;
    readonly store_passwd: string;
  };
  readonly transport: SslcommerzTransport;
  readonly validateResponse: boolean;
}

export interface SslcommerzCoreApi {
  createSession(
    input: CreateSessionInput,
    options?: SslcommerzRequestOptions,
  ): Promise<CreateSessionResponse>;
  validateOrder(
    input: ValidateOrderInput,
    options?: SslcommerzRequestOptions,
  ): Promise<OrderValidationResponse>;
  refundInitiate(
    input: RefundInitiateInput,
    options?: SslcommerzRequestOptions,
  ): Promise<RefundInitiateResponse>;
  refundStatus(
    input: RefundStatusInput,
    options?: SslcommerzRequestOptions,
  ): Promise<RefundStatusResponse>;
  transactionQueryBySession(
    input: TransactionQueryBySessionInput,
    options?: SslcommerzRequestOptions,
  ): Promise<TransactionQueryBySessionResponse>;
  transactionQueryByTranId(
    input: TransactionQueryByTranIdInput,
    options?: SslcommerzRequestOptions,
  ): Promise<TransactionQueryByTranIdResponse>;
  parseIpnPayload(payload: unknown): IpnPayload;
}

export interface SslcommerzInvoiceApi {
  createInvoice(
    input: CreateInvoiceInput,
    options?: SslcommerzRequestOptions,
  ): Promise<CreateInvoiceResponse>;
  invoiceStatus(
    input: InvoiceStatusInput,
    options?: SslcommerzRequestOptions,
  ): Promise<InvoiceStatusResponse>;
  invoiceCancel(
    input: InvoiceCancelInput,
    options?: SslcommerzRequestOptions,
  ): Promise<InvoiceCancelResponse>;
}

export interface SslcommerzClient {
  readonly environment: SslcommerzEnvironment;
  readonly baseUrl: string;
  readonly core: SslcommerzCoreApi;
  readonly invoice: SslcommerzInvoiceApi;
}

export type {
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  InvoiceCancelRequest,
  InvoiceCancelResponse,
  InvoiceStatusRequest,
  InvoiceStatusResponse,
  IpnPayload,
  OrderValidationRequest,
  OrderValidationResponse,
  RefundInitiateRequest,
  RefundInitiateResponse,
  RefundStatusRequest,
  RefundStatusResponse,
  TransactionQueryBySessionRequest,
  TransactionQueryBySessionResponse,
  TransactionQueryByTranIdRequest,
  TransactionQueryByTranIdResponse,
  WithAuth,
};
