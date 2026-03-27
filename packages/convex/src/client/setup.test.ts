/// <reference types="vite/client" />

import {
  componentsGeneric,
  defineSchema,
} from "convex/server";
import type { GenericSchema, SchemaDefinition } from "convex/server";
import { convexTest } from "convex-test";
import { expect, test } from "vitest";

import type { ComponentApi } from "../component/_generated/component.js";
import { register } from "../test.js";

export const modules = import.meta.glob("./**/*.ts");

export function initConvexTest<
  Schema extends SchemaDefinition<GenericSchema, boolean>,
>(schema?: Schema) {
  const t = convexTest(schema ?? defineSchema({}), modules);
  register(t);
  return t;
}

export const components = componentsGeneric() as unknown as {
  sslcommerz: ComponentApi;
};

test("setup", () => {
  expect(true).toBe(true);
});
