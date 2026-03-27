import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  demoUsers: defineTable({
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_created_at", ["createdAt"]),

  demoPosts: defineTable({
    title: v.string(),
    body: v.string(),
    authorId: v.id("demoUsers"),
    published: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),
});
