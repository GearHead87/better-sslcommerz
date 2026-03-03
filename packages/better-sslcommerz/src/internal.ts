import type {
  SslcommerzRequestOptions,
  SslcommerzRuntimeContext,
  SslcommerzTransport,
} from "./types";
import { SslcommerzValidationError } from "./errors";

interface SchemaLike<T> {
  parse(input: unknown): T;
}

const getIssues = (error: unknown): unknown => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  if (!("issues" in error)) {
    return undefined;
  }
  return (error as { issues?: unknown }).issues;
};

export const parseWithSchema = <T>(args: {
  schema: SchemaLike<T>;
  payload: unknown;
  stage: "request" | "response";
  endpoint: string;
}): T => {
  const { schema, payload, stage, endpoint } = args;
  try {
    return schema.parse(payload);
  } catch (error) {
    throw new SslcommerzValidationError({
      stage,
      endpoint,
      issues: getIssues(error),
      cause: error,
    });
  }
};

export const withAuth = <T extends Record<string, unknown>>(
  context: SslcommerzRuntimeContext,
  payload: T,
): T & { store_id: string; store_passwd: string } => ({
  ...payload,
  store_id: context.auth.store_id,
  store_passwd: context.auth.store_passwd,
});

const shouldValidateResponse = (
  context: SslcommerzRuntimeContext,
  options?: SslcommerzRequestOptions,
): boolean => options?.validateResponse ?? context.validateResponse;

export const callGet = async <
  TRequest extends Record<string, unknown>,
  TResponse,
>(args: {
  context: SslcommerzRuntimeContext;
  transport: SslcommerzTransport;
  endpoint: string;
  requestSchema: SchemaLike<TRequest>;
  responseSchema: SchemaLike<TResponse>;
  requestPayload: TRequest;
  options?: SslcommerzRequestOptions;
}): Promise<TResponse> => {
  const {
    context,
    transport,
    endpoint,
    requestSchema,
    responseSchema,
    requestPayload,
    options,
  } = args;

  const parsedRequest = parseWithSchema({
    schema: requestSchema,
    payload: requestPayload,
    stage: "request",
    endpoint,
  });

  const rawResponse = await transport.get(endpoint, parsedRequest, options);
  if (!shouldValidateResponse(context, options)) {
    return rawResponse as TResponse;
  }

  return parseWithSchema({
    schema: responseSchema,
    payload: rawResponse,
    stage: "response",
    endpoint,
  });
};

export const callPost = async <
  TRequest extends Record<string, unknown>,
  TResponse,
>(args: {
  context: SslcommerzRuntimeContext;
  transport: SslcommerzTransport;
  endpoint: string;
  requestSchema: SchemaLike<TRequest>;
  responseSchema: SchemaLike<TResponse>;
  requestPayload: TRequest;
  options?: SslcommerzRequestOptions;
}): Promise<TResponse> => {
  const {
    context,
    transport,
    endpoint,
    requestSchema,
    responseSchema,
    requestPayload,
    options,
  } = args;

  const parsedRequest = parseWithSchema({
    schema: requestSchema,
    payload: requestPayload,
    stage: "request",
    endpoint,
  });

  const rawResponse = await transport.post(endpoint, parsedRequest, options);
  if (!shouldValidateResponse(context, options)) {
    return rawResponse as TResponse;
  }

  return parseWithSchema({
    schema: responseSchema,
    payload: rawResponse,
    stage: "response",
    endpoint,
  });
};
