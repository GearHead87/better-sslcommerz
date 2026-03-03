import { z } from "zod/v4";

import { optionalString, requiredString } from "../shared/primitives";

export const invoiceCancelRequestSchema = z.object({
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  refer: requiredString("refer", 30),
  invoice_id: requiredString("invoice_id", 50),
  action: z.literal("invoiceCancellation"),
});

export const invoiceCancelResponseSchema = z.object({
  APIConnect: optionalString(30),
  status: requiredString("status", 20),
  failedreason: optionalString(256),
  refer: optionalString(30),
  invoice_id: optionalString(50),
  payment_status: optionalString(20),
});

export type InvoiceCancelRequest = z.infer<typeof invoiceCancelRequestSchema>;
export type InvoiceCancelResponse = z.infer<typeof invoiceCancelResponseSchema>;
