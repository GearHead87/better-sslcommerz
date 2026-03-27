import { httpActionGeneric } from "convex/server";

import { createSslcommerzClient, ipnPayloadSchema } from "better-sslcommerz";

import type { ComponentApi } from "../component/_generated/component.js";
import type {
  CreateInvoiceInput,
  CreateInvoiceResponse,
  CreatePaymentSessionArgs,
  CreatePaymentSessionResult,
  HttpRouter,
  InvoiceCancelInput,
  InvoiceCancelResponse,
  InvoiceStatusInput,
  InvoiceStatusResponse,
  IpnPayload,
  OrderValidationResponse,
  RefundInitiateInput,
  RefundInitiateResponse,
  RefundStatusInput,
  RefundStatusResponse,
  RegisterRoutesConfig,
  RunActionCtx,
  RunQueryCtx,
  SslcommerzClient,
  SslCommerzComponentConfig,
  TransactionQueryBySessionInput,
  TransactionQueryBySessionResponse,
  TransactionQueryByTranIdInput,
  TransactionQueryByTranIdResponse,
  ValidateOrderInput,
} from "./types.js";

const DEFAULT_IPN_PATH = "/sslcommerz/ipn";
const DEFAULT_SUCCESS_PATH = "/sslcommerz/success";
const DEFAULT_FAIL_PATH = "/sslcommerz/fail";
const DEFAULT_CANCEL_PATH = "/sslcommerz/cancel";

const asString = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  return String(value);
};

const parseFormBody = async (request: Request): Promise<Record<string, string>> => {
  const body = await request.text();
  const params = new URLSearchParams(body);

  return Object.fromEntries(params.entries());
};

const buildRedirectResponse = (url: string) =>
  new Response(null, {
    status: 302,
    headers: {
      location: url,
    },
  });

const extractTransactionTranId = (transaction: unknown): string | undefined => {
  if (!Array.isArray(transaction) || transaction.length === 0) {
    return undefined;
  }

  const first = transaction[0];

  if (
    typeof first === "object" &&
    first !== null &&
    "tran_id" in first &&
    typeof first.tran_id === "string"
  ) {
    return first.tran_id;
  }

  return undefined;
};

export type SslCommerzComponent = ComponentApi;

export class SslCommerzConvex {
  private readonly config: SslCommerzComponentConfig;

  public constructor(
    public component: SslCommerzComponent,
    config?: SslCommerzComponentConfig,
  ) {
    this.config = config ?? {};
  }

  private resolveEnvironment() {
    const environment =
      this.config.environment ??
      (process.env.SSLCOMMERZ_ENVIRONMENT as "sandbox" | "live" | undefined) ??
      "sandbox";

    if (environment !== "sandbox" && environment !== "live") {
      throw new Error(
        `Invalid SSLCOMMERZ_ENVIRONMENT: ${environment}. Expected sandbox or live.`,
      );
    }

    return environment;
  }

  private resolveCredentials() {
    const storeId = this.config.storeId ?? process.env.SSLCOMMERZ_STORE_ID;
    const storePasswd =
      this.config.storePasswd ?? process.env.SSLCOMMERZ_STORE_PASSWD;

    if (!storeId) {
      throw new Error("SSLCOMMERZ_STORE_ID is not configured.");
    }

    if (!storePasswd) {
      throw new Error("SSLCOMMERZ_STORE_PASSWD is not configured.");
    }

    return {
      storeId,
      storePasswd,
    };
  }

  private createClient() {
    const credentials = this.resolveCredentials();

    return createSslcommerzClient({
      storeId: credentials.storeId,
      storePasswd: credentials.storePasswd,
      environment: this.resolveEnvironment(),
      validateResponse: this.config.validateResponse,
    });
  }

  public parseIpnPayload(payload: unknown): IpnPayload {
    return ipnPayloadSchema.parse(payload);
  }

