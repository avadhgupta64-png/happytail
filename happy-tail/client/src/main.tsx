import { createRoot } from "react-dom/client";

// Enable installability for supported browsers without caching private API data.
if (typeof window !== "undefined") {
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "/manifest.webmanifest";
  document.head.appendChild(manifest);
  const theme = document.createElement("meta");
  theme.name = "theme-color";
  theme.content = "#101827";
  document.head.appendChild(theme);
  if ("serviceWorker" in navigator && window.location.protocol === "https:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Happy Tail offline support could not be enabled.", error);
      });
    });
  }
}
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
