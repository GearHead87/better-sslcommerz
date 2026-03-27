import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const paymentSessionStatus = v.union(
  v.literal("pending"),
  v.literal("success"),
  v.literal("failed"),
  v.literal("cancelled"),
  v.literal("expired"),
);

export default defineSchema({
  paymentSessions: defineTable({
    tranId: v.string(),
    sessionKey: v.string(),
    gatewayUrl: v.string(),
    status: paymentSessionStatus,
    amount: v.string(),
    currency: v.string(),
    environment: v.union(v.literal("sandbox"), v.literal("live")),
    userId: v.optional(v.string()),
    orgId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    valId: v.optional(v.string()),
    bankTranId: v.optional(v.string()),
    cardType: v.optional(v.string()),
    storeAmount: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tran_id", ["tranId"])
    .index("by_session_key", ["sessionKey"])
    .index("by_status", ["status"])
    .index("by_user_id", ["userId"])
    .index("by_org_id", ["orgId"])
    .index("by_val_id", ["valId"]),

  transactions: defineTable({
    tranId: v.string(),
    valId: v.string(),
    status: v.string(),
    amount: v.string(),
    currency: v.string(),
    bankTranId: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    riskTitle: v.optional(v.string()),
    raw: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tran_id", ["tranId"])
    .index("by_val_id", ["valId"])
    .index("by_status", ["status"]),

  refunds: defineTable({
    refundRefId: v.string(),
    refundTransId: v.optional(v.string()),
    bankTranId: v.optional(v.string()),
    status: v.optional(v.string()),
    amount: v.optional(v.string()),
    initiatedOn: v.optional(v.string()),
    refundedOn: v.optional(v.string()),
    raw: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_refund_ref_id", ["refundRefId"])
    .index("by_refund_trans_id", ["refundTransId"])
    .index("by_bank_tran_id", ["bankTranId"])
    .index("by_status", ["status"]),

  invoices: defineTable({
    invoiceId: v.string(),
    refer: v.optional(v.string()),
    tranId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    payUrl: v.optional(v.string()),
    qrImageUrl: v.optional(v.string()),
    status: v.string(),
    raw: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_invoice_id", ["invoiceId"])
    .index("by_refer", ["refer"])
    .index("by_tran_id", ["tranId"])
    .index("by_payment_status", ["paymentStatus"]),

  ipnEvents: defineTable({
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
    verified: v.boolean(),
    rawPayload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tran_id", ["tranId"])
    .index("by_val_id", ["valId"])
    .index("by_status", ["status"]),
});
