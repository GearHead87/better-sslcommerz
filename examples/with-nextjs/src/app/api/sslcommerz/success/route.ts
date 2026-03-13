import { NextResponse } from "next/server";

import { sslcommerzClient } from "@/lib/sslcommerz";
import { getRequestPayload } from "@/lib/request";

export const POST = async (request: Request) => {
  try {
    const payload = await getRequestPayload(request);
    console.log("SSLCommerz success callback", payload);

    if (!payload.val_id) {
      return NextResponse.json(
        { error: "val_id is required" },
        { status: 400 },
      );
    }

    const validation = await sslcommerzClient.core.validateOrder({
      val_id: payload.val_id,
      format: "json",
    });

    return NextResponse.json({ validation });
  } catch (error) {
    console.error("SSLCommerz success handler error", error);
    return NextResponse.json(
      { error: "Failed to handle success callback" },
      { status: 500 },
    );
  }
};
