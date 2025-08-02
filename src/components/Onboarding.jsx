import { useState, useCallback } from 'react';
import styles from './ui/TinderCards.module.css';
import { observer } from 'mobx-react-lite';


export const Onboarding = observer(({
                                        showOnboarding,
                                        onboardingStep,
                                        setOnboardingStep,
                                        simulateSwipe,
                                        isAnimating,
                                        handleSaveChanges,
                                        undoButtonHighlight,
                                        setUndoButtonHighlight,
                                        saveHighlight,
                                        setsaveHighlight,
                                        popularHighlight,
                                        setPopularHighlight
                                    }) => {
    const handleNextOnboardingStep = useCallback(() => {
        if (isAnimating) return;
        switch(onboardingStep) {
            case 1:
                setOnboardingStep(2);
                simulateSwipe('left');
                break;
            case 2:
                setOnboardingStep(3);
                simulateSwipe('right');
                break;
            case 3:
                setOnboardingStep(4);
                simulateSwipe('up');
                setUndoButtonHighlight(true);
                break;
            case 4:
                setOnboardingStep(5);
                setUndoButtonHighlight(false);
                setsaveHighlight(true);
                break;
            case 5:
                setOnboardingStep(6);
                setsaveHighlight(false);
                setPopularHighlight(true);
                break;
            case 6:
                setOnboardingStep(0);
                setPopularHighlight(false);
                handleSaveChanges();
                break;
            default:
                setOnboardingStep(onboardingStep + 1);
        }
    }, [onboardingStep, isAnimating, simulateSwipe,
        setOnboardingStep, setUndoButtonHighlight,
        setsaveHighlight, setPopularHighlight, handleSaveChanges]);

    const renderOnboardingStep = () => {
        switch(onboardingStep) {
            case 1:
                return (
                    <>
                        <p className={styles.onboardingText}>
                            Привет! За пару кликов расскажем, как тут все устроено :)
                            Открыть карточку с деталями можно кликнув на нее.
                        </p>
                        <div className={styles.onboardingBlock}>
                            <p>1/6</p>
                            <button className={styles.onboardingButton} onClick={handleNextOnboardingStep}>
                                Далее
                            </button>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <p className={styles.onboardingText}>
                            При свайпе влево карточка пропадает из ленты и подобные стили показываются реже
                        </p>
                        <div className={styles.onboardingBlock}>
                            <p>2/6</p>
                            <button className={styles.onboardingButton} onClick={handleNextOnboardingStep}>
                                Далее
                            </button>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <p className={styles.onboardingText}>
                            При свайпе вправо карточка попадает в подборку и подобные стили показываются чаще
                        </p>
                        <div className={styles.onboardingBlock}>
                            <p>3/6</p>
                            <button className={styles.onboardingButton} onClick={handleNextOnboardingStep}>
                                Далее
                            </button>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <p className={styles.onboardingText}>
                            При свайпе вверх появляется новая карточка. Предыдущую можно найти, кликнув на иконку «Назад»
                        </p>
                        <div className={styles.onboardingBlock}>
                            <p>4/6</p>
                            <button className={styles.onboardingButton} onClick={handleNextOnboardingStep}>
                                Далее
                            </button>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <p className={styles.onboardingText}>
                            Здесь можно найти все сохраненные карточки и создать свои подборки
                        </p>
                        <div className={styles.onboardingBlock}>
                            <p>5/6</p>
                            <button className={styles.onboardingButton} onClick={handleNextOnboardingStep}>
                                Далее
                            </button>
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <p className={styles.onboardingText}>
                            А тут найти подборки по стилям и направлениям. При нажатии на фото из подборки откроется карточка товара.
                        </p>
                        <div className={styles.onboardingBlock}>
                            <p>6/6</p>
                            <button className={styles.onboardingButton} onClick={handleNextOnboardingStep}>
                                Go on
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    if (!showOnboarding || onboardingStep === 0) return null;

    return (
        <div className={styles.onboardingOverlay}>
            <div className={styles.onboardingContent}>
                {renderOnboardingStep()}
            </div>
        </div>
    );
});