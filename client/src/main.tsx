import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeHydration } from "./utils/hydration";
import { initializePreloading } from "./utils/preload";

// Initialize performance optimizations immediately
initializePreloading();
initializeHydration();

createRoot(document.getElementById("root")!).render(<App />);
