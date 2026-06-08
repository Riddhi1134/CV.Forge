// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
// 	schema: "./src/schema/index.ts",
// 	out: "../../migrations",
// 	dialect: "postgresql",
// 	dbCredentials: {
// 		url: process.env.DATABASE_URL || "",
// 	},
// });

// import "dotenv/config";
// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   schema: "./src/schema/index.ts",
//   out: "../../migrations",
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL || "",
//   },
// });

import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: "/Users/riddhi/Desktop/reactive-resume/.env",
});

console.log("DATABASE_URL =", process.env.DATABASE_URL);

export default defineConfig({
	schema: "./src/schema/index.ts",
	out: "../../migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
