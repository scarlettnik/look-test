import styles from "./ui/profile.module.css";
import React from "react";

const ParamControl = ({ label, value, onChange, min = 0, max = 200 }) => {
    const handleIncrement = () => {
        if (value < max) onChange(value + 1);
    };

    const handleDecrement = () => {
        if (value > min) onChange(value - 1);
    };

    return (
        <div className={styles.paramControl}>
            <div className={styles.inputGroup}>
                <div style={{position: 'relative', display: 'inline-block'}}>
                    <button
                        className={styles.decrementButton}
                        onClick={handleDecrement}
                        disabled={value <= min}
                    >
                        -
                    </button>

                    <div className={styles.valueContainer}>
                        <span>{value}</span>
                        <label>{label}</label>
                    </div>

                    <button
                        className={styles.incrementButton}
                        onClick={handleIncrement}
                        disabled={value >= max}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ParamControl;