import "./polyfills/map-upsert";
import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { getRouter } from "./router";
import "./index.css";

console.log("STEP 1 - main.tsx started");

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Root element not found");

const router = await getRouter();
console.log("STEP 2 - Router created");
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	root.render(<RouterProvider router={router} />);
}
console.log("STEP 3 - Rendering App");
