import React from "react";
import styles from "../ui/sceleton.module.css";

const CustomSkeleton = ({
                            className = "",
                            style = {
                                width: "100%",
                            }
                        }) => {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style = {style}
        />
    );
};

export default CustomSkeleton;
