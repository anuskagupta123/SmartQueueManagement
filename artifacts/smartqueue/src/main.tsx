import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (apiBaseUrl) {
	// Allow frontend and API to run on different hosts in production.
	setBaseUrl(apiBaseUrl);
}

setAuthTokenGetter(() => localStorage.getItem("smartqueue_token"));

createRoot(document.getElementById("root")!).render(<App />);
