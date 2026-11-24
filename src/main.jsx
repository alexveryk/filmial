import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { store } from "./app/store";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors theme="dark" />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
