import { useState, useRef, useEffect } from 'react';
import styles from '../ui/OnboardingModal.module.css';
import welcomstyle from '../ui/welcomStyle.module.css';
import store from "../../store.js";

const WelcomeStep = ({ userName, userSername, onNext }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const cardsRef = useRef([]);
    const animationRef = useRef(null);

    const ANIMATION_PARAMS = {
        resist: {
            maxTranslate: 150,
            maxRotate: 15,
            swipeDuration: 800,
            holdDuration: 400,
            returnDuration: 800,
            restDuration: 1000,
            get totalDuration() {
                return this.swipeDuration + this.holdDuration + this.returnDuration + this.restDuration;
            }
        },
        regular: {
            swipeDistance: 500,
            duration: 1000,
            maxRotate: 30
        }
    };

    const cards = [
        { id: 1, image: '/starterscroller.png', direction: 'right' },
        { id: 2, image: '/starterscroller2.png', direction: 'left' },
        { id: 3, image: '/starterscroller2.png', direction: 'resist' }
    ];

    const preloadImages = async () => {
        const totalImages = cards.length;
        let loadedCount = 0;

        const loadPromises = cards.map(card => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = card.image;
                img.onload = () => {
                    loadedCount++;
                    setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
                    resolve();
                };
                img.onerror = resolve;
            });
        });

        await Promise.all(loadPromises);
        setImagesLoaded(true);
    };

    useEffect(() => {
        preloadImages();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (imagesLoaded) {
            const timer = setTimeout(() => {
                startAutoSwipe();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [imagesLoaded, currentIndex]);

    const animateResist = (cardElement) => {
        const {
            maxTranslate,
            maxRotate,
            swipeDuration,
            holdDuration,
            returnDuration,
            totalDuration
        } = ANIMATION_PARAMS.resist;

        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const cycleTime = elapsed % totalDuration;

            if (cycleTime < swipeDuration) {
                const progress = cycleTime / swipeDuration;
                const easeProgress = easeOut(progress);
                const translateX = easeProgress * maxTranslate;
                const rotate = easeProgress * maxRotate;
                cardElement.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
            }
            else if (cycleTime < swipeDuration + holdDuration) {
                cardElement.style.transform = `translateX(${maxTranslate}px) rotate(${maxRotate}deg)`;
            }
            else if (cycleTime < swipeDuration + holdDuration + returnDuration) {
                const returnProgress = (cycleTime - swipeDuration - holdDuration) / returnDuration;
                const easeProgress = easeInOut(returnProgress);
                const translateX = maxTranslate - easeProgress * maxTranslate;
                const rotate = maxRotate - easeProgress * maxRotate;
                cardElement.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
            }
            else {
                cardElement.style.transform = 'translateX(0) rotate(0)';
            }
            cardElement.style.transition = 'none';

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const startAutoSwipe = () => {
        if (currentIndex >= cards.length) return;

        const currentCard = cards[currentIndex];
        const cardElement = cardsRef.current[currentIndex];
        if (!cardElement) return;

        if (currentCard.direction === 'resist') {
            animateResist(cardElement);
            return;
        }

        const { swipeDistance, duration, maxRotate } = ANIMATION_PARAMS.regular;
        const direction = currentCard.direction === 'left' ? -1 : 1;
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress < 1) {
                const easeProgress = easeInOut(progress);
                const translateX = easeProgress * swipeDistance * direction;
                const rotate = easeProgress * maxRotate * direction;

                cardElement.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
                cardElement.style.opacity = '1';
                cardElement.style.transition = 'none';

                animationRef.current = requestAnimationFrame(animate);
            } else {
                cardElement.style.display = 'none';
                setCurrentIndex(prev => prev + 1);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    if (!imagesLoaded) {
        return (
            <div className={styles.onboardingStep}>
                <div className={welcomstyle.loadingContainer}>
                    <div className={welcomstyle.loadingBar}>
                        <div
                            className={welcomstyle.loadingProgress}
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className={welcomstyle.loadingText}>
                        Загрузка {loadingProgress}%
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.onboardingStep}>
            <p className={welcomstyle.onBoardingTitle}>
                Добро пожаловать{userName && ','} <br/>
                {userName ? `${userName} ${userSername}!` : 'ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ'}
            </p>

            <div className={welcomstyle.cardsContainer}>
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        ref={el => cardsRef.current[index] = el}
                        className={welcomstyle.card}
                        style={{
                            zIndex: cards.length - index,
                            transform: index < currentIndex && card.direction !== 'resist'
                                ? `translateX(${card.direction === 'left' ? -500 : 500}px) rotate(${card.direction === 'left' ? -30 : 30}deg)`
                                : 'translateX(0) rotate(0)',
                            opacity: 1,
                            display: index < currentIndex && card.direction !== 'resist' ? 'none' : 'block',
                        }}
                    >
                        <img
                            src={card.image}
                            alt={`Card ${index + 1}`}
                            className={welcomstyle.cardImage}
                            width="300"
                            height="400"
                            loading="eager"
                        />
                    </div>
                ))}
            </div>

            <button
                className={welcomstyle.starterButton}
                onClick={onNext}
                disabled={!imagesLoaded || !store.authStore.data}
            >
                <div style={{ display: 'flex', alignItems: "center", justifyContent: 'center' }}>
                    Начать <img style={{ paddingLeft: '10px' }} src='/rightarrow.svg' alt="Arrow" />
                </div>
            </button>
        </div>
    );
};

export default WelcomeStep;