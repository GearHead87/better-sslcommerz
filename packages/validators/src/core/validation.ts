import { z } from "zod/v4";

import {
  currencyCode,
  dateTimeString,
  decimalAmount,
  formatType,
  optionalString,
  requiredString,
} from "../shared/primitives";

export const orderValidationRequestSchema = z.object({
  val_id: requiredString("val_id", 50),
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  format: formatType,
  v: optionalString(1),
});

export const orderValidationResponseSchema = z.object({
  status: requiredString("status", 20),
  tran_date: dateTimeString,
  tran_id: requiredString("tran_id", 30),
  val_id: requiredString("val_id", 50),
  amount: decimalAmount,
  store_amount: decimalAmount,
  card_type: requiredString("card_type", 50),
  card_no: optionalString(80),
  currency: currencyCode,
  bank_tran_id: optionalString(80),
  card_issuer: optionalString(50),
  card_brand: optionalString(30),
  card_issuer_country: optionalString(50),
  card_issuer_country_code: optionalString(2),
  currency_type: currencyCode.optional(),
  currency_amount: decimalAmount.optional(),
  emi_instalment: optionalString(2),
  emi_amount: decimalAmount.optional(),
  discount_amount: decimalAmount.optional(),
  discount_percentage: decimalAmount.optional(),
  discount_remarks: optionalString(255),
  value_a: optionalString(255),
  value_b: optionalString(255),
  value_c: optionalString(255),
  value_d: optionalString(255),
  risk_level: z
    .string()
    .regex(/^\d$/, "risk_level must be a single digit")
    .optional(),
  risk_title: optionalString(50),
  currency_rate: optionalString(),
  base_fair: optionalString(),
  emi_description: optionalString(),
  emi_issuer: optionalString(),
  account_details: optionalString(),
  gw_version: optionalString(),
  APIConnect: optionalString(),
  validated_on: dateTimeString.optional(),
});

export type OrderValidationRequest = z.infer<
  typeof orderValidationRequestSchema
>;
export type OrderValidationResponse = z.infer<
  typeof orderValidationResponseSchema
>;
