import React from "react";
import BarLoader from "react-spinners/BarLoader";

function LoaderPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <BarLoader color={"#95CE26"} size={40} aria-label="Loading Spinner" data-testid="loader" />
    </div>
  );
}

export default LoaderPage;
