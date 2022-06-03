import React from "react";
import "./Loader.css";

const Loader = ({ display }) => {
  return (
    <div
      style={{ display: display === true ? "block" : "none" }}
      className="cover-spin"
    ></div>
  );
};

export default Loader;
