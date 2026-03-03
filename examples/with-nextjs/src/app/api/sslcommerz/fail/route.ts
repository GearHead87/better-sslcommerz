import { NextResponse } from "next/server";

import { getRequestPayload } from "@/lib/request";

export const POST = async (request: Request) => {
  const payload = await getRequestPayload(request);
  console.log("SSLCommerz failure callback", payload);
  return NextResponse.json({ received: true });
};
