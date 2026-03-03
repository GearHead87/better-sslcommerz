import { createSslcommerzClient } from "@better-sslcommerz/better-sslcommerz";

import { env } from "@/env";

export const sslcommerzClient = createSslcommerzClient({
  storeId: env.SSLCOMMERZ_STORE_ID,
  storePasswd: env.SSLCOMMERZ_STORE_PASSWD,
  environment: env.SSLCOMMERZ_ENVIRONMENT,
  validateResponse: env.SSLCOMMERZ_VALIDATE_RESPONSE,
});
