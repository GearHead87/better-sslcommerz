import {
  createInvoiceRequestSchema,
  createInvoiceResponseSchema,
  invoiceCancelRequestSchema,
  invoiceCancelResponseSchema,
  invoiceStatusRequestSchema,
  invoiceStatusResponseSchema,
} from "@better-sslcommerz/validators";

import type { SslcommerzInvoiceApi, SslcommerzRuntimeContext } from "../types";
import { callPost, withAuth } from "../internal";

const CREATE_INVOICE_PATH = "gwprocess/v4/invoice.php";
const INVOICE_ACTION_PATH = "validator/api/v4/";

export const createInvoiceApi = (
  context: SslcommerzRuntimeContext,
): SslcommerzInvoiceApi => ({
  createInvoice(input, options) {
    return callPost({
      context,
      transport: context.transport,
      endpoint: CREATE_INVOICE_PATH,
      requestSchema: createInvoiceRequestSchema,
      responseSchema: createInvoiceResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  invoiceStatus(input, options) {
    return callPost({
      context,
      transport: context.transport,
      endpoint: INVOICE_ACTION_PATH,
      requestSchema: invoiceStatusRequestSchema,
      responseSchema: invoiceStatusResponseSchema,
      requestPayload: withAuth(context, {
        ...input,
        action: "invoicePaymentStatus",
      }),
      options,
    });
  },

  invoiceCancel(input, options) {
    return callPost({
      context,
      transport: context.transport,
      endpoint: INVOICE_ACTION_PATH,
      requestSchema: invoiceCancelRequestSchema,
      responseSchema: invoiceCancelResponseSchema,
      requestPayload: withAuth(context, {
        ...input,
        action: "invoiceCancellation",
      }),
      options,
    });
  },
});
