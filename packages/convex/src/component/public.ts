import { v } from "convex/values";

import { mutation, query } from "./_generated/server.js";
import schema from "./schema.js";

const paymentSessionValidator = schema.tables.paymentSessions.validator;
const transactionValidator = schema.tables.transactions.validator;
const refundValidator = schema.tables.refunds.validator;
const invoiceValidator = schema.tables.invoices.validator;
const ipnEventValidator = schema.tables.ipnEvents.validator;

const paymentSessionStatus = paymentSessionValidator.fields.status;

const omitSystemFields = <
  T extends { _id: string; _creationTime: number } | null | undefined,
>(
  doc: T,
) => {
  if (!doc) {
    return doc;
  }

  const { _id, _creationTime, ...rest } = doc;
  return rest;
};

export const getPaymentSession = query({
  args: {
    tranId: v.string(),
  },
  returns: v.union(paymentSessionValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_tran_id", (q) => q.eq("tranId", args.tranId))
      .first();

    return omitSystemFields(session);
  },
});

export const getPaymentSessionBySessionKey = query({
  args: {
    sessionKey: v.string(),
  },
  returns: v.union(paymentSessionValidator, v.null()),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("paymentSessions")
      .withIndex("by_session_key", (q) => q.eq("sessionKey", args.sessionKey))
      .first();

    return omitSystemFields(session);
  },
});

export const listPaymentSessionsByStatus = query({
  args: {
    status: paymentSessionStatus,
  },
  returns: v.array(paymentSessionValidator),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("paymentSessions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return sessions.map(omitSystemFields);
  },
});

export const listPaymentSessionsByUserId = query({
  args: {
    userId: v.string(),
  },
  returns: v.array(paymentSessionValidator),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("paymentSessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    return sessions.map(omitSystemFields);
  },
});

export const listPaymentSessionsByOrgId = query({
  args: {
    orgId: v.string(),
  },
  returns: v.array(paymentSessionValidator),
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("paymentSessions")
      .withIndex("by_org_id", (q) => q.eq("orgId", args.orgId))
      .collect();

    return sessions.map(omitSystemFields);
  },
});

export const getTransactionByValId = query({
  args: {
    valId: v.string(),
  },
  returns: v.union(transactionValidator, v.null()),
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_val_id", (q) => q.eq("valId", args.valId))
      .first();

    return omitSystemFields(transaction);
  },
});

export const getTransactionByTranId = query({
  args: {
    tranId: v.string(),
  },
  returns: v.union(transactionValidator, v.null()),
  handler: async (ctx, args) => {
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_tran_id", (q) => q.eq("tranId", args.tranId))
      .first();

    return omitSystemFields(transaction);
  },
});

export const listTransactionsByStatus = query({
  args: {
    status: v.string(),
  },
  returns: v.array(transactionValidator),
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return transactions.map(omitSystemFields);
  },
});

export const getRefundByRefId = query({
  args: {
    refundRefId: v.string(),
  },
  returns: v.union(refundValidator, v.null()),
  handler: async (ctx, args) => {
    const refund = await ctx.db
      .query("refunds")
      .withIndex("by_refund_ref_id", (q) => q.eq("refundRefId", args.refundRefId))
      .first();

    return omitSystemFields(refund);
  },
});

export const listRefundsByStatus = query({
  args: {
    status: v.string(),
  },
  returns: v.array(refundValidator),
  handler: async (ctx, args) => {
    const refunds = await ctx.db
      .query("refunds")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    return refunds.map(omitSystemFields);
  },
});

export const getInvoiceById = query({
  args: {
    invoiceId: v.string(),
  },
  returns: v.union(invoiceValidator, v.null()),
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_invoice_id", (q) => q.eq("invoiceId", args.invoiceId))
      .first();

    return omitSystemFields(invoice);
  },
});

export const listInvoicesByPaymentStatus = query({
  args: {
    paymentStatus: v.string(),
  },
  returns: v.array(invoiceValidator),
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_payment_status", (q) =>
        q.eq("paymentStatus", args.paymentStatus),
      )
      .collect();

    return invoices.map(omitSystemFields);
  },
});

export const listIpnEventsByTranId = query({
  args: {
    tranId: v.string(),
  },
  returns: v.array(ipnEventValidator),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("ipnEvents")
      .withIndex("by_tran_id", (q) => q.eq("tranId", args.tranId))
      .collect();

    return events.map(omitSystemFields);
  },
});

export const getIpnEventByValId = query({
  args: {
    valId: v.string(),
  },
  returns: v.union(ipnEventValidator, v.null()),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("ipnEvents")
      .withIndex("by_val_id", (q) => q.eq("valId", args.valId))
      .first();

    return omitSystemFields(event);
  },
});

export const createPaymentSessionRecord = mutation({
  args: {
    tranId: v.string(),
    sessionKey: v.string(),
    gatewayUrl: v.string(),
    amount: v.string(),
    currency: v.string(),
    environment: paymentSessionValidator.fields.environment,
    userId: v.optional(v.string()),
    orgId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    expiresAt: v.optional(v.number()),
  },
  returns: v.id("paymentSessions"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("paymentSessions")
      .withIndex("by_tran_id", (q) => q.eq("tranId", args.tranId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sessionKey: args.sessionKey,
        gatewayUrl: args.gatewayUrl,
        amount: args.amount,
        currency: args.currency,
        environment: args.environment,
        userId: args.userId,
        orgId: args.orgId,
        metadata: args.metadata,
        expiresAt: args.expiresAt,
        status: "pending",
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("paymentSessions", {
      tranId: args.tranId,
      sessionKey: args.sessionKey,
      gatewayUrl: args.gatewayUrl,
      status: "pending",
      amount: args.amount,
      currency: args.currency,
      environment: args.environment,
      userId: args.userId,
      orgId: args.orgId,
      metadata: args.metadata,
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePaymentSessionStatus = mutation({
  args: {
    tranId: v.string(),
    status: paymentSessionStatus,
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

    await ctx.db.patch(session._id, {
      status: args.status,
      valId: args.valId,
      bankTranId: args.bankTranId,
      cardType: args.cardType,
      storeAmount: args.storeAmount,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const upsertTransactionFromValidation = mutation({
  args: {
    tranId: v.string(),
    valId: v.string(),
    status: v.string(),
    amount: v.string(),
    currency: v.string(),
    bankTranId: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    riskTitle: v.optional(v.string()),
    raw: v.any(),
  },
  returns: v.id("transactions"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_val_id", (q) => q.eq("valId", args.valId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tranId: args.tranId,
        status: args.status,
        amount: args.amount,
        currency: args.currency,
        bankTranId: args.bankTranId,
        riskLevel: args.riskLevel,
        riskTitle: args.riskTitle,
        raw: args.raw,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("transactions", {
      tranId: args.tranId,
      valId: args.valId,
      status: args.status,
      amount: args.amount,
      currency: args.currency,
      bankTranId: args.bankTranId,
      riskLevel: args.riskLevel,
      riskTitle: args.riskTitle,
      raw: args.raw,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertRefundRecord = mutation({
  args: {
    refundRefId: v.string(),
    refundTransId: v.optional(v.string()),
    bankTranId: v.optional(v.string()),
    status: v.optional(v.string()),
    amount: v.optional(v.string()),
    initiatedOn: v.optional(v.string()),
    refundedOn: v.optional(v.string()),
    raw: v.any(),
  },
  returns: v.id("refunds"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("refunds")
      .withIndex("by_refund_ref_id", (q) => q.eq("refundRefId", args.refundRefId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        refundTransId: args.refundTransId,
        bankTranId: args.bankTranId,
        status: args.status,
        amount: args.amount,
        initiatedOn: args.initiatedOn,
        refundedOn: args.refundedOn,
        raw: args.raw,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("refunds", {
      refundRefId: args.refundRefId,
      refundTransId: args.refundTransId,
      bankTranId: args.bankTranId,
      status: args.status,
      amount: args.amount,
      initiatedOn: args.initiatedOn,
      refundedOn: args.refundedOn,
      raw: args.raw,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertInvoiceRecord = mutation({
  args: {
    invoiceId: v.string(),
    refer: v.optional(v.string()),
    tranId: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    payUrl: v.optional(v.string()),
    qrImageUrl: v.optional(v.string()),
    status: v.string(),
    raw: v.any(),
  },
  returns: v.id("invoices"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoice_id", (q) => q.eq("invoiceId", args.invoiceId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        refer: args.refer,
        tranId: args.tranId,
        paymentStatus: args.paymentStatus,
        payUrl: args.payUrl,
        qrImageUrl: args.qrImageUrl,
        status: args.status,
        raw: args.raw,
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert("invoices", {
      invoiceId: args.invoiceId,
      refer: args.refer,
      tranId: args.tranId,
      paymentStatus: args.paymentStatus,
      payUrl: args.payUrl,
      qrImageUrl: args.qrImageUrl,
      status: args.status,
      raw: args.raw,
      createdAt: now,
      updatedAt: now,
    });
  },
});
