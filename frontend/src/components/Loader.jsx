import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <img src="/spinner.gif" alt="Loading..." className="w-36 h-36" />
    </div>
  );
};

export default Loader;
