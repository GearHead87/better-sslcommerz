export class SslcommerzError extends Error {
  public readonly code: string;

  public constructor(
    message: string,
    code = "SSL_COMMERZ_ERROR",
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "SslcommerzError";
    this.code = code;
  }
}

export class SslcommerzValidationError extends SslcommerzError {
  public readonly stage: "request" | "response";
  public readonly endpoint: string;
  public readonly issues: unknown;

  public constructor(args: {
    stage: "request" | "response";
    endpoint: string;
    issues: unknown;
    cause?: unknown;
  }) {
    const { stage, endpoint, issues, cause } = args;
    super(
      `Validation failed for ${stage} at ${endpoint}`,
      "SSL_COMMERZ_VALIDATION_ERROR",
      cause,
    );
    this.name = "SslcommerzValidationError";
    this.stage = stage;
    this.endpoint = endpoint;
    this.issues = issues;
  }
}

export class SslcommerzHttpError extends SslcommerzError {
  public readonly endpoint: string;
  public readonly status: number;
  public readonly statusText: string;
  public readonly responseBody: string;

  public constructor(args: {
    endpoint: string;
    status: number;
    statusText: string;
    responseBody: string;
    cause?: unknown;
  }) {
    const { endpoint, status, statusText, responseBody, cause } = args;
    super(
      `HTTP ${status} ${statusText} from ${endpoint}`,
      "SSL_COMMERZ_HTTP_ERROR",
      cause,
    );
    this.name = "SslcommerzHttpError";
    this.endpoint = endpoint;
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}
