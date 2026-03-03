import { z } from "zod/v4";

import {
  booleanInt,
  currencyCode,
  decimalAmount,
  integerString,
  optionalString,
  optionalUrlString,
  requiredString,
  stringBoolean,
  urlString,
} from "../shared/primitives";

const productProfileEnum = z.enum([
  "telecom-vertical",
  "travel-vertical",
  "airline-tickets",
  "non-physical-goods",
  "physical-goods",
  "general",
]);

const shippingMethodEnum = z.enum([
  "YES",
  "NO",
  "Courier",
  "SSLCOMMERZ_LOGISTIC",
]);

const createSessionBaseSchema = z.object({
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  total_amount: decimalAmount,
  currency: currencyCode,
  tran_id: requiredString("tran_id", 30),
  success_url: urlString,
  fail_url: urlString,
  cancel_url: urlString,
  ipn_url: optionalUrlString,
  product_category: requiredString("product_category", 50),
  product_name: requiredString("product_name", 255),
  product_profile: productProfileEnum,
  cus_name: requiredString("cus_name", 50),
  cus_email: requiredString("cus_email", 50).email("Invalid email"),
  cus_add1: requiredString("cus_add1", 50),
  cus_add2: optionalString(50),
  cus_city: requiredString("cus_city", 50),
  cus_state: optionalString(50),
  cus_postcode: requiredString("cus_postcode", 30),
  cus_country: requiredString("cus_country", 50),
  cus_phone: requiredString("cus_phone", 20),
  cus_fax: optionalString(20),
  multi_card_name: optionalString(30),
  allowed_bin: optionalString(255),
  emi_option: booleanInt.optional(),
  emi_max_inst_option: integerString.optional(),
  emi_selected_inst: integerString.optional(),
  emi_allow_only: booleanInt.optional(),
  shipping_method: shippingMethodEnum,
  num_of_item: integerString.optional(),
  weight_of_items: decimalAmount.optional(),
  ship_name: optionalString(50),
  ship_add1: optionalString(50),
  ship_add2: optionalString(50),
  ship_area: optionalString(50),
  ship_city: optionalString(50),
  ship_sub_city: optionalString(50),
  ship_state: optionalString(50),
  ship_postcode: optionalString(50),
  ship_country: optionalString(50),
  logistic_pickup_id: optionalString(50),
  logistic_delivery_type: optionalString(50),
  cart: z.array(z.record(z.string(), z.string())).optional(),
  product_amount: decimalAmount.optional(),
  vat: decimalAmount.optional(),
  discount_amount: decimalAmount.optional(),
  convenience_fee: decimalAmount.optional(),
  value_a: optionalString(255),
  value_b: optionalString(255),
  value_c: optionalString(255),
  value_d: optionalString(255),
  hours_till_departure: optionalString(30),
  flight_type: optionalString(30),
  pnr: optionalString(50),
  journey_from_to: optionalString(255),
  third_party_booking: optionalString(20),
  hotel_name: optionalString(255),
  length_of_stay: optionalString(30),
  check_in_time: optionalString(30),
  hotel_city: optionalString(50),
  product_type: optionalString(30),
  topup_number: optionalString(150),
  country_topup: optionalString(30),
});

export const createSessionRequestSchema = createSessionBaseSchema.superRefine(
  (data, ctx) => {
    if (data.emi_option === "1" || data.emi_option === 1) {
      if (!data.emi_max_inst_option) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["emi_max_inst_option"],
          message: "emi_max_inst_option is required when emi_option=1",
        });
      }
    }

    if (data.shipping_method === "YES") {
      const requiredFields = [
        "ship_name",
        "ship_add1",
        "ship_area",
        "ship_city",
        "ship_sub_city",
        "ship_postcode",
        "ship_country",
      ] as const;
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when shipping_method=YES`,
          });
        }
      }
    }

    if (data.shipping_method === "SSLCOMMERZ_LOGISTIC") {
      const requiredFields = [
        "num_of_item",
        "weight_of_items",
        "logistic_pickup_id",
        "logistic_delivery_type",
        "ship_name",
        "ship_add1",
        "ship_area",
        "ship_city",
        "ship_sub_city",
        "ship_postcode",
        "ship_country",
      ] as const;
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when shipping_method=SSLCOMMERZ_LOGISTIC`,
          });
        }
      }
    }

    if (data.product_profile === "airline-tickets") {
      const requiredFields = [
        "hours_till_departure",
        "flight_type",
        "pnr",
        "journey_from_to",
        "third_party_booking",
      ] as const;
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when product_profile=airline-tickets`,
          });
        }
      }
    }

    if (data.product_profile === "travel-vertical") {
      const requiredFields = [
        "hotel_name",
        "length_of_stay",
        "check_in_time",
        "hotel_city",
      ] as const;
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when product_profile=travel-vertical`,
          });
        }
      }
    }

    if (data.product_profile === "telecom-vertical") {
      const requiredFields = [
        "product_type",
        "topup_number",
        "country_topup",
      ] as const;
      for (const field of requiredFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when product_profile=telecom-vertical`,
          });
        }
      }
    }
  },
);

export const createSessionResponseSchema = z.object({
  status: requiredString("status", 10),
  failedreason: optionalString(255),
  sessionkey: optionalString(50),
  gw: z.record(z.string(), z.unknown()).optional(),
  GatewayPageURL: optionalString(255),
  redirectGatewayURL: optionalString(),
  redirectGatewayURLFailed: optionalString(),
  directPaymentURLBank: optionalString(),
  directPaymentURLCard: optionalString(),
  directPaymentURL: optionalString(),
  storeBanner: optionalString(255),
  storeLogo: optionalString(255),
  desc: z.array(z.unknown()).optional(),
  is_direct_pay_enable: stringBoolean.optional(),
});

export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
