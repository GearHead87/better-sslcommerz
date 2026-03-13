import { NextResponse } from "next/server";

import { sslcommerzClient } from "@/lib/sslcommerz";
import { getRequestPayload } from "@/lib/request";

export const GET = async (request: Request) => {
  try {
    const payload = await getRequestPayload(request);
    const valId = payload.val_id;
    if (!valId) {
      return NextResponse.json(
        { error: "val_id is required" },
        { status: 400 },
      );
    }

    const response = await sslcommerzClient.core.validateOrder({
      val_id: valId,
      format: "json",
    });

    return NextResponse.json({ validation: response });
  } catch (error) {
    console.error("SSLCommerz validation error", error);
    return NextResponse.json(
      { error: "Failed to validate payment" },
      { status: 500 },
    );
  }
};
