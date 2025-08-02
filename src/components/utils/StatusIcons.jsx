// StatusIcons.jsx
import {Heart, HeartOff, Save} from 'lucide-react';

export const StatusIcons = ({ swipeProgress }) => {
    const icons = [
        { Component: HeartOff, direction: 'left', className: 'nope' },
        { Component: Heart, direction: 'right', className: 'love' },
        { Component: Save, direction: 'up', className: 'basket' }
    ];

    return (
        <div className="card-status-icons">
            {icons.map(({ Component, direction, className }) => (
                <Component
                    key={direction}
                    className={`status-icon ${className}`}
                    style={{
                        opacity: swipeProgress.direction === direction ? swipeProgress.opacity : 0,
                        transform: `translate(-50%, -50%) scale(${
                            0.5 + (swipeProgress.direction === direction ? swipeProgress.opacity * 0.5 : 0)
                        })`,
                        color: `white`

                    }}
                    size={128}
                />
            ))}
        </div>
    );
};