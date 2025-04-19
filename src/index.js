import React from "react";
import ReactDOM from "react-dom/client"; // Use ReactDOM.createRoot for React 18
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./components/UserContext"; // Import UserProvider

// Create a root for React 18
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the app wrapped with UserProvider
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();