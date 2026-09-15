import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { MediaStateProvider } from "./context/MediaStateContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <MediaStateProvider>
        <App />
      </MediaStateProvider>
    </BrowserRouter>
  </StrictMode>
);
