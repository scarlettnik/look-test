import React, { useState, useEffect } from 'react';
import styles from '../ui/OnboardingModal.module.css';
import FullScreenButton from "../FullScrinButton.jsx";
import SizeGrid from "../SizeGrid.jsx";
import ParamsTab from "../ParamsTab.jsx";
import FitOptions from "../FitOptions.jsx";

const SizeStep = ({ params, updateParam, onUpdate, onNext, onSkip, onBack }) => {
    const [activeTab, setActiveTab] = useState("size");

    const handleNext = () => {
        onNext();
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
                <p className={styles.stepTitle}>Выберите размер или параметры</p>
            </div>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === "size" ? styles.active : ''}`}
                    onClick={() => setActiveTab("size")}
                >
                    Размер
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === "params" ? styles.active : ''}`}
                    onClick={() => setActiveTab("params")}
                >
                    Параметры
                </button>
            </div>
            <div className={styles.paramsBlock}>
                <div className={styles.tabContent}>
                    {activeTab === "size" && (
                        <SizeGrid
                            color='var(--ultralight-gray)'
                            params={params}
                            updateParam={updateParam}
                        />
                    )}

                    {activeTab === "params" && (
                        <ParamsTab
                            params={params}
                            updateParam={updateParam}
                        />
                    )}

                    <div className={styles.fitOptionsWrapper}>
                        <p className={styles.text}>Ношу одежду</p>
                        <FitOptions
                            params={params}
                            updateParam={(value) => updateParam('wearing_styles', value)}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <FullScreenButton
                    color='var(--beige)'
                    textColor='var(--black)'
                    onClick={handleNext}
                >
                    Далее
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

export default SizeStep;