  public async createPaymentSession(
    ctx: RunActionCtx,
    args: CreatePaymentSessionArgs,
  ): Promise<CreatePaymentSessionResult> {
    const client: SslcommerzClient = this.createClient();

    const response = await client.core.createSession({
      total_amount: args.totalAmount,
      currency: args.currency,
      tran_id: args.tranId,
      success_url: args.successUrl,
      fail_url: args.failUrl,
      cancel_url: args.cancelUrl,
      ipn_url: args.ipnUrl,
      product_category: args.productInfo.category,
      product_name: args.productInfo.name,
      product_profile: args.productInfo.profile,
      cus_name: args.customerInfo.name,
      cus_email: args.customerInfo.email,
      cus_add1: args.customerInfo.address1,
      cus_add2: args.customerInfo.address2,
      cus_city: args.customerInfo.city,
      cus_state: args.customerInfo.state,
      cus_postcode: args.customerInfo.postcode,
      cus_country: args.customerInfo.country,
      cus_phone: args.customerInfo.phone,
      cus_fax: args.customerInfo.fax,
      shipping_method: args.shippingInfo?.method ?? "NO",
      num_of_item: args.shippingInfo?.name ? "1" : undefined,
      ship_name: args.shippingInfo?.name,
      ship_add1: args.shippingInfo?.address1,
      ship_add2: args.shippingInfo?.address2,
      ship_area: args.shippingInfo?.area,
      ship_city: args.shippingInfo?.city,
      ship_sub_city: args.shippingInfo?.subCity,
      ship_state: args.shippingInfo?.state,
      ship_postcode: args.shippingInfo?.postcode,
      ship_country: args.shippingInfo?.country,
      value_a: args.valueA,
      value_b: args.valueB,
      value_c: args.valueC,
      value_d: args.valueD,
    });

    if (response.status.trim().toUpperCase() !== "SUCCESS") {
      throw new Error(
        `SSLCommerz session creation failed: ${response.failedreason ?? "unknown reason"}`,
      );
    }

    if (!response.sessionkey || !response.GatewayPageURL) {
      throw new Error(
        "SSLCommerz session response did not include sessionkey or GatewayPageURL.",
      );
    }

    await ctx.runMutation(this.component.public.createPaymentSessionRecord, {
      tranId: args.tranId,
      sessionKey: response.sessionkey,
      gatewayUrl: response.GatewayPageURL,
      amount: String(args.totalAmount),
      currency: args.currency,
      environment: this.resolveEnvironment(),
      userId: args.userId,
      orgId: args.orgId,
      metadata: args.metadata,
    });

    return {
      tranId: args.tranId,
      sessionKey: response.sessionkey,
      gatewayUrl: response.GatewayPageURL,
    };
  }

  public async validateOrder(
    ctx: RunActionCtx,
    args: ValidateOrderInput,
  ): Promise<OrderValidationResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.core.validateOrder(args);

    await ctx.runMutation(this.component.public.upsertTransactionFromValidation, {
      tranId: response.tran_id,
      valId: response.val_id,
      status: response.status,
      amount: String(response.amount),
      currency: response.currency,
      bankTranId: response.bank_tran_id,
      riskLevel: asString(response.risk_level),
      riskTitle: response.risk_title,
      raw: response,
    });

    await ctx.runMutation(this.component.internal.syncPaymentSessionFromGateway, {
      tranId: response.tran_id,
      gatewayStatus: response.status,
      valId: response.val_id,
      bankTranId: response.bank_tran_id,
      cardType: response.card_type,
      storeAmount: asString(response.store_amount),
    });

