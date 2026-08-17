import React from "react";
import ReactDOM from "react-dom/client";
import "../src/style/css/iconsax.css";
import ALLRoutes from "./feature-module/router/router";
import { BrowserRouter } from "react-router-dom";
import { base_path } from "./environment";
import "../node_modules/bootstrap/dist/css/bootstrap.rtl.min.css";
import "./index.scss";
import { Provider } from "react-redux";
import store from "./core/redux/store";
import "../node_modules/@tabler/icons-webfont/dist/tabler-icons.css";
import "../node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./core/common/chat/chatContext";
import { Toaster } from "react-hot-toast";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={base_path}>
        <AuthProvider>
          <ChatProvider>
            <Toaster containerStyle={{ zIndex: 999999 }} />
            <ALLRoutes />
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
