/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { expect, test } from "vitest";

import schema from "./schema.js";

export const modules = import.meta.glob("./**/*.ts");

export function initConvexTest() {
  return convexTest(schema, modules);
}

test("setup", () => {
  expect(true).toBe(true);
});
