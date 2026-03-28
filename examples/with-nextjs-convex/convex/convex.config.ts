import { defineApp } from "convex/server";
import sslcommerz from "@better-sslcommerz/convex/convex.config.js";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();

app.use(betterAuth);
app.use(sslcommerz);

export default app;
