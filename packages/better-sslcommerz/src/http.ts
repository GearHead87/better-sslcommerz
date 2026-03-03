import type {
  FetchLike,
  SslcommerzRequestOptions,
  SslcommerzTransport,
} from "./types";
import { SslcommerzHttpError } from "./errors";

export interface CreateHttpTransportOptions {
  baseUrl: string;
  fetchFn?: FetchLike;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

const toSearchParams = (input: Record<string, unknown>): URLSearchParams => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params.append(key, String(value));
      continue;
    }

    params.append(key, JSON.stringify(value));
  }

  return params;
};

const buildSignal = (
  timeoutMs: number,
  signal?: AbortSignal,
): {
  signal: AbortSignal;
  cleanup: () => void;
} => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
    },
  };
};

const parseUnknownJson = (text: string): unknown => {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const request = async (args: {
  fetchFn: FetchLike;
  baseUrl: string;
  method: "GET" | "POST";
  endpointPath: string;
  payload: Record<string, unknown>;
  timeoutMs: number;
  options?: SslcommerzRequestOptions;
}): Promise<unknown> => {
  const {
    fetchFn,
    baseUrl,
    method,
    endpointPath,
    payload,
    timeoutMs,
    options,
  } = args;

  const searchParams = toSearchParams(payload);
  const url =
    method === "GET"
      ? `${baseUrl}/${endpointPath}?${searchParams.toString()}`
      : `${baseUrl}/${endpointPath}`;

  const { signal, cleanup } = buildSignal(timeoutMs, options?.signal);

  try {
    const response = await fetchFn(url, {
      method,
      headers:
        method === "POST"
          ? {
              "Content-Type": "application/x-www-form-urlencoded",
            }
          : undefined,
      body: method === "POST" ? searchParams.toString() : undefined,
      signal,
    });

    const rawBody = await response.text();
    if (!response.ok) {
      throw new SslcommerzHttpError({
        endpoint: endpointPath,
        status: response.status,
        statusText: response.statusText,
        responseBody: rawBody,
      });
    }

    return parseUnknownJson(rawBody);
  } finally {
    cleanup();
  }
};

export const createHttpTransport = (
  options: CreateHttpTransportOptions,
): SslcommerzTransport => {
  const fetchFn = options.fetchFn ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    get(endpointPath, params, requestOptions) {
      return request({
        fetchFn,
        baseUrl: options.baseUrl,
        method: "GET",
        endpointPath,
        payload: params,
        timeoutMs,
        options: requestOptions,
      });
    },

    post(endpointPath, body, requestOptions) {
      return request({
        fetchFn,
        baseUrl: options.baseUrl,
        method: "POST",
        endpointPath,
        payload: body,
        timeoutMs,
        options: requestOptions,
      });
    },
  };
};
