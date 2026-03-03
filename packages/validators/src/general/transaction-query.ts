import { z } from "zod/v4";

import {
  formatType,
  optionalString,
  requiredString,
} from "../shared/primitives";
import { transactionBaseSchema } from "../shared/transaction";

export const transactionQueryBySessionRequestSchema = z.object({
  sessionkey: requiredString("sessionkey", 50),
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  format: formatType,
});

export const transactionQueryBySessionResponseSchema = transactionBaseSchema
  .extend({
    APIConnect: optionalString(30),
    sessionkey: optionalString(50),
  })
  .omit({ status: true })
  .extend({ status: requiredString("status", 20) });

export const transactionQueryByTranIdRequestSchema = z.object({
  tran_id: requiredString("tran_id", 50),
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  format: formatType,
});

export const transactionQueryByTranIdResponseSchema = z.object({
  APIConnect: optionalString(30),
  no_of_trans_found: optionalString(2),
  element: z
    .array(
      transactionBaseSchema.extend({
        bank_gw: optionalString(),
        error: optionalString(255),
      }),
    )
    .optional(),
});

export type TransactionQueryBySessionRequest = z.infer<
  typeof transactionQueryBySessionRequestSchema
>;
export type TransactionQueryBySessionResponse = z.infer<
  typeof transactionQueryBySessionResponseSchema
>;
export type TransactionQueryByTranIdRequest = z.infer<
  typeof transactionQueryByTranIdRequestSchema
>;
export type TransactionQueryByTranIdResponse = z.infer<
  typeof transactionQueryByTranIdResponseSchema
>;
