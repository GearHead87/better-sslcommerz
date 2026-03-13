import {
  createSessionRequestSchema,
  createSessionResponseSchema,
  ipnPayloadSchema,
  orderValidationRequestSchema,
  orderValidationResponseSchema,
  refundInitiateRequestSchema,
  refundInitiateResponseSchema,
  refundStatusRequestSchema,
  refundStatusResponseSchema,
  transactionQueryBySessionRequestSchema,
  transactionQueryBySessionResponseSchema,
  transactionQueryByTranIdRequestSchema,
  transactionQueryByTranIdResponseSchema,
} from "@better-sslcommerz/validators";

import type { SslcommerzCoreApi, SslcommerzRuntimeContext } from "../types";
import { callGet, callPost, parseWithSchema, withAuth } from "../internal";

const CREATE_SESSION_PATH = "gwprocess/v4/api.php";
const VALIDATE_ORDER_PATH = "validator/api/validationserverAPI.php";
const TRANSACTION_PATH = "validator/api/merchantTransIDvalidationAPI.php";

export const createCoreApi = (
  context: SslcommerzRuntimeContext,
): SslcommerzCoreApi => ({
  createSession(input, options) {
    return callPost({
      context,
      transport: context.transport,
      endpoint: CREATE_SESSION_PATH,
      requestSchema: createSessionRequestSchema,
      responseSchema: createSessionResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  validateOrder(input, options) {
    return callGet({
      context,
      transport: context.transport,
      endpoint: VALIDATE_ORDER_PATH,
      requestSchema: orderValidationRequestSchema,
      responseSchema: orderValidationResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  refundInitiate(input, options) {
    return callGet({
      context,
      transport: context.transport,
      endpoint: TRANSACTION_PATH,
      requestSchema: refundInitiateRequestSchema,
      responseSchema: refundInitiateResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  refundStatus(input, options) {
    return callGet({
      context,
      transport: context.transport,
      endpoint: TRANSACTION_PATH,
      requestSchema: refundStatusRequestSchema,
      responseSchema: refundStatusResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  transactionQueryBySession(input, options) {
    return callGet({
      context,
      transport: context.transport,
      endpoint: TRANSACTION_PATH,
      requestSchema: transactionQueryBySessionRequestSchema,
      responseSchema: transactionQueryBySessionResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  transactionQueryByTranId(input, options) {
    return callGet({
      context,
      transport: context.transport,
      endpoint: TRANSACTION_PATH,
      requestSchema: transactionQueryByTranIdRequestSchema,
      responseSchema: transactionQueryByTranIdResponseSchema,
      requestPayload: withAuth(context, input),
      options,
    });
  },

  parseIpnPayload(payload) {
    return parseWithSchema({
      schema: ipnPayloadSchema,
      payload,
      stage: "request",
      endpoint: "ipn/payload",
    });
  },
});