    return response;
  }

  public async refundInitiate(
    ctx: RunActionCtx,
    args: RefundInitiateInput,
  ): Promise<RefundInitiateResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.core.refundInitiate(args);

    if (response.refund_ref_id) {
      await ctx.runMutation(this.component.public.upsertRefundRecord, {
        refundRefId: response.refund_ref_id,
        refundTransId: response.trans_id,
        bankTranId: response.bank_tran_id,
        status: response.status,
        amount: String(args.refund_amount),
        raw: response,
      });
    }

    return response;
  }

  public async refundStatus(
    ctx: RunActionCtx,
    args: RefundStatusInput,
  ): Promise<RefundStatusResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.core.refundStatus(args);

    if (response.refund_ref_id) {
      await ctx.runMutation(this.component.public.upsertRefundRecord, {
        refundRefId: response.refund_ref_id,
        refundTransId: response.tran_id,
        bankTranId: response.bank_tran_id,
        status: response.status,
        initiatedOn: response.initiated_on,
        refundedOn: response.refunded_on,
        raw: response,
      });
    }

    return response;
  }

  public async transactionQueryBySession(
    ctx: RunActionCtx,
    args: TransactionQueryBySessionInput,
  ): Promise<TransactionQueryBySessionResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.core.transactionQueryBySession(args);

    await ctx.runMutation(this.component.public.upsertTransactionFromValidation, {
      tranId: response.tran_id,
      valId: response.val_id,
      status: response.status,
      amount: String(response.amount),
      currency: response.currency,
      bankTranId: response.bank_tran_id,
      riskLevel: asString(response.risk_level),
      riskTitle: response.risk_title,
      raw: response,
    });

    await ctx.runMutation(this.component.internal.syncPaymentSessionFromGateway, {
      tranId: response.tran_id,
      gatewayStatus: response.status,
      valId: response.val_id,
      bankTranId: response.bank_tran_id,
      cardType: response.card_type,
      storeAmount: asString(response.store_amount),
    });

    return response;
  }

  public async transactionQueryByTranId(
    ctx: RunActionCtx,
    args: TransactionQueryByTranIdInput,
  ): Promise<TransactionQueryByTranIdResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.core.transactionQueryByTranId(args);

    if (Array.isArray(response.element)) {
      for (const item of response.element) {
        await ctx.runMutation(this.component.public.upsertTransactionFromValidation, {
          tranId: item.tran_id,
          valId: item.val_id,
          status: item.status,
          amount: String(item.amount),
          currency: item.currency,
          bankTranId: item.bank_tran_id,
          riskLevel: asString(item.risk_level),
          riskTitle: item.risk_title,
          raw: item,
        });

        await ctx.runMutation(this.component.internal.syncPaymentSessionFromGateway, {
          tranId: item.tran_id,
          gatewayStatus: item.status,
          valId: item.val_id,
          bankTranId: item.bank_tran_id,
          cardType: item.card_type,
          storeAmount: asString(item.store_amount),
        });
      }
    }

    return response;
  }

  public async createInvoice(
    ctx: RunActionCtx,
    args: CreateInvoiceInput,
  ): Promise<CreateInvoiceResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.invoice.createInvoice(args);

    if (response.invoice_id) {
      await ctx.runMutation(this.component.public.upsertInvoiceRecord, {
        invoiceId: response.invoice_id,
        refer: response.invoice_refer ?? args.refer,
        tranId: args.tran_id,
        status: response.status,
        payUrl: response.pay_url ?? response.qr_image_pay_url,
        qrImageUrl: response.qr_image_url,
        raw: response,
      });
    }

    return response;
  }

  public async invoiceStatus(
    ctx: RunActionCtx,
    args: InvoiceStatusInput,
  ): Promise<InvoiceStatusResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.invoice.invoiceStatus(args);

    if (response.invoice_id) {
      await ctx.runMutation(this.component.public.upsertInvoiceRecord, {
        invoiceId: response.invoice_id,
        refer: response.refer ?? args.refer,
        tranId: extractTransactionTranId(response.transaction),
        paymentStatus: response.payment_status,
        status: response.status,
        raw: response,
      });
    }

    return response;
  }

  public async invoiceCancel(
    ctx: RunActionCtx,
    args: InvoiceCancelInput,
  ): Promise<InvoiceCancelResponse> {
    const client: SslcommerzClient = this.createClient();
    const response = await client.invoice.invoiceCancel(args);

    if (response.invoice_id) {
      await ctx.runMutation(this.component.public.upsertInvoiceRecord, {
        invoiceId: response.invoice_id,
        refer: response.refer ?? args.refer,
        paymentStatus: response.payment_status,
        status: response.status,
        raw: response,
      });
    }

    return response;
  }

  public getPaymentSession(ctx: RunQueryCtx, args: { tranId: string }) {
    return ctx.runQuery(this.component.public.getPaymentSession, args);
  }

  public listPaymentSessionsByStatus(
    ctx: RunQueryCtx,
    args: { status: "pending" | "success" | "failed" | "cancelled" | "expired" },
  ) {
    return ctx.runQuery(this.component.public.listPaymentSessionsByStatus, args);
  }

  public listPaymentSessionsByUserId(ctx: RunQueryCtx, args: { userId: string }) {
    return ctx.runQuery(this.component.public.listPaymentSessionsByUserId, args);
  }

  public listPaymentSessionsByOrgId(ctx: RunQueryCtx, args: { orgId: string }) {
    return ctx.runQuery(this.component.public.listPaymentSessionsByOrgId, args);
  }

  public getTransactionByTranId(ctx: RunQueryCtx, args: { tranId: string }) {
    return ctx.runQuery(this.component.public.getTransactionByTranId, args);
  }

  public getInvoiceById(ctx: RunQueryCtx, args: { invoiceId: string }) {
    return ctx.runQuery(this.component.public.getInvoiceById, args);
  }

  public getRefundByRefId(ctx: RunQueryCtx, args: { refundRefId: string }) {
    return ctx.runQuery(this.component.public.getRefundByRefId, args);
  }

  public listIpnEventsByTranId(ctx: RunQueryCtx, args: { tranId: string }) {
    return ctx.runQuery(this.component.public.listIpnEventsByTranId, args);
  }

  public registerRoutes(http: HttpRouter, config?: RegisterRoutesConfig) {
    const ipnPath = config?.ipnPath ?? DEFAULT_IPN_PATH;
    const successPath = config?.successPath ?? DEFAULT_SUCCESS_PATH;
    const failPath = config?.failPath ?? DEFAULT_FAIL_PATH;
    const cancelPath = config?.cancelPath ?? DEFAULT_CANCEL_PATH;

    http.route({
      path: ipnPath,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const rawPayload = await parseFormBody(request);

        let ipn: IpnPayload;
        try {
          ipn = this.parseIpnPayload(rawPayload);
        } catch {
          return new Response("Invalid IPN payload", { status: 400 });
        }

        await ctx.runMutation(this.component.internal.recordIpnEvent, {
          tranId: ipn.tran_id,
          valId: ipn.val_id,
          status: ipn.status,
          amount: String(ipn.amount),
          storeAmount: String(ipn.store_amount),
          currency: ipn.currency,
          bankTranId: ipn.bank_tran_id,
          cardType: ipn.card_type,
          cardNo: ipn.card_no,
          riskLevel: asString(ipn.risk_level),
          riskTitle: ipn.risk_title,
          rawPayload,
          verified: false,
        });

        try {
          await this.validateOrder(ctx, { val_id: ipn.val_id });
          await ctx.runMutation(this.component.internal.markIpnVerified, {
            valId: ipn.val_id,
          });
        } catch (error) {
          console.error("SSLCommerz IPN validation failed", error);
        }

        const session = await ctx.runQuery(this.component.public.getPaymentSession, {
          tranId: ipn.tran_id,
        });

        if (config?.onIpn) {
          await config.onIpn(ctx, ipn, session);
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      }),
    });

    http.route({
      path: successPath,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const payload = await parseFormBody(request);
        const tranId = payload.tran_id;
        const valId = payload.val_id;

        if (tranId) {
          await ctx.runMutation(this.component.internal.setPaymentSessionStatus, {
            tranId,
            status: "success",
            valId,
          });
        }

        if (valId) {
          try {
            await this.validateOrder(ctx, { val_id: valId });
          } catch (error) {
            console.error("SSLCommerz success validation failed", error);
          }
        }

        const session = tranId
          ? await ctx.runQuery(this.component.public.getPaymentSession, { tranId })
          : null;

        if (config?.onSuccess) {
          await config.onSuccess(ctx, session);
        }

        return buildRedirectResponse(config?.successRedirectUrl ?? "/");
      }),
    });

    http.route({
      path: failPath,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const payload = await parseFormBody(request);
        const tranId = payload.tran_id;

        if (tranId) {
          await ctx.runMutation(this.component.internal.setPaymentSessionStatus, {
            tranId,
            status: "failed",
          });
        }

        const session = tranId
          ? await ctx.runQuery(this.component.public.getPaymentSession, { tranId })
          : null;

        if (config?.onFail) {
          await config.onFail(ctx, session);
        }

        return buildRedirectResponse(config?.failRedirectUrl ?? "/");
      }),
    });

    http.route({
      path: cancelPath,
      method: "POST",
      handler: httpActionGeneric(async (ctx, request) => {
        const payload = await parseFormBody(request);
        const tranId = payload.tran_id;

        if (tranId) {
          await ctx.runMutation(this.component.internal.setPaymentSessionStatus, {
            tranId,
            status: "cancelled",
          });
        }

        const session = tranId
          ? await ctx.runQuery(this.component.public.getPaymentSession, { tranId })
          : null;

        if (config?.onCancel) {
          await config.onCancel(ctx, session);
        }

        return buildRedirectResponse(config?.cancelRedirectUrl ?? "/");
      }),
    });
  }
}

export function registerRoutes(
  http: HttpRouter,
  component: ComponentApi,
  config?: RegisterRoutesConfig,
  componentConfig?: SslCommerzComponentConfig,
) {
  const sslcommerz = new SslCommerzConvex(component, componentConfig);
  sslcommerz.registerRoutes(http, config);
  return sslcommerz;
}

export default SslCommerzConvex;
