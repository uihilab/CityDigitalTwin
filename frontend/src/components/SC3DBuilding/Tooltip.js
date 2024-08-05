import React, { useState } from "react";

function Tooltip({ x, y, content }) {
    const [style, setStyle] = useState({
        display: "none",
        position: "absolute",
        left: 0,
        top: 0,
        background: "white",
        padding: "5px",
        border: "1px solid black",
        borderRadius: "5px",
        pointerEvents: "none" // Mouse olaylarını engellemek için
    });

    if (content) {
        style.display = "block";
        style.left = x + "px";
        style.top = y + "px";
    } else {
        style.display = "none";
    }

    return (
        <div style={style}>
            {content}
        </div>
    );
}

export default Tooltip;
