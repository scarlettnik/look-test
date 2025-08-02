import React, { useState, useEffect } from 'react';
import styles from '../ui/modal.module.css';

const Modal = ({ isOpen, onClose, children, height }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    if (!shouldRender) return null;

    return (
        <div
            className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}

            onClick={onClose}
        >
            <div
                className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`}
                style={{height: height}}
                onClick={(e) => e.stopPropagation()}
            >
                <button className={styles.closeIcon} onClick={onClose}>
                    <img src='/subicons/close.svg' alt="Закрыть"/>
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;