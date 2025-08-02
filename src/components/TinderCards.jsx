import { useState, useCallback, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './ui/TinderCards.module.css';
import Sidebar from './Sidebar';
import TinderCard from "./TinderCard.jsx";
import { SearchHeader } from "./utils/SearchHeaderMain.jsx";
import { FilterBar } from "./FilterBar.jsx";
import { useStore } from "../provider/StoreContext.jsx";
import {AUTH_TOKEN} from "../constants.js";
import {runInAction} from "mobx";
import {Onboarding} from "./Onboarding.jsx";
import SaveToCollectionModal from "./SaveToCollectionsModal.jsx";

const VERTICAL_SWIPE_THRESHOLD_RATIO = 0.05;
const HORIZONTAL_SWIPE_THRESHOLD_RATIO = 0.05;
const ANIMATION_DURATION = 2000;
const INITIAL_CARDS_COUNT = 3;
const SKELETON_COUNT = 3;

const TinderCards = observer(() => {
    const [swipeProgress, setSwipeProgress] = useState({ direction: null, opacity: 0 });
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(0);
    const store = useStore();
    const [containerHeight, setContainerHeight] = useState(window.innerHeight);
    const containerRef = useRef(null);

    const showOnboarding = !store?.authStore?.data?.preferences?.complete_onboarding;

    const [filters, setFilters] = useState({
        size: [],
        brand: [],
        price: {},
        type: []
    });


    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleOpenSaveModal = (product) => {
        setSelectedProduct(product);
        setIsSaveModalOpen(true);
    };

    const handleCloseSaveModal = () => {
        setIsSaveModalOpen(false);
        setSelectedProduct(null);
    };

    useEffect(() => {
        if (showOnboarding) {
            setOnboardingStep(1);
        }
    }, [showOnboarding]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const initialHeight = containerRef.current.getBoundingClientRect().height;
                setContainerHeight(initialHeight);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (store?.catalogStore?.cards?.length <= INITIAL_CARDS_COUNT &&
            store.catalogStore.hasMore &&
            !store.catalogStore.isFetching) {
            store.catalogStore.fetchCards();
        }
    }, [store?.catalogStore.cards?.length]);

    const animateSwipe = useCallback((direction, cardId) => {
        const card = document.getElementById(cardId);
        if (!card) return;

        const { innerWidth, innerHeight } = window;
        const rotation = direction === 'right' ? 25 : -25;

        card.style.transition = `all ${ANIMATION_DURATION}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;

        switch(direction) {
            case 'left':
                card.style.transform = `translate(-${innerWidth * 2}px, 0) rotate(${rotation}deg)`;
                break;
            case 'right':
                card.style.transform = `translate(${innerWidth * 2}px, 0) rotate(${rotation}deg)`;
                break;
            case 'up':
                card.style.transform = `translate(0, -${innerHeight * 2}px) rotate(0deg)`;
                break;
            case 'down':
                return;
        }

        card.style.opacity = '0';
    }, []);

    const handleSwipe = useCallback((direction, card) => {
        if (direction === 'down') return;

        animateSwipe(direction, card.id);
        setSwipeProgress({ direction: null, opacity: 0 });

        setTimeout(() => {
            store.catalogStore.handleSwipe(direction, card);
        }, 50);
    }, [animateSwipe, ANIMATION_DURATION]);

    const updateSwipeFeedback = useCallback((dx, dy) => {
        const swipeThreshold = window.innerWidth * HORIZONTAL_SWIPE_THRESHOLD_RATIO;
        const verticalThreshold = window.innerHeight * VERTICAL_SWIPE_THRESHOLD_RATIO;

        let direction = null;
        let opacity = 0;

        if (Math.abs(dx) > Math.abs(dy * 1.5)) {
            direction = dx > 0 ? 'right' : 'left';
            opacity = Math.min(Math.abs(dx) / swipeThreshold, 1);
        } else if (dy < -verticalThreshold) {
            direction = 'up';
            opacity = Math.min(Math.abs(dy) / verticalThreshold, 1);
        }

        setSwipeProgress({ direction, opacity });
    }, []);


    const [undoButtonHighlight, setUndoButtonHighlight] = useState(false);
    const [saveHighlight, setsaveHighlight] = useState(false);
    const [popularHighlight, setPopularHighlight] = useState(false);
    const [isOnboardingActive, setIsOnboardingActive] = useState(false);
    const cardRefs = useRef({});

    const setCardRef = useCallback((id, ref) => {
        if (ref) {
            cardRefs.current[id] = ref;
        } else {
            delete cardRefs.current[id];
        }
    }, []);


    const handleSaveChanges = async () => {
        try {
            const response = await fetch('https://api.lookvogue.ru/v1/user', {
                method: 'PATCH',
                headers: {
                    "Authorization": `tma ${AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    preferences: {
                        complete_onboarding: true
                    }
                })
            });

            if (!response.ok) throw new Error('Update failed');

            runInAction(() => {
                if (store.authStore.data) {
                    store.authStore.data.preferences = {
                        complete_onboarding: true
                    };
                }
            });

        } catch (error) {
            console.error('Update error:', error);
        }
    };


    const [isAnimating, setIsAnimating] = useState(false); // Добавляем состояние для отслеживания анимации

    const simulateSwipe = useCallback((direction) => {
        if (!store.catalogStore.cards?.length || isAnimating) return;

        const cardId = store.catalogStore.cards[0].id;
        const cardRef = cardRefs.current[cardId];
        if (!cardRef) return;

        setIsOnboardingActive(true);
        setIsAnimating(true); // Устанавливаем флаг анимации

        const computedStyle = window.getComputedStyle(cardRef);
        const originalStyles = {
            transform: computedStyle.transform,
            transition: computedStyle.transition,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex
        };

        const params = {
            left: { endX: -window.innerWidth * 0.7, endY: 0, rotation: -15 },
            right: { endX: window.innerWidth * 0.7, endY: 0, rotation: 15 },
            up: { endX: window.innerWidth * 0.5, endY: -window.innerHeight * 0.5, rotation: 5 }
        }[direction];

        cardRef.style.transition = 'transform 500ms ease-out, opacity 500ms ease-out';
        cardRef.style.transform = `translate(${params.endX}px, ${params.endY}px) rotate(${params.rotation}deg)`;
        cardRef.style.zIndex = '10000';

        setTimeout(() => {
            cardRef.style.transition = 'transform 100ms ease-out, opacity 500ms ease-out';
            cardRef.style.transform = originalStyles.transform;
            cardRef.style.opacity = originalStyles.opacity;

            setTimeout(() => {
                cardRef.style.transition = originalStyles.transition;
                cardRef.style.zIndex = originalStyles.zIndex;
                setIsOnboardingActive(false);
                setIsAnimating(false);
            }, 500);
        }, 1000);
    }, [store.catalogStore.cards, isAnimating]);


    return (
        <>

            <div className={styles.container} style={{height: `${containerHeight}px`}} ref={containerRef}>
                {/*<button onClick={() => handleSaveChanges()}>ТЫК</button>*/}

                <SearchHeader
                    onSearch={(searchRequest) => {
                        console.log('Search request:', searchRequest);
                        store.catalogStore.fetchCardsWithSearch(searchRequest);
                    }}
                    onClearSearch={() => store.catalogStore.resetSearch()}
                />
                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    catalogStore={store.catalogStore}
                />

                <div className={styles.cardsContainer}>
                    {store.catalogStore.loading && Array(SKELETON_COUNT).fill(0).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className={styles.skeleton}
                            style={{zIndex: SKELETON_COUNT - i}}
                        />
                    ))}

                    {!store.catalogStore.loading && store?.catalogStore?.cards?.map((card, index) => (
                        <TinderCard
                            key={card._key}
                            card={card}
                            onSwipe={handleSwipe}
                            updateSwipeFeedback={updateSwipeFeedback}
                            zIndex={store.catalogStore.cards.length - index}
                            offset={index}
                            isExpanded={expandedCardId === card.id}
                            onExpand={() => setExpandedCardId(card.id)}
                            onCollapse={() => setExpandedCardId(null)}
                            isPending={card._pending}
                            swipeProgress={index === 0 ? swipeProgress : {direction: null, opacity: 0}}
                            isTopCard={index === 0}
                            setCardRef={setCardRef}
                            isOnboardingActive={isOnboardingActive && index === 0}
                            onSaveClick={handleOpenSaveModal}
                        />
                    ))}

                    {!store.catalogStore.loading && store.catalogStore.cards?.length === 0 && (
                        <div className={styles.emptyState}>
                            <h2>No more cards!</h2>
                        </div>
                    )}
                </div>
                <Sidebar
                    highlightSave={saveHighlight}
                    highlightPopular={popularHighlight}
                    onboarding={!store?.authStore?.data?.preferences?.complete_onboarding}

                />
                <Onboarding
                    showOnboarding={showOnboarding}
                    onboardingStep={onboardingStep}
                    setOnboardingStep={setOnboardingStep}
                    simulateSwipe={simulateSwipe}
                    isAnimating={isAnimating}
                    handleSaveChanges={handleSaveChanges}
                    undoButtonHighlight={undoButtonHighlight}
                    setUndoButtonHighlight={setUndoButtonHighlight}
                    saveHighlight={saveHighlight}
                    setsaveHighlight={setsaveHighlight}
                    popularHighlight={popularHighlight}
                    setPopularHighlight={setPopularHighlight}

                />
                <SaveToCollectionModal
                    isOpen={isSaveModalOpen}
                    onClose={handleCloseSaveModal}
                    productId={selectedProduct?.id}
                    productName={selectedProduct?.name}
                />
            </div>

        </>
    );
});

export default TinderCards;