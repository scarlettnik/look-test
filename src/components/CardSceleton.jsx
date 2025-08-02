// CardSkeleton.jsx
import React from 'react';
import './ui/TinderCards.css';

const CardSkeleton = ({ zIndex }) => {
    return (
        <div
            className="tinder--card skeleton"
            style={{
                zIndex,
                transform: `translateY(${zIndex * 5}px) scale(${1 - zIndex * 0.03})`
            }}
        >
            <div className="skeleton-content">
                <div className="skeleton-image"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;