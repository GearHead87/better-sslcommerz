import { convexTest } from "convex-test";
import { expect, test } from "vitest";

import { api } from "./_generated/api.js";
import schema from "./schema.js";
import { modules } from "./setup.test.js";

test("create and fetch payment session", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.public.createPaymentSessionRecord, {
    tranId: "tran_1",
    sessionKey: "sess_1",
    gatewayUrl: "https://sandbox.sslcommerz.com/gw",
    amount: "100",
    currency: "BDT",
    environment: "sandbox",
    userId: "user_1",
    orgId: "org_1",
    metadata: { orderId: "order_1" },
  });

  const session = await t.query(api.public.getPaymentSession, {
    tranId: "tran_1",
  });

  expect(session).not.toBeNull();
  expect(session?.tranId).toBe("tran_1");
  expect(session?.status).toBe("pending");
  expect(session?.userId).toBe("user_1");
});

test("ipn event idempotency by valId", async () => {
  const t = convexTest(schema, modules);

  const firstId = await t.mutation(api.internal.recordIpnEvent, {
    tranId: "tran_2",
    valId: "val_2",
    status: "VALID",
    amount: "250",
    storeAmount: "245",
    currency: "BDT",
    cardType: "VISA",
    rawPayload: { tran_id: "tran_2", val_id: "val_2" },
    verified: false,
  });

  const secondId = await t.mutation(api.internal.recordIpnEvent, {
    tranId: "tran_2",
    valId: "val_2",
    status: "VALIDATED",
    amount: "250",
    storeAmount: "245",
    currency: "BDT",
    cardType: "VISA",
    rawPayload: { tran_id: "tran_2", val_id: "val_2", update: true },
    verified: true,
  });

  expect(firstId).toBe(secondId);

  const ipn = await t.query(api.public.getIpnEventByValId, {
    valId: "val_2",
  });

  expect(ipn).not.toBeNull();
  expect(ipn?.status).toBe("VALIDATED");
  expect(ipn?.verified).toBe(true);
});

test("sync payment session from gateway status", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.public.createPaymentSessionRecord, {
    tranId: "tran_3",
    sessionKey: "sess_3",
    gatewayUrl: "https://sandbox.sslcommerz.com/gw",
    amount: "500",
    currency: "BDT",
    environment: "sandbox",
  });

  await t.mutation(api.internal.syncPaymentSessionFromGateway, {
    tranId: "tran_3",
    gatewayStatus: "VALID",
    valId: "val_3",
    bankTranId: "bank_3",
    cardType: "MASTERCARD",
    storeAmount: "490",
  });

  const session = await t.query(api.public.getPaymentSession, {
    tranId: "tran_3",
  });

  expect(session?.status).toBe("success");
  expect(session?.valId).toBe("val_3");
  expect(session?.bankTranId).toBe("bank_3");
});
