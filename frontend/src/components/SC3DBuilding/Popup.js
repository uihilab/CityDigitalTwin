import React from 'react';

const Popup = ({ clickPosition, object }) => {
  if (!object) {
    return null;
  }

  const { x, y } = clickPosition;

  return (
    <div className="popup" style={{ left: x, top: y }}>
      {object.cluster ? (
        <div>{object.point_count} records</div>
      ) : (
        <div>
          <h5>{object.name}</h5>
          {object.year && <p>({object.year})</p>}
          {/* İhtiyaç duyulan diğer bilgileri buraya ekleyin */}
        </div>
      )}
    </div>
  );
};

export default Popup;
