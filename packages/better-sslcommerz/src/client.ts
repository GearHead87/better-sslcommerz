import type {
  CreateSslcommerzClientOptions,
  SslcommerzClient,
  SslcommerzEnvironment,
} from "./types";
import { createCoreApi } from "./endpoints/core";
import { createInvoiceApi } from "./endpoints/invoice";
import { createHttpTransport } from "./http";

const BASE_URLS: Record<SslcommerzEnvironment, string> = {
  sandbox: "https://sandbox.sslcommerz.com",
  live: "https://securepay.sslcommerz.com",
};

const normalizeBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const createSslcommerzClient = (
  options: CreateSslcommerzClientOptions,
): SslcommerzClient => {
  const environment = options.environment ?? "sandbox";
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? BASE_URLS[environment]);

  const transport = createHttpTransport({
    baseUrl,
    fetchFn: options.fetch,
    timeoutMs: options.timeoutMs,
  });

  const context = {
    auth: {
      store_id: options.storeId,
      store_passwd: options.storePasswd,
    },
    transport,
    validateResponse: options.validateResponse ?? false,
  } as const;

  return {
    environment,
    baseUrl,
    core: createCoreApi(context),
    invoice: createInvoiceApi(context),
  };
};
