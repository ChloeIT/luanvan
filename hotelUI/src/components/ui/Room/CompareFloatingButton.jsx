// src/components/CompareFloatingButton.jsx
import { createPortal } from "react-dom";

export default function CompareFloatingButton({ onClick, count }) {
    return createPortal(
        <button className="btn btn-primary btn-compare" onClick={onClick}>
            Compare {count ? `(${count})` : ""}
        </button>,
        document.body
    );
}
