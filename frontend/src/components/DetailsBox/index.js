import React from "react";
import "./DetailsBox.css"; // Optional CSS for styling

function DetailsBox({ isOpen, details, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="details-box">
      <button className="close-btn" onClick={onClose}>Close</button>
      <div className="details-content" dangerouslySetInnerHTML={{ __html: details }} />
    </div>
  );
}

export default DetailsBox;
