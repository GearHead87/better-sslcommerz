import { createAuth } from "../auth";
import type { DataModel } from "../_generated/dataModel";
import type { GenericCtx } from "@convex-dev/better-auth/utils";

// Export a static instance for Better Auth schema generation
export const auth = createAuth({} as GenericCtx<DataModel>);
