import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ui/TinderCard.module.css';

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
                        isExpanded,
                        setCardRef,
                        isOnboardingActive,
                        swipeConfig,
                        onSaveClick={handleOpenSaveModal}
                    }) => {
    const [position, setPosition] = useState({ x: 0, y: 0, rotate: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const cardRef = useRef(null);
    const animationFrame = useRef(null);
    const startTime = useRef(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!cardRef.current) return;

        cardRef.current.style.opacity = '1';
        if (isPending) {
            animateAppearance();
        }
    }, [isPending]);

    const animateAppearance = () => {
        if (!cardRef.current) return;

        cardRef.current.style.transition = 'none';
        cardRef.current.style.transform = 'translateY(20px)'; // Убрали opacity

        requestAnimationFrame(() => {
            cardRef.current.style.transition = `
      transform 300ms cubic-bezier(0.18, 0.89, 0.32, 1.28)
    `;
            cardRef.current.style.transform = 'translateY(0)'; // Убрали opacity
        });
    };
    console.log(isOnboardingActive)

    useEffect(() => {
        if (cardRef.current) {
            setCardRef(card.id, cardRef.current);
        }
        return () => setCardRef(card.id, null);
    }, [card.id, setCardRef]);

    const handleStart = (clientX, clientY) => {
        if (isExpanded) return false;

        setStartPos({ x: clientX, y: clientY });
        setIsDragging(true);
        startTime.current = Date.now();

        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
        }
        return true;
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;

        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(() => {
            const deltaX = clientX - startPos.x;
            const deltaY = clientY - startPos.y;

            const rotate = Math.min(
                Math.max(deltaX * 0.1, -swipeConfig.horizontal.rotationAngle),
                swipeConfig.horizontal.rotationAngle
            );

            setPosition({ x: deltaX, y: deltaY, rotate });

            if (isTopCard) {
                updateSwipeFeedback(deltaX, deltaY);
            }
        });
    };

    const handleEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);
        cancelAnimationFrame(animationFrame.current);

        const { innerWidth, innerHeight } = window;
        const deltaTime = Date.now() - startTime.current;

        const velocity = {
            x: (position.x / (deltaTime || 1)) * swipeConfig.physics.power * swipeConfig.horizontal.speedMultiplier,
            y: (position.y / (deltaTime || 1)) * swipeConfig.physics.power *
                (position.y < 0 ? swipeConfig.verticalUp.speedMultiplier : 0) // Умножаем на 0 для свайпа вниз
        };

        const direction = getSwipeDirection(velocity, innerWidth, innerHeight);

        if (direction) {
            animateSwipe(direction, velocity);
        } else {
            resetPosition();
        }
    };
    const getSwipeDirection = (velocity, screenWidth, screenHeight) => {
        const isHorizontalFast = Math.abs(velocity.x) > swipeConfig.physics.velocityThreshold;

        if (Math.abs(position.x) > screenWidth * swipeConfig.horizontal.threshold || isHorizontalFast) {
            return velocity.x > 0 ? 'right' : 'left';
        }

        if (position.y < -screenHeight * swipeConfig.verticalUp.threshold ||
            (velocity.y < -swipeConfig.physics.velocityThreshold)) {
            return 'up';
        }

        return null;
    };

    const animateSwipe = (direction, velocity) => {
        if (!cardRef.current) return;

        const directionConfig = {
            left: {
                targetX: -window.innerWidth * 2,
                targetY: 0,
                rotation: -swipeConfig.horizontal.rotationAngle,
                duration: swipeConfig.horizontal.animationDuration
            },
            right: {
                targetX: window.innerWidth * 2,
                targetY: 0,
                rotation: swipeConfig.horizontal.rotationAngle,
                duration: swipeConfig.horizontal.animationDuration
            },
            up: {
                targetX: 0,
                targetY: -window.innerHeight * 2,
                rotation: 0,
                duration: swipeConfig.verticalUp.animationDuration
            },
            down: {
                targetX: 0,
                targetY: window.innerHeight * 2,
                rotation: 0,
                duration: swipeConfig.verticalDown.animationDuration
            }
        };

        const { targetX, targetY, rotation, duration } = directionConfig[direction];

        const dynamicDuration = Math.min(
            duration,
            duration / (Math.abs(velocity.x) + Math.abs(velocity.y) + 0.1)
        );

        cardRef.current.style.transition = `all ${dynamicDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        cardRef.current.style.transform = `
      translate(${targetX}px, ${targetY}px)
      rotate(${rotation}deg)
    `;

        setTimeout(() => onSwipe(direction, card), 50);
    };

    const resetPosition = () => {
        if (!cardRef.current) return;

        cardRef.current.style.transition = `all ${swipeConfig.horizontal.animationDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`;
        cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
        cardRef.current.style.opacity = '1';

        const onTransitionEnd = () => {
            cardRef.current?.removeEventListener('transitionend', onTransitionEnd);
            setPosition({ x: 0, y: 0, rotate: 0 });
            if (isTopCard) updateSwipeFeedback(0, 0);
        };

        cardRef.current.addEventListener('transitionend', onTransitionEnd);
    };

    useEffect(() => {
        if (!cardRef.current) return;
        let scale = 1 - Math.max(0, offset) * 0.03;
        let translateY = 0;
        let translateX = 0;

        if (offset === 0 && topCardPosition) {
            const progress = Math.min(1,
                Math.max(
                    Math.abs(topCardPosition.x) / (window.innerWidth * 0.5),
                    Math.abs(topCardPosition.y) / (window.innerHeight * 0.5)
                ));

            scale += 0.03 * progress;
            translateY += -5 * progress;

            if (topCardPosition.x !== 0) {
                const direction = topCardPosition.x > 0 ? 1 : -1;
                translateX = direction * 5 * progress;
            }
        }

        cardRef.current.style.transform = `
    translate(${position.x + translateX}px, ${position.y + translateY}px)
    rotate(${position.rotate}deg)
    scale(${scale})
  `;
        cardRef.current.style.zIndex = zIndex;
    }, [position, zIndex, offset, topCardPosition]);

    return (
        <div
            ref={cardRef}
            id={card.id}
            className={`${styles.card} 
            ${isDragging ? styles.moving : ''} 
            ${isOnboardingActive ? styles['card-onboarding'] : ''}`}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            style={{ zIndex }}
        >
            <div onClick={() => navigate(`/product/${card.id}`)}>
                <img className={styles.cardImage} src={card.image_urls[0]} alt={card.name} />
            </div>

            {isTopCard && (
                <>
                    <div className={`${styles.swipeFeedback} ${styles.swipeFeedbackLeft}`}/>
                    <div className={`${styles.swipeFeedback} ${styles.swipeFeedbackRight}`}/>
                    <div
                        className={`${styles.swipeFeedback} ${styles.swipeFeedbackLeft}`}
                        style={{
                            opacity: swipeProgress.direction === 'right' ? swipeProgress.opacity : 0,
                            transform: `scale(${swipeProgress.direction === 'left' ? 0.8 + swipeProgress.opacity * 0.4 : 1})`
                        }}
                    >
                        <img src="/menuIcons/unactive/save.svg" alt="Save" style={{width: '60px'}}/>
                    </div>
                    <div
                        className={`${styles.swipeFeedback} ${styles.swipeFeedbackRight}`}
                        style={{
                            opacity: swipeProgress.direction === 'left' ? swipeProgress.opacity : 0,
                            transform: `scale(${swipeProgress.direction === 'right' ? 0.8 + swipeProgress.opacity * 0.4 : 1})`
                        }}
                    >
                        <img src="/subicons/close.svg" alt="Close" style={{width: '60px'}}/>
                    </div>
                </>
            )}

            <div className={styles.cardContent}>
                <div className={styles.cardBottom}>
                    <div className={styles.cardInfo}>
                        <div className={styles.productName}>{card?.name}</div>
                        <div className={styles.manufacturer}>{card?.brand}</div>
                        <div className={styles.priceRow}>
                            <div className={styles.price}>{card?.discount_price || card?.price} ₽</div>
                            <button
                                className={styles.saveButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveClick(card);
                                }}
                            >
                                <img
                                    src={card.is_contained_in_user_collections
                                        ? "/subicons/fullwhitebookmark.svg"
                                        : "/subicons/whitebookmark.svg"}
                                    alt={card.is_contained_in_user_collections ? "Сохранено" : "Сохранить"}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TinderCard;