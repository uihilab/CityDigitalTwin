import React from "react";
import "./DetailsBox.css"; // Optional CSS for styling

function DetailsBox({ isOpen, details, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="details-box MuiTypography-root">
      <button className="close-btn" onClick={onClose}>X</button>
      <h2 className="details-title">Details</h2>
      <div className="details-content" dangerouslySetInnerHTML={{ __html: details }} />
    </div>
  );
}

export default DetailsBox;
