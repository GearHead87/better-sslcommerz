import { z } from "zod/v4";

import {
  booleanInt,
  currencyCode,
  dateTimeString,
  decimalAmount,
  optionalString,
  requiredString,
} from "../shared/primitives";

export const ipnPayloadSchema = z.object({
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
  card_issuer: optionalString(100),
  card_brand: optionalString(30),
  card_issuer_country: optionalString(50),
  card_issuer_country_code: optionalString(2),
  currency_type: currencyCode.optional(),
  currency_amount: decimalAmount.optional(),
  value_a: optionalString(255),
  value_b: optionalString(255),
  value_c: optionalString(255),
  value_d: optionalString(255),
  currency_rate: optionalString(),
  base_fair: optionalString(),
  store_id: optionalString(30),
  verify_sign: optionalString(255),
  verify_key: optionalString(),
  risk_level: booleanInt.optional(),
  risk_title: optionalString(50),
  cus_fax: optionalString(20),
});

export type IpnPayload = z.infer<typeof ipnPayloadSchema>;
