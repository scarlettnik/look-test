import {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import styles from "./ui/TinderCard.module.css";
import SaveToCollectionModal from "./SaveToCollectionsModal.jsx";

const VELOCITY_THRESHOLD = 0.5;
const SWIPE_POWER = 0.6;
const VERTICAL_SWIPE_THRESHOLD_RATIO = 0.05;
const HORIZONTAL_SWIPE_THRESHOLD_RATIO = 0.2;
const ANIMATION_DURATION = 1000;
const DOUBLE_TAP_DELAY = 300;
const TAP_MOVEMENT_THRESHOLD = 10;


const TinderCard = ({
                        card,
                        onSwipe,
                        updateSwipeFeedback,
                        zIndex,
                        offset,
                        isPending,
                        isTopCard,
                        topCardPosition,
                        swipeProgress,
                        setCardRef,
                        isOnboardingActive,
                        onSaveClick
                    }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0, rotate: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showDoubleClickFeedback, setShowDoubleClickFeedback] = useState(false);

    const animationFrame = useRef(null);
    const contentRef = useRef(null);
    const cardRef = useRef(null);
    const startTime = useRef(0);
    const lastTapTime = useRef(0);
    const lastTapPosition = useRef({ x: 0, y: 0 });
    const tapTimeout = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    console.log(swipeProgress)

    const handleInteraction = (e) => {
        if (isDragging || isExpanded) {
            e.preventDefault();
            return;
        }

        const currentTime = Date.now();
        const currentPos = e.touches ?
            { x: e.touches[0].clientX, y: e.touches[0].clientY } :
            { x: e.clientX, y: e.clientY };

        if (currentTime - lastTapTime.current < DOUBLE_TAP_DELAY &&
            Math.abs(currentPos.x - lastTapPosition.current.x) < TAP_MOVEMENT_THRESHOLD &&
            Math.abs(currentPos.y - lastTapPosition.current.y) < TAP_MOVEMENT_THRESHOLD) {

            clearTimeout(tapTimeout.current);
            return;
        }

        lastTapTime.current = currentTime;
        lastTapPosition.current = currentPos;

        tapTimeout.current = setTimeout(() => {
            // Одиночный тап не делает ничего
        }, DOUBLE_TAP_DELAY);
    };

    const handleDoubleAction = () => {
        setShowDoubleClickFeedback(true);
        setTimeout(() => {
            navigate(`/product/${card.id}`);
        }, 500);
    };


    useEffect(() => {
        return () => {
            clearTimeout(tapTimeout.current);
        };
    }, []);

    useEffect(() => {
        const isTopCard = offset === 0;
        const isCurrentlyExpanded = location.state?.expandedCard === card.id;
        if (isCurrentlyExpanded && !isExpanded) {
            setIsExpanded(false);
        } else if (isTopCard && isCurrentlyExpanded) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false);
        }
    }, [location.state, card.id, offset, isExpanded]);

    useEffect(() => {
        const isTopCard = offset === 0;
        setIsExpanded(isTopCard && location.state?.expandedCard === card.id);
    }, [location.state, card.id, offset]);


    useEffect(() => {
        if (!cardRef.current) return;

        cardRef.current.style.opacity = '1';

    }, []);


    useEffect(() => {
        if (!cardRef.current) return;

        if (isPending) {
            cardRef.current.style.transition = 'none';
            cardRef.current.style.opacity = '0';
            cardRef.current.style.transform = 'translateY(20px)';

            requestAnimationFrame(() => {
                cardRef.current.style.transition = `
                    opacity 300ms ease-out,
                    transform 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28)
                `;
                cardRef.current.style.opacity = '1';
                cardRef.current.style.transform = 'translateY(0)';
            });
        }
    }, [isPending]);

    const resetPosition = (duration = ANIMATION_DURATION) => {
        if (cardRef.current) {
            const cardElement = cardRef.current;

            const currentTransform = cardElement.style.transform;
            const currentOpacity = cardElement.style.opacity;

            cardElement.style.transition = `all ${duration}ms cubic-bezier(0.23, 1, 0.32, 1)`;

            cardElement.style.transform = 'translate(0, 0) rotate(0deg)';
            cardElement.style.opacity = '1';

            const onTransitionEnd = () => {
                cardElement.removeEventListener('transitionend', onTransitionEnd);
                setPosition({ x: 0, y: 0, rotate: 0 });
                if (isTopCard) updateSwipeFeedback(0, 0);
                cardElement.style.transition = '';
            };

            cardElement.addEventListener('transitionend', onTransitionEnd);

            return () => {
                cardElement.removeEventListener('transitionend', onTransitionEnd);
                cardElement.style.transition = '';
                cardElement.style.transform = currentTransform;
                cardElement.style.opacity = currentOpacity;
            };
        }
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;

        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(() => {
            const deltaX = clientX - startPos.x;
            const deltaY = clientY - startPos.y;
            const rotate = Math.min(Math.max(deltaX * 0.1, -15), 15);

            setPosition({ x: deltaX, y: deltaY, rotate });
            if (isTopCard) updateSwipeFeedback(deltaX, deltaY);
        });
    };

    const handleEnd = () => {
        if (!isDragging || isExpanded) return;
        setIsDragging(false);
        cancelAnimationFrame(animationFrame.current);

        const { innerWidth, innerHeight } = window;
        const deltaTime = Date.now() - startTime.current;

        const velocity = {
            x: (position.x / (deltaTime || 1)) * SWIPE_POWER,
            y: (position.y / (deltaTime || 1)) * SWIPE_POWER
        };

        const projectedPosition = {
            x: position.x + velocity.x * 150,
            y: position.y + velocity.y * 150
        };

        const isHorizontal =
            Math.abs(projectedPosition.x) > innerWidth * HORIZONTAL_SWIPE_THRESHOLD_RATIO ||
            Math.abs(velocity.x) > VELOCITY_THRESHOLD;

        const isVerticalUp =
            projectedPosition.y < -innerHeight * VERTICAL_SWIPE_THRESHOLD_RATIO ||
            velocity.y < -VELOCITY_THRESHOLD;

        const dynamicDuration = Math.min(
            ANIMATION_DURATION,
            ANIMATION_DURATION / (Math.abs(velocity.x) + Math.abs(velocity.y) + 0.1)
        );

        if (isVerticalUp) {
            animateWithVelocity('up', dynamicDuration);
        } else if (isHorizontal) {
            animateWithVelocity(velocity.x > 0 ? 'right' : 'left', dynamicDuration);
        } else {
            resetPosition(dynamicDuration);
        }
    };

    const animateWithVelocity = (direction, duration) => {
        if (cardRef.current) {
            const targetX = direction === 'right'
                ? window.innerWidth * 2
                : direction === 'left'
                    ? -window.innerWidth * 2
                    : 0;

            const targetY = direction === 'up' ? -window.innerHeight * 2 : 0;
            const rotation = direction === 'right' ? 25 : direction === 'left' ? -25 : 0;

            cardRef.current.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            cardRef.current.style.transform = `
                translate(${targetX}px, ${targetY}px)
                rotate(${rotation}deg)
            `;
            cardRef.current.style.opacity = '0';
        }

        setTimeout(() => {
            onSwipe(direction, card);
        }, 50);
    };

    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        let scale = 1 - offset * 0.03;
        let translateY = 0;
        let translateX = 0;
        let rotate = 0;

        if (offset === 1 && topCardPosition) {
            const progressX = Math.min(1, Math.abs(topCardPosition.x) / (window.innerWidth * 0.5));
            const progressY = Math.min(1, Math.abs(topCardPosition.y) / (window.innerHeight * 0.5));
            const progress = Math.max(progressX, progressY);

            scale = 0.97 + (0.03 * progress);
            translateY = -10 - (5 * progress);

            if (topCardPosition.x !== 0) {
                const direction = topCardPosition.x > 0 ? 1 : -1;
                translateX = direction * 5 * progress;
            }
        }

        cardElement.style.transform = `
            translate(${position.x + translateX}px, ${position.y + translateY}px)
            rotate(${position.rotate + rotate}deg)
            scale(${scale})
        `;
        cardElement.style.zIndex = zIndex;
    }, [position, zIndex, offset, topCardPosition]);

    useEffect(() => {
        if (cardRef.current) {
            setCardRef(card.id, cardRef.current);
        }
    }, [card.id, setCardRef]);



    const [originalStyles, setOriginalStyles] = useState({
        transform: '',
        transition: '',
        opacity: ''
    });

    useEffect(() => {
        if (cardRef.current) {
            const computedStyle = window.getComputedStyle(cardRef.current);
            setOriginalStyles({
                transform: computedStyle.transform,
                transition: computedStyle.transition,
                opacity: computedStyle.opacity
            });
        }
    }, []);


    const handleStart = (clientX, clientY) => {
        if (isOnboardingActive) return;

        setStartPos({ x: clientX, y: clientY });
        setIsDragging(true);
        startTime.current = Date.now();

        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
        }
    };

    return (
        <div
            ref={cardRef}
            id={card.id}
            className={`${styles.card} ${isDragging ? styles.moving : ''}`}
            onTouchStart={(e) => {
                if (!isExpanded) {
                    handleInteraction(e);
                    handleStart(e.touches[0].clientX, e.touches[0].clientY);
                }
            }}
            onTouchMove={(e) => !isExpanded && handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={!isExpanded ? handleEnd : undefined}
            onMouseDown={(e) => {
                if (!isExpanded) {
                    handleInteraction(e);
                    handleStart(e.clientX, e.clientY);
                }
            }}
            onMouseMove={(e) => !isExpanded && handleMove(e.clientX, e.clientY)}
            onMouseUp={!isExpanded ? handleEnd : undefined}
            onMouseLeave={!isExpanded ? handleEnd : undefined}
            style={{
                zIndex: zIndex,
            }}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${card.id}`);
                }}
            >
                <img className={styles.cardImage} src={card.image_urls[0]}/>
            </div>

            {isTopCard && (
                <>
                    <div
                        className={`${styles.swipeFeedback} ${styles.swipeFeedbackLeft}`}
                        style={{
                            opacity: swipeProgress.direction === 'right' ? swipeProgress.opacity : 0,
                            transform: `scale(${swipeProgress.direction === 'left' ? 0.8 + swipeProgress.opacity * 0.4 : 1})`
                        }}
                    >
                        <img style={{width: '60px'}} src='/menuIcons/unactive/save.svg'/>
                    </div>
                    <div
                        className={`${styles.swipeFeedback} ${styles.swipeFeedbackRight}`}
                        style={{
                            opacity: swipeProgress.direction === 'left' ? swipeProgress.opacity : 0,
                            transform: `scale(${swipeProgress.direction === 'right' ? 0.8 + swipeProgress.opacity * 0.4 : 1})`
                        }}
                    >
                        <img style={{width: '60px'}} src='/subicons/close.svg'/>
                    </div>
                </>
            )}

            <div className={styles.cardContent} ref={contentRef}>
                <div className={styles.cardBottom}>
                    <div className={styles.cardInfo}>
                        <div className={styles.productName}>{card?.name}</div>
                        <div className={styles.manufacturer}>{card?.brand}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: '86vw', alignItems: 'center' }}>
                            <div className={styles.price}>{card?.discount_price || card?.price} ₽</div>
                            <button
                                onClick={onSaveClick}
                                className={styles.saveButton}>
                                <img src='/subicons/whitebookmark.svg'/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default TinderCard;