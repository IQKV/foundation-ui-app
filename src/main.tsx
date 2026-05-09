import ReactDOM from "react-dom/client";
import { App } from "@/app";
import { initializeDefaultLocale } from "@/shared/locales";

initializeDefaultLocale();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
