import React from 'react';
import styles from '../ui/OnboardingModal.module.css';
import CustomCheckbox from "../CustomCheckbox";
import FullScreenButton from "../FullScrinButton.jsx";

const ClothStyles = [
    { id: 1, name: "Классический", url: '/stylereference.png' },
    { id: 2, name: "Спортивный", url: '/stylereference.png' },
    { id: 3, name: "Повседневный", url: '/stylereference.png' },
    { id: 4, name: "Деловой", url: '/stylereference.png' },
    { id: 5, name: "Уличный", url: '/stylereference.png' },
    { id: 6, name: "Вечерний", url: '/stylereference.png' },
];

const StylesStep = ({ selectedStyles, onUpdate, onNext, onSkip, onBack }) => {
    const handleStyleToggle = (styleId) => {
        onUpdate('styles', styleId);
    };

    return (
        <div className={styles.onboardingStep}>
            <div className={styles.stepHeader}>
                <button
                    className={styles.backButton}
                    onClick={onBack}
                >
                    <img src='/subicons/whitearrowleft.svg' alt="Назад"/>
                </button>
                <p className={styles.stepTitle}>Выберите стили</p>
            </div>
            <div className={styles.scrollContainer}>
                <div className={styles.styleGrid}>
                    {ClothStyles.map(style => (
                        <div
                            key={style.id}
                            className={`${styles.styleCard} ${selectedStyles.includes(style.name) ? styles.selected : ''}`}
                        >
                            <img src={style.url} alt={style.name} className={styles.styleImage}/>
                            <div className={styles.styleContent}>
                                <CustomCheckbox
                                    checked={selectedStyles.includes(style.name)}
                                    onChange={() => handleStyleToggle(style.name)}
                                />
                                <span className={styles.styleName}>{style.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.onboardingActions}>
                <FullScreenButton
                    color='var(--beige)'
                    textColor='var(--black)'
                    className={`${styles.onboardingButton} ${styles.primary}`}
                    onClick={onNext}
                >
                    Вперед
                </FullScreenButton>
                <button
                    className={styles.secondaryButton}
                    onClick={onSkip}
                >
                    Пропустить
                </button>
            </div>
        </div>
    );
};

export default StylesStep;