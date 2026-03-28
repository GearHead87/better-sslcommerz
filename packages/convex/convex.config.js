import { defineApp } from "convex/server";

import sslcommerz from "./src/component/convex.config.js";

const app = defineApp();
app.use(sslcommerz);

export default app;
