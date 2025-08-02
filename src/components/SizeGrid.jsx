import styles from "./ui/profile.module.css";
import React from "react";

const SizeGrid = ({ params, updateParam, color = 'var(--white)' }) => {
    const handleChange = (value) => {
        updateParam("clothing_size", value);
    };

    const sizeRanges = {
        "XXS": "32-34",
        "XS": "34-36",
        "S": "36-38",
        "M": "38-40",
        "L": "40-42",
        "XL": "42-44",
        "XXL": "44-46",
        "3XL": "46-48",
        "4XL": "48-50"
    };

    return (
        <div className={styles.sizesGrid}>
            {Object.keys(sizeRanges).map(size => (
                <div
                    style={{backgroundColor: color}}
                    key={size}
                    className={`${styles.sizeBox} ${params?.clothing_size === size ? styles.selectedSize : styles.unSelectedSize}`}
                    onClick={() => handleChange(size)}
                >
                    {size}
                    <span className={styles.subText}>{sizeRanges[size]}</span>
                </div>
            ))}
        </div>
    );
};

export default SizeGrid;