import styles from "./ui/profile.module.css";
import React from "react";

const TabButton = ({active, onClick, label }) => (
    <button
        className={active ? styles.active : ""}
        onClick={onClick}
    >
        {label}
    </button>
);

export default TabButton