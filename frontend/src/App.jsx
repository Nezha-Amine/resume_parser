import { useState } from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/index.jsx";

import { AuthProvider } from "./context/AuthContext";
function App() {
  let copyright = String.fromCodePoint(0x00A9);
  return (
    <div className="bg-background min-h-full bottom-0 " >
      <AuthProvider>
     
          {/* Wrap RouterProvider within both context providers */}
          <RouterProvider router={router} />
      
      </AuthProvider>
      <p className="  text-center text-gray-500">{copyright}Designed & Developed by Netsense</p>
    </div>
  );
}

export default App;
