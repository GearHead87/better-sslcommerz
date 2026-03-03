import { z } from "zod/v4";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;

export const requiredString = (label: string, max?: number) => {
  let schema = z.string().min(1, `${label} is required`);
  if (max) {
    schema = schema.max(max, `${label} must be at most ${max} characters`);
  }
  return schema;
};

export const optionalString = (max?: number) => {
  let schema = z.string();
  if (max) {
    schema = schema.max(max, `Must be at most ${max} characters`);
  }
  return schema.optional();
};

export const stringBoolean = z.union([
  z.literal("1"),
  z.literal("0"),
  z.literal("yes"),
  z.literal("no"),
  z.literal("YES"),
  z.literal("NO"),
]);

export const booleanInt = z.union([
  z.literal("1"),
  z.literal("0"),
  z.literal(1),
  z.literal(0),
]);

export const yesNoString = z.union([
  z.literal("yes"),
  z.literal("no"),
  z.literal("YES"),
  z.literal("NO"),
]);

export const currencyCode = requiredString("currency", 3).regex(
  /^[A-Z]{3}$/,
  "currency must be a 3-letter code",
);

export const decimalAmount = z.union([
  z
    .string()
    .min(1, "amount is required")
    .regex(decimalPattern, "amount must be a decimal with up to 2 places"),
  z
    .number()
    .refine(
      (value) =>
        Number.isFinite(value) && decimalPattern.test(value.toFixed(2)),
      "amount must be a decimal with up to 2 places",
    ),
]);

export const integerString = z.union([
  z.string().regex(/^\d+$/, "value must be an integer"),
  z.number().int("value must be an integer"),
]);

export const urlString = requiredString("url").url("Invalid URL");

export const optionalUrlString = z.string().url("Invalid URL").optional();

export const dateTimeString = z
  .string()
  .min(1, "datetime is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid datetime",
  });

export const formatType = z.enum(["json", "xml"]).optional();
