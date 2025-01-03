import React, { useEffect, useState } from 'react';
import './styles.css';

const ProjectModal = ({ content }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (event.target.className === 'modal') {
      setIsOpen(false);
    }
  };

  return isOpen ? (
    <div className="modal" onClick={handleOutsideClick}>
      <div className="modal-content">
        <span className="close-btn" onClick={handleClose}>&times;</span>
        <div className="modal-body">
          {content}
        </div>
      </div>
    </div>
  ) : null;
};

export default ProjectModal; 