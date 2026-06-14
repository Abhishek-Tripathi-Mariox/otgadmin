import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./app.jsx";
import "./index.css";
import { DataProvider } from "./components/DataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <DataProvider>
        <App />
      </DataProvider>
    </Provider>
  </React.StrictMode>,
);
