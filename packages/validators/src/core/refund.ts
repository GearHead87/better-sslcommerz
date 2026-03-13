import { z } from "zod/v4";

import {
  decimalAmount,
  formatType,
  optionalString,
  requiredString,
} from "../shared/primitives";

export const refundInitiateRequestSchema = z.object({
  bank_tran_id: requiredString("bank_tran_id", 80),
  refund_trans_id: requiredString("refund_trans_id", 30),
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  refund_amount: decimalAmount,
  refund_remarks: requiredString("refund_remarks", 255),
  refe_id: optionalString(50),
  format: formatType,
  v: optionalString(1),
});

export const refundInitiateResponseSchema = z.object({
  APIConnect: requiredString("APIConnect", 30),
  bank_tran_id: optionalString(80),
  trans_id: optionalString(30),
  refund_ref_id: optionalString(50),
  status: optionalString(30),
  errorReason: optionalString(255),
});

export const refundStatusRequestSchema = z.object({
  refund_ref_id: requiredString("refund_ref_id", 50),
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  format: formatType,
});

export const refundStatusResponseSchema = z.object({
  APIConnect: requiredString("APIConnect", 30),
  bank_tran_id: optionalString(80),
  tran_id: optionalString(30),
  refund_ref_id: optionalString(50),
  initiated_on: optionalString(),
  refunded_on: optionalString(),
  status: optionalString(30),
  errorReason: optionalString(255),
});

export type RefundInitiateRequest = z.infer<typeof refundInitiateRequestSchema>;
export type RefundInitiateResponse = z.infer<
  typeof refundInitiateResponseSchema
>;
export type RefundStatusRequest = z.infer<typeof refundStatusRequestSchema>;
export type RefundStatusResponse = z.infer<typeof refundStatusResponseSchema>;
