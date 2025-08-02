import styles from "./ui/profile.module.css";
import React from "react";

const FitOption = ({ id, value, label, currentValue, onChange }) => (
    <>
        <input
            type="radio"
            id={id}
            name="fit"
            value={value}
            checked={currentValue === value}
            onChange={(e) => onChange(e.target.value)}
        />
        <label htmlFor={id} className={currentValue === value ? styles.active : ""}>
            {label}
        </label>
    </>
);
export default FitOption;