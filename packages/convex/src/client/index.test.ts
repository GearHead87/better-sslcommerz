import type { HttpRouter } from "convex/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { registerRoutes, SslCommerzConvex } from "./index.js";
import { components } from "./setup.test.js";

const sslcommerzMock = vi.hoisted(() => {
  const createSession = vi.fn();
  const validateOrder = vi.fn();
  const refundInitiate = vi.fn();
  const refundStatus = vi.fn();
  const transactionQueryBySession = vi.fn();
  const transactionQueryByTranId = vi.fn();
  const createInvoice = vi.fn();
  const invoiceStatus = vi.fn();
  const invoiceCancel = vi.fn();

  return {
    createSession,
    validateOrder,
    refundInitiate,
    refundStatus,
    transactionQueryBySession,
    transactionQueryByTranId,
    createInvoice,
    invoiceStatus,
    invoiceCancel,
  };
});

const ipnPayloadParseMock = vi.hoisted(() =>
  vi.fn((payload: unknown) => payload),
);

vi.mock("@better-sslcommerz/sdk", () => {
  return {
    createSslcommerzClient: vi.fn(() => ({
      core: {
        createSession: sslcommerzMock.createSession,
        validateOrder: sslcommerzMock.validateOrder,
        refundInitiate: sslcommerzMock.refundInitiate,
        refundStatus: sslcommerzMock.refundStatus,
        transactionQueryBySession: sslcommerzMock.transactionQueryBySession,
        transactionQueryByTranId: sslcommerzMock.transactionQueryByTranId,
        parseIpnPayload: ipnPayloadParseMock,
      },
      invoice: {
        createInvoice: sslcommerzMock.createInvoice,
        invoiceStatus: sslcommerzMock.invoiceStatus,
        invoiceCancel: sslcommerzMock.invoiceCancel,
      },
    })),
    ipnPayloadSchema: {
      parse: ipnPayloadParseMock,
    },
  };
});

interface RouteDefinition {
  path: string;
  method: string;
  handler: (ctx: unknown, request: Request) => Promise<Response>;
}

const mustRoute = (
  byPath: Map<string, RouteDefinition>,
  path: string,
): RouteDefinition => {
  const route = byPath.get(path);
  if (!route) {
    throw new Error(`Missing route: ${path}`);
  }
  return route;
};

const registerTestRoutes = (config?: Parameters<typeof registerRoutes>[2]) => {
  const route = vi.fn();
  const http = { route } as unknown as HttpRouter;

  registerRoutes(http, components.sslcommerz, config, {
    storeId: "test_store",
    storePasswd: "test_pass",
    environment: "sandbox",
  });

  const routes = route.mock.calls.map((call) => call[0] as RouteDefinition);

  return {
    route,
    routes,
    byPath: new Map(routes.map((definition) => [definition.path, definition])),
  };
};

const buildFormRequest = (path: string, body: Record<string, string>) =>
  new Request(`https://example.com${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });

const buildRouteCtx = () => ({
  runQuery: vi
    .fn()
    .mockResolvedValue({ tranId: "tran_test", status: "pending" }),
  runMutation: vi.fn().mockResolvedValue(null),
  runAction: vi.fn(),
});

const mockValidationResponse = (tranId: string, valId: string) => {
  sslcommerzMock.validateOrder.mockResolvedValue({
    status: "VALID",
    tran_date: new Date().toISOString(),
    tran_id: tranId,
    val_id: valId,
    amount: "100",
    store_amount: "98",
    card_type: "VISA",
    currency: "BDT",
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  ipnPayloadParseMock.mockImplementation((payload: unknown) => payload);
});

describe("SslCommerzConvex client", () => {
  test("creates class with component api", () => {
    const client = new SslCommerzConvex(components.sslcommerz, {
      storeId: "test_store",
      storePasswd: "test_pass",
      environment: "sandbox",
    });

    expect(client).toBeDefined();
    expect(client.component).toBeDefined();
  });

  test("createPaymentSession writes session record", async () => {
    sslcommerzMock.createSession.mockResolvedValue({
      status: "SUCCESS",
      sessionkey: "sess_test",
      GatewayPageURL: "https://sandbox.sslcommerz.com/gw",
    });

    const runMutation = vi.fn().mockResolvedValue("session_doc_id");
    const ctx = {
      runQuery: vi.fn(),
      runMutation,
      runAction: vi.fn(),
    };

    const client = new SslCommerzConvex(components.sslcommerz, {
      storeId: "test_store",
      storePasswd: "test_pass",
      environment: "sandbox",
    });

    const result = await client.createPaymentSession(ctx, {
      tranId: "tran_test",
      totalAmount: 100,
      currency: "BDT",
      successUrl: "https://example.com/success",
      failUrl: "https://example.com/fail",
      cancelUrl: "https://example.com/cancel",
      customerInfo: {
        name: "Test User",
        email: "test@example.com",
        address1: "Dhaka",
        city: "Dhaka",
        postcode: "1207",
        country: "Bangladesh",
        phone: "01700000000",
      },
      productInfo: {
        name: "Premium",
        category: "Subscription",
        profile: "general",
      },
    });

    expect(result.tranId).toBe("tran_test");
    expect(result.sessionKey).toBe("sess_test");
    expect(runMutation).toHaveBeenCalledWith(
      components.sslcommerz.public.createPaymentSessionRecord,
      expect.objectContaining({
        tranId: "tran_test",
        sessionKey: "sess_test",
      }),
    );
  });

  test("validateOrder upserts transaction and syncs session", async () => {
    sslcommerzMock.validateOrder.mockResolvedValue({
      status: "VALID",
      tran_date: new Date().toISOString(),
      tran_id: "tran_1",
      val_id: "val_1",
      amount: "100",
      store_amount: "98",
      card_type: "VISA",
      currency: "BDT",
    });

    const runMutation = vi.fn().mockResolvedValue(null);
    const ctx = {
      runQuery: vi.fn(),
      runMutation,
      runAction: vi.fn(),
    };

    const client = new SslCommerzConvex(components.sslcommerz, {
      storeId: "test_store",
      storePasswd: "test_pass",
      environment: "sandbox",
    });

    await client.validateOrder(ctx, { val_id: "val_1" });

    expect(runMutation).toHaveBeenCalledWith(
      components.sslcommerz.public.upsertTransactionFromValidation,
      expect.objectContaining({
        tranId: "tran_1",
        valId: "val_1",
      }),
    );
    expect(runMutation).toHaveBeenCalledWith(
      components.sslcommerz.internal.syncPaymentSessionFromGateway,
      expect.objectContaining({
        tranId: "tran_1",
        valId: "val_1",
      }),
    );
  });
});

describe("registerRoutes", () => {
  test("registerRoutes function is exported", () => {
    expect(typeof registerRoutes).toBe("function");
  });

  test("registerRoutes registers four POST routes", () => {
    const { route } = registerTestRoutes();

    expect(route).toHaveBeenCalledTimes(4);
    const paths = route.mock.calls.map(
      (call) => (call[0] as { path: string }).path,
    );
    expect(paths).toContain("/sslcommerz/ipn");
    expect(paths).toContain("/sslcommerz/success");
    expect(paths).toContain("/sslcommerz/fail");
    expect(paths).toContain("/sslcommerz/cancel");
  });

  test("ipn route records and verifies payload then runs callback", async () => {
    mockValidationResponse("tran_ipn", "val_ipn");
    const onIpn = vi.fn().mockResolvedValue(undefined);
    const { byPath } = registerTestRoutes({ onIpn });
    const ipnRoute = mustRoute(byPath, "/sslcommerz/ipn");

    const ctx = buildRouteCtx();
    const request = buildFormRequest("/sslcommerz/ipn", {
      tran_id: "tran_ipn",
      val_id: "val_ipn",
      status: "VALID",
      amount: "100",
      store_amount: "98",
      currency: "BDT",
      card_type: "VISA",
    });

    const response = await ipnRoute.handler(ctx, request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });

    expect(ctx.runMutation).toHaveBeenCalledWith(
      components.sslcommerz.internal.recordIpnEvent,
      expect.objectContaining({
        tranId: "tran_ipn",
        valId: "val_ipn",
        verified: false,
      }),
    );
    expect(sslcommerzMock.validateOrder).toHaveBeenCalledWith({
      val_id: "val_ipn",
    });
    expect(ctx.runMutation).toHaveBeenCalledWith(
      components.sslcommerz.internal.markIpnVerified,
      { valId: "val_ipn" },
    );
    expect(onIpn).toHaveBeenCalledTimes(1);
    expect(onIpn).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ tran_id: "tran_ipn", val_id: "val_ipn" }),
      expect.objectContaining({ tranId: "tran_test" }),
    );
  });

  test("ipn route returns 400 when parse fails", async () => {
    ipnPayloadParseMock.mockImplementationOnce(() => {
      throw new Error("invalid payload");
    });
    const { byPath } = registerTestRoutes();
    const ipnRoute = mustRoute(byPath, "/sslcommerz/ipn");

    const ctx = buildRouteCtx();
    const request = buildFormRequest("/sslcommerz/ipn", {
      tran_id: "tran_bad",
      val_id: "val_bad",
      status: "BAD",
      amount: "0",
      store_amount: "0",
      currency: "BDT",
      card_type: "VISA",
    });

    const response = await ipnRoute.handler(ctx, request);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid IPN payload");
    expect(ctx.runMutation).not.toHaveBeenCalled();
    expect(sslcommerzMock.validateOrder).not.toHaveBeenCalled();
  });

  test("success route updates session, validates and redirects", async () => {
    mockValidationResponse("tran_success", "val_success");
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const { byPath } = registerTestRoutes({
      onSuccess,
      successRedirectUrl: "https://app.example/success",
    });
    const successRoute = mustRoute(byPath, "/sslcommerz/success");

    const ctx = buildRouteCtx();
    const request = buildFormRequest("/sslcommerz/success", {
      tran_id: "tran_success",
      val_id: "val_success",
    });

    const response = await successRoute.handler(ctx, request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://app.example/success",
    );

    expect(ctx.runMutation).toHaveBeenCalledWith(
      components.sslcommerz.internal.setPaymentSessionStatus,
      {
        tranId: "tran_success",
        status: "success",
        valId: "val_success",
      },
    );
    expect(sslcommerzMock.validateOrder).toHaveBeenCalledWith({
      val_id: "val_success",
    });
    expect(onSuccess).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ tranId: "tran_test" }),
    );
  });

  test("fail route updates session and redirects", async () => {
    const onFail = vi.fn().mockResolvedValue(undefined);
    const { byPath } = registerTestRoutes({
      onFail,
      failRedirectUrl: "https://app.example/fail",
    });
    const failRoute = mustRoute(byPath, "/sslcommerz/fail");

    const ctx = buildRouteCtx();
    const request = buildFormRequest("/sslcommerz/fail", {
      tran_id: "tran_fail",
    });

    const response = await failRoute.handler(ctx, request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://app.example/fail");
    expect(ctx.runMutation).toHaveBeenCalledWith(
      components.sslcommerz.internal.setPaymentSessionStatus,
      {
        tranId: "tran_fail",
        status: "failed",
      },
    );
    expect(onFail).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ tranId: "tran_test" }),
    );
  });

  test("cancel route updates session and redirects", async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    const { byPath } = registerTestRoutes({
      onCancel,
      cancelRedirectUrl: "https://app.example/cancel",
    });
    const cancelRoute = mustRoute(byPath, "/sslcommerz/cancel");

    const ctx = buildRouteCtx();
    const request = buildFormRequest("/sslcommerz/cancel", {
      tran_id: "tran_cancel",
    });

    const response = await cancelRoute.handler(ctx, request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://app.example/cancel");
    expect(ctx.runMutation).toHaveBeenCalledWith(
      components.sslcommerz.internal.setPaymentSessionStatus,
      {
        tranId: "tran_cancel",
        status: "cancelled",
      },
    );
    expect(onCancel).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ tranId: "tran_test" }),
    );
  });
});
