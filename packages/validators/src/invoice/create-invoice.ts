import { z } from "zod/v4";

import {
  booleanInt,
  currencyCode,
  decimalAmount,
  integerString,
  optionalString,
  optionalUrlString,
  requiredString,
  yesNoString,
} from "../shared/primitives";

const productProfileEnum = z.enum([
  "telecom-vertical",
  "travel-vertical",
  "airline-tickets",
  "non-physical-goods",
  "physical-goods",
  "general",
]);

const shippingMethodEnum = z.enum(["YES", "NO", "Courier"]);

const createInvoiceBaseSchema = z.object({
  store_id: requiredString("store_id", 30),
  store_passwd: requiredString("store_passwd", 30),
  refer: requiredString("refer", 30),
  total_amount: decimalAmount,
  currency: currencyCode,
  tran_id: requiredString("tran_id", 30),
  acct_no: requiredString("acct_no", 50),
  product_category: requiredString("product_category", 50),
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
  shipping_method: shippingMethodEnum,
  num_of_item: integerString,
  ship_name: optionalString(50),
  ship_add1: optionalString(50),
  ship_add2: optionalString(50),
  ship_city: optionalString(50),
  ship_state: optionalString(50),
  ship_postcode: optionalString(50),
  ship_country: optionalString(50),
  product_name: requiredString("product_name", 255),
  product_profile: productProfileEnum,
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
  cart: z.array(z.record(z.string(), z.string())).optional(),
  product_amount: decimalAmount.optional(),
  vat: decimalAmount.optional(),
  discount_amount: decimalAmount.optional(),
  convenience_fee: decimalAmount.optional(),
  is_bangla_qr_enabled: yesNoString.optional(),
  is_sent_email: yesNoString.optional(),
  is_sent_sms: yesNoString.optional(),
  ipn_url: optionalUrlString,
  emi_option: booleanInt.optional(),
  emi_max_inst_option: integerString.optional(),
  emi_selected_inst: integerString.optional(),
  emi_allow_only: booleanInt.optional(),
  value_a: optionalString(255),
  value_b: optionalString(255),
  value_c: optionalString(255),
  value_d: optionalString(255),
});

export const createInvoiceRequestSchema = createInvoiceBaseSchema.superRefine(
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
        "num_of_item",
        "ship_name",
        "ship_add1",
        "ship_city",
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

    if (data.shipping_method === "NO") {
      if (data.num_of_item) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["num_of_item"],
          message: "num_of_item must be omitted when shipping_method=NO",
        });
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

export const createInvoiceResponseSchema = z.object({
  status: requiredString("status", 10),
  error_reason: optionalString(255),
  invoice_refer: optionalString(50),
  pay_url: optionalString(256),
  qr_image_url: optionalString(),
  qr_image_pay_url: optionalString(255),
  invoice_id: optionalString(50),
  email_sending_status: optionalString(20),
  sms_sending_status: optionalString(20),
  bangla_qr_code: optionalString(500),
});

export type CreateInvoiceRequest = z.infer<typeof createInvoiceRequestSchema>;
export type CreateInvoiceResponse = z.infer<typeof createInvoiceResponseSchema>;
