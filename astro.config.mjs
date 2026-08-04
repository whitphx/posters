// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";

import mdx from "@astrojs/mdx";

export default defineConfig({
  output: "static",
  integrations: [mdx(), icon()],
});
