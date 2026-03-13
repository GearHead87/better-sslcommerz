import { NextResponse } from "next/server";

import { env } from "@/env";
import { products } from "@/lib/products";
import { getRequestPayload } from "@/lib/request";
import { sslcommerzClient } from "@/lib/sslcommerz";

export const POST = async (request: Request) => {
  try {
    const payload = await getRequestPayload(request);
    const selected = products.find(
      (product) => product.id === payload.productId,
    );
    if (!selected) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const tranId = `TXN-${Date.now()}`;
    const cartSummary = [
      {
        product: selected.name,
        amount: selected.price.toFixed(2),
        quantity: "1",
      },
    ];
    const response = await sslcommerzClient.core.createSession({
      total_amount: selected.price.toFixed(2),
      currency: "BDT",
      tran_id: tranId,
      success_url: `${env.APP_BASE_URL}/api/sslcommerz/success`,
      fail_url: `${env.APP_BASE_URL}/api/sslcommerz/fail`,
      cancel_url: `${env.APP_BASE_URL}/api/sslcommerz/cancel`,
      ipn_url: `${env.APP_BASE_URL}/api/sslcommerz/ipn`,
      product_category: selected.category,
      product_name: selected.name,
      product_profile: "general",
      cus_name: "Demo Customer",
      cus_email: "demo.customer@example.com",
      cus_add1: "House 12, Road 3",
      cus_city: "Dhaka",
      cus_postcode: "1207",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
      shipping_method: "NO",
      num_of_item: "1",
      cart: cartSummary,
      value_a: selected.id,
    });

    const gatewayUrl = response.GatewayPageURL ?? response.redirectGatewayURL;
    if (gatewayUrl) {
      return NextResponse.redirect(gatewayUrl);
    }

    return NextResponse.json({ gatewayUrl, session: response });
  } catch (error) {
    console.error("Failed to create SSLCommerz session", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
};
