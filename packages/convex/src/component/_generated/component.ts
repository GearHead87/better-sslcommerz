/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    internal: {
      markIpnVerified: FunctionReference<
        "mutation",
        "internal",
        { valId: string },
        null,
        Name
      >;
      recordIpnEvent: FunctionReference<
        "mutation",
        "internal",
        {
          amount: string;
          bankTranId?: string;
          cardNo?: string;
          cardType: string;
          currency: string;
          rawPayload: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          storeAmount: string;
          tranId: string;
          valId: string;
          verified: boolean;
        },
        string,
        Name
      >;
      setPaymentSessionStatus: FunctionReference<
        "mutation",
        "internal",
        {
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          tranId: string;
          valId?: string;
        },
        null,
        Name
      >;
      syncPaymentSessionFromGateway: FunctionReference<
        "mutation",
        "internal",
        {
          bankTranId?: string;
          cardType?: string;
          gatewayStatus: string;
          storeAmount?: string;
          tranId: string;
          valId?: string;
        },
        null,
        Name
      >;
    };
    public: {
      createPaymentSessionRecord: FunctionReference<
        "mutation",
        "internal",
        {
          amount: string;
          currency: string;
          environment: "sandbox" | "live";
          expiresAt?: number;
          gatewayUrl: string;
          metadata?: any;
          orgId?: string;
          sessionKey: string;
          tranId: string;
          userId?: string;
        },
        string,
        Name
      >;
      getInvoiceById: FunctionReference<
        "query",
        "internal",
        { invoiceId: string },
        {
          createdAt: number;
          invoiceId: string;
          payUrl?: string;
          paymentStatus?: string;
          qrImageUrl?: string;
          raw: any;
          refer?: string;
          status: string;
          tranId?: string;
          updatedAt: number;
        } | null,
        Name
      >;
      getIpnEventByValId: FunctionReference<
        "query",
        "internal",
        { valId: string },
        {
          amount: string;
          bankTranId?: string;
          cardNo?: string;
          cardType: string;
          createdAt: number;
          currency: string;
          rawPayload: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          storeAmount: string;
          tranId: string;
          updatedAt: number;
          valId: string;
          verified: boolean;
        } | null,
        Name
      >;
      getPaymentSession: FunctionReference<
        "query",
        "internal",
        { tranId: string },
        {
          amount: string;
          bankTranId?: string;
          cardType?: string;
          createdAt: number;
          currency: string;
          environment: "sandbox" | "live";
          expiresAt?: number;
          gatewayUrl: string;
          metadata?: any;
          orgId?: string;
          sessionKey: string;
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          storeAmount?: string;
          tranId: string;
          updatedAt: number;
          userId?: string;
          valId?: string;
        } | null,
        Name
      >;
      getPaymentSessionBySessionKey: FunctionReference<
        "query",
        "internal",
        { sessionKey: string },
        {
          amount: string;
          bankTranId?: string;
          cardType?: string;
          createdAt: number;
          currency: string;
          environment: "sandbox" | "live";
          expiresAt?: number;
          gatewayUrl: string;
          metadata?: any;
          orgId?: string;
          sessionKey: string;
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          storeAmount?: string;
          tranId: string;
          updatedAt: number;
          userId?: string;
          valId?: string;
        } | null,
        Name
      >;
      getRefundByRefId: FunctionReference<
        "query",
        "internal",
        { refundRefId: string },
        {
          amount?: string;
          bankTranId?: string;
          createdAt: number;
          initiatedOn?: string;
          raw: any;
          refundRefId: string;
          refundTransId?: string;
          refundedOn?: string;
          status?: string;
          updatedAt: number;
        } | null,
        Name
      >;
      getTransactionByTranId: FunctionReference<
        "query",
        "internal",
        { tranId: string },
        {
          amount: string;
          bankTranId?: string;
          createdAt: number;
          currency: string;
          raw: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          tranId: string;
          updatedAt: number;
          valId: string;
        } | null,
        Name
      >;
      getTransactionByValId: FunctionReference<
        "query",
        "internal",
        { valId: string },
        {
          amount: string;
          bankTranId?: string;
          createdAt: number;
          currency: string;
          raw: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          tranId: string;
          updatedAt: number;
          valId: string;
        } | null,
        Name
      >;
      listInvoicesByPaymentStatus: FunctionReference<
        "query",
        "internal",
        { paymentStatus: string },
        Array<{
          createdAt: number;
          invoiceId: string;
          payUrl?: string;
          paymentStatus?: string;
          qrImageUrl?: string;
          raw: any;
          refer?: string;
          status: string;
          tranId?: string;
          updatedAt: number;
        }>,
        Name
      >;
      listIpnEventsByTranId: FunctionReference<
        "query",
        "internal",
        { tranId: string },
        Array<{
          amount: string;
          bankTranId?: string;
          cardNo?: string;
          cardType: string;
          createdAt: number;
          currency: string;
          rawPayload: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          storeAmount: string;
          tranId: string;
          updatedAt: number;
          valId: string;
          verified: boolean;
        }>,
        Name
      >;
      listPaymentSessionsByOrgId: FunctionReference<
        "query",
        "internal",
        { orgId: string },
        Array<{
          amount: string;
          bankTranId?: string;
          cardType?: string;
          createdAt: number;
          currency: string;
          environment: "sandbox" | "live";
          expiresAt?: number;
          gatewayUrl: string;
          metadata?: any;
          orgId?: string;
          sessionKey: string;
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          storeAmount?: string;
          tranId: string;
          updatedAt: number;
          userId?: string;
          valId?: string;
        }>,
        Name
      >;
      listPaymentSessionsByStatus: FunctionReference<
        "query",
        "internal",
        { status: "pending" | "success" | "failed" | "cancelled" | "expired" },
        Array<{
          amount: string;
          bankTranId?: string;
          cardType?: string;
          createdAt: number;
          currency: string;
          environment: "sandbox" | "live";
          expiresAt?: number;
          gatewayUrl: string;
          metadata?: any;
          orgId?: string;
          sessionKey: string;
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          storeAmount?: string;
          tranId: string;
          updatedAt: number;
          userId?: string;
          valId?: string;
        }>,
        Name
      >;
      listPaymentSessionsByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        Array<{
          amount: string;
          bankTranId?: string;
          cardType?: string;
          createdAt: number;
          currency: string;
          environment: "sandbox" | "live";
          expiresAt?: number;
          gatewayUrl: string;
          metadata?: any;
          orgId?: string;
          sessionKey: string;
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          storeAmount?: string;
          tranId: string;
          updatedAt: number;
          userId?: string;
          valId?: string;
        }>,
        Name
      >;
      listRefundsByStatus: FunctionReference<
        "query",
        "internal",
        { status: string },
        Array<{
          amount?: string;
          bankTranId?: string;
          createdAt: number;
          initiatedOn?: string;
          raw: any;
          refundRefId: string;
          refundTransId?: string;
          refundedOn?: string;
          status?: string;
          updatedAt: number;
        }>,
        Name
      >;
      listTransactionsByStatus: FunctionReference<
        "query",
        "internal",
        { status: string },
        Array<{
          amount: string;
          bankTranId?: string;
          createdAt: number;
          currency: string;
          raw: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          tranId: string;
          updatedAt: number;
          valId: string;
        }>,
        Name
      >;
      updatePaymentSessionStatus: FunctionReference<
        "mutation",
        "internal",
        {
          bankTranId?: string;
          cardType?: string;
          status: "pending" | "success" | "failed" | "cancelled" | "expired";
          storeAmount?: string;
          tranId: string;
          valId?: string;
        },
        null,
        Name
      >;
      upsertInvoiceRecord: FunctionReference<
        "mutation",
        "internal",
        {
          invoiceId: string;
          payUrl?: string;
          paymentStatus?: string;
          qrImageUrl?: string;
          raw: any;
          refer?: string;
          status: string;
          tranId?: string;
        },
        string,
        Name
      >;
      upsertRefundRecord: FunctionReference<
        "mutation",
        "internal",
        {
          amount?: string;
          bankTranId?: string;
          initiatedOn?: string;
          raw: any;
          refundRefId: string;
          refundTransId?: string;
          refundedOn?: string;
          status?: string;
        },
        string,
        Name
      >;
      upsertTransactionFromValidation: FunctionReference<
        "mutation",
        "internal",
        {
          amount: string;
          bankTranId?: string;
          currency: string;
          raw: any;
          riskLevel?: string;
          riskTitle?: string;
          status: string;
          tranId: string;
          valId: string;
        },
        string,
        Name
      >;
    };
  };
