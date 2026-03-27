import { v } from "convex/values";

import { mutation } from "./_generated/server.js";

const paymentSessionStatus = v.union(
  v.literal("pending"),
  v.literal("success"),
  v.literal("failed"),
  v.literal("cancelled"),
  v.literal("expired"),
);

const mapGatewayStatusToSessionStatus = (status: string) => {
  const normalized = status.trim().toUpperCase();

  if (normalized === "VALID" || normalized === "VALIDATED" || normalized === "SUCCESS") {
    return "success" as const;
  }

  if (normalized === "FAILED") {
    return "failed" as const;
  }

  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "cancelled" as const;
  }

  return "pending" as const;
};

export const recordIpnEvent = mutation({
  args: {
    tranId: v.string(),
    valId: v.string(),
    status: v.string(),
    amount: v.string(),
    storeAmount: v.string(),
    currency: v.string(),
    bankTranId: v.optional(v.string()),
    cardType: v.string(),
    cardNo: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    riskTitle: v.optional(v.string()),
    rawPayload: v.any(),
    verified: v.boolean(),
  },
  returns: v.id("ipnEvents"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("ipnEvents")
      .withIndex("by_val_id", (q) => q.eq("valId", args.valId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tranId: args.tranId,
        status: args.status,
        amount: args.amount,
        storeAmount: args.storeAmount,
        currency: args.currency,
        bankTranId: args.bankTranId,
        cardType: args.cardType,
        cardNo: args.cardNo,
        riskLevel: args.riskLevel,
        riskTitle: args.riskTitle,
        rawPayload: args.rawPayload,
        verified: args.verified,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("ipnEvents", {
      tranId: args.tranId,
      valId: args.valId,
      status: args.status,
      amount: args.amount,
      storeAmount: args.storeAmount,
      currency: args.currency,
      bankTranId: args.bankTranId,
      cardType: args.cardType,
      cardNo: args.cardNo,
      riskLevel: args.riskLevel,
      riskTitle: args.riskTitle,
      rawPayload: args.rawPayload,
      verified: args.verified,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const markIpnVerified = mutation({
  args: {
    valId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("ipnEvents")
      .withIndex("by_val_id", (q) => q.eq("valId", args.valId))
      .first();

    if (!event) {
      return null;
    }

    await ctx.db.patch(event._id, {
      verified: true,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const syncPaymentSessionFromGateway = mutation({
  args: {
    tranId: v.string(),
    gatewayStatus: v.string(),
    valId: v.optional(v.string()),
    bankTranId: v.optional(v.string()),
    cardType: v.optional(v.string()),
    storeAmount: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_tran_id", (q) => q.eq("tranId", args.tranId))
      .first();

    if (!session) {
      return null;
    }

    const status = mapGatewayStatusToSessionStatus(args.gatewayStatus);

    await ctx.db.patch(session._id, {
      status,
      valId: args.valId,
      bankTranId: args.bankTranId,
      cardType: args.cardType,
      storeAmount: args.storeAmount,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const setPaymentSessionStatus = mutation({
  args: {
    tranId: v.string(),
    status: paymentSessionStatus,
    valId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_tran_id", (q) => q.eq("tranId", args.tranId))
      .first();

    if (!session) {
      return null;
    }

    await ctx.db.patch(session._id, {
      status: args.status,
      valId: args.valId,
      updatedAt: Date.now(),
    });

    return null;
  },
});
