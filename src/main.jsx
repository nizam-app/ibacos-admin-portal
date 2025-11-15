
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom"; // 🔴 এখানে react-router-dom
import Router from "./routes/router.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <RouterProvider router={Router} />
);
