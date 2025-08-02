import { useCallback } from 'react';
import { SWIPE_CONFIG } from './constants';

export const useSwipeLogic = (animateSwipe, setCards, setBasket) => {
    const handleSwipe = useCallback((direction, card) => {
        animateSwipe(direction, card.id);

        setTimeout(() => {
            setCards(prev => prev.filter(c => c.id !== card.id));
            if(direction === 'up') setBasket(prev => [...prev, card]);
        }, SWIPE_CONFIG.ANIMATE_SCROLL);
    }, [animateSwipe, setCards, setBasket]);

    const updateSwipeFeedback = useCallback((dx, dy) => {
        const swipeThreshold = window.innerWidth * HORIZONTAL_SWIPE_THRESHOLD_RATIO;
        const verticalThreshold = window.innerHeight * VERTICAL_SWIPE_THRESHOLD_RATIO;
        const verticalDownThreshold = window.innerHeight * VERTICAL_SWIPE_DOWN_THRESHOLD_RATIO;

        let direction = null;
        let opacity = 0;

        if (Math.abs(dx) > Math.abs(dy * 1.5)) {
            direction = dx > 0 ? 'right' : 'left';
            opacity = Math.min(Math.abs(dx) / swipeThreshold, 1);
        } else if (dy < -verticalThreshold) {
            direction = 'up';
            opacity = Math.min(Math.abs(dy) / verticalThreshold, 1);
        } else if (dy > verticalDownThreshold) {
            direction = 'down';
            opacity = Math.min(dy / verticalDownThreshold, 1);
        }

        setSwipeProgress({ direction, opacity });
    }, []);

    return { handleSwipe, updateSwipeFeedback };
};