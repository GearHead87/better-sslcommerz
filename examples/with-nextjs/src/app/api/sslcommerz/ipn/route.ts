import { NextResponse } from "next/server";

import { sslcommerzClient } from "@/lib/sslcommerz";
import { getRequestPayload } from "@/lib/request";

export const POST = async (request: Request) => {
  try {
    const payload = await getRequestPayload(request);
    const parsed = sslcommerzClient.general.parseIpnPayload(payload);
    console.log("SSLCommerz IPN received", parsed);

    const validation = await sslcommerzClient.general.validateOrder({
      val_id: parsed.val_id,
      format: "json",
    });
    console.log("SSLCommerz IPN validation", validation);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("SSLCommerz IPN error", error);
    return NextResponse.json(
      { error: "Invalid IPN payload" },
      { status: 400 },
    );
  }
};
