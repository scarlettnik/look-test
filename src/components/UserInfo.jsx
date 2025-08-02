import React, {useEffect, useState} from "react";
import styles from "./ui/profile.module.css";

const UserInfo = ({ photoUrl, firstName, lastName }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSkeleton, setShowSkeleton] = useState(true);

    useEffect(() => {
        const img = new Image();
        img.src = photoUrl;
        img.onload = () => {
            setImageLoaded(true);
        };
        if (imageLoaded) setShowSkeleton(false);
    }, [photoUrl, imageLoaded]);

    return (
        <div className={styles.userInfo}>
            <div className={styles.avatar}>
                {showSkeleton && (
                    <div className={styles.skeleton} />
                )}

                <img
                    src={photoUrl}
                    className={`${styles.avatarImage} ${showSkeleton ? styles.hidden : ''}`}
                    alt="User avatar"
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
            <div className={styles.userName}>
                {firstName || lastName ? (
                    <div>
                        {firstName} {lastName}
                    </div>
                ) : (
                    <p>User</p>
                )}
            </div>
        </div>
    );
};
export default UserInfo