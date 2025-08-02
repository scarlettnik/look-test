import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import {useNavigate} from "react-router-dom";

const VERTICAL_SWIPE_THRESHOLD_RATIO = 0.2;
const HORIZONTAL_SWIPE_THRESHOLD_RATIO = 0.2;
const INITIAL_CARDS_COUNT = 3;
const SKELETON_COUNT = 3;

const swipeConfig = {
    horizontal: {
        threshold: 0.15,
        speedMultiplier: 0.8,
        rotationAngle: 25,
        animationDuration: 800
    },
    verticalUp: {
        threshold: 0.1,
        speedMultiplier: 0.8,
        animationDuration: 1000
    },
    verticalDown: {
        threshold: 1000000000000000000,
        speedMultiplier: 0.2,
        animationDuration: 5000
    },
    physics: {
        velocityThreshold: 0.9,
        power: 0.2,
        deceleration: 0.95
    }
};

const TinderCards = observer(() => {
    const [swipeProgress, setSwipeProgress] = useState({ direction: null, opacity: 0 });
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(0);
    const store = useStore();
    const [containerHeight, setContainerHeight] = useState(window.innerHeight);
    const containerRef = useRef(null);
    const navigate = useNavigate()
    const showOnboarding = !store?.authStore?.data?.preferences?.complete_onboarding;

    console.log(showOnboarding)

    const [filters, setFilters] = useState({
        size: [],
        brand: [],
        price: {},
        type: []
    });

    const handleSaveSuccess = useCallback((productId, isSaved) => {
        runInAction(() => {
            // Обновляем состояние в catalogStore
            const card = store.catalogStore.cards.find(c => c.id === productId);
            if (card) {
                card.is_contained_in_user_collections = isSaved;
            }

            // Обновляем состояние в popularStore (если товар есть там)
            store.popular.popular.forEach(item => {
                if (item.products) {
                    const product = item.products.find(p => p.id === productId);
                    if (product) {
                        product.is_contained_in_user_collections = isSaved;
                    }
                }
            });
        });
    }, [store]);

    useEffect(() => {
        if (showOnboarding) {
            setOnboardingStep(1);
        }
    }, [showOnboarding]);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleOpenSaveModal = useCallback((product) => {
        setSelectedProduct(product);
        setIsSaveModalOpen(true);
    }, []);

    const handleCloseSaveModal = useCallback(() => {
        setIsSaveModalOpen(false);
        setSelectedProduct(null);
    }, []);

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



    const sendInteraction = async (productId, action) => {
        try {
            const response = await fetch(`https://api.lookvogue.ru/v1/interaction/product/${productId}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `tma ${AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    interaction_type: action
                })
            });

            if (response.ok) {
                console.log(response)
            }
        } catch (error) {
            console.error('Error sending interaction:', error);
        }
    };


    const handleSwipe = useCallback((direction, card) => {
        if (direction === 'down') return;

        // Определяем тип взаимодействия
        const action = direction === 'right' ? 'like' : 'dislike';

        // Отправляем запрос
        sendInteraction(card.id, action);

        const duration = direction === 'up'
            ? swipeConfig.verticalUp.animationDuration
            : swipeConfig.horizontal.animationDuration;

        const cardElement = document.getElementById(card.id);
        if (cardElement) {
            const rotation = direction === 'right'
                ? swipeConfig.horizontal.rotationAngle
                : -swipeConfig.horizontal.rotationAngle;

            cardElement.style.transition = `all ${duration}ms linear`;

            switch(direction) {
                case 'left':
                    cardElement.style.transform = `translate(-${window.innerWidth * 2}px, 0) rotate(${rotation}deg)`;
                    break;
                case 'right':
                    cardElement.style.transform = `translate(${window.innerWidth * 2}px, 0) rotate(${rotation}deg)`;
                    break;
                case 'up':
                    cardElement.style.transform = `translate(0, -${window.innerHeight * 2}px) rotate(0deg)`;
                    break;
            }
        }

        setSwipeProgress({ direction: null, opacity: 0 });

        setTimeout(() => {
            store.catalogStore.handleSwipe(direction, card);
        }, duration/2);
    }, [swipeConfig]);


    const updateSwipeFeedback = useCallback((dx, dy) => {
        const swipeThreshold = window.innerWidth * HORIZONTAL_SWIPE_THRESHOLD_RATIO;
        const verticalThreshold = window.innerHeight * VERTICAL_SWIPE_THRESHOLD_RATIO;

        let direction = null;
        let opacity = 0;

        if (Math.abs(dx) > Math.abs(dy * 1.5)) {
            direction = dx > 0 ? 'right' : 'left';
            opacity = Math.min(1);
        } else if (dy < -verticalThreshold) {
            direction = 'up';
            opacity = Math.min( 1);
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
        setIsAnimating(true);

        // 1. Создаем иконку фильтра динамически
        const createFeedbackIcon = (side) => {
            const icon = document.createElement('div');
            icon.className = `${styles.swipeFeedback} ${styles[`swipeFeedback${side}`]} ${styles.onboardingIcon}`;
            icon.innerHTML = `<img src="/subicons/filter.svg" alt="Filter" style="width:40px;height:40px"/>`;
            return icon;
        };

        // 2. Добавляем иконку на карточку
        const feedbackIcon = createFeedbackIcon(direction === 'right' ? 'Left' : 'Right');
        cardRef.appendChild(feedbackIcon);

        // 3. Показываем иконку с анимацией
        setTimeout(() => {
            feedbackIcon.style.opacity = '1';
            feedbackIcon.style.transform = 'translateY(-50%) scale(1.2)';
        }, 50);

        // 4. Параметры анимации свайпа
        const params = {
            left: {
                endX: -window.innerWidth * 0.7,
                endY: 0,
                rotation: -15
            },
            right: {
                endX: window.innerWidth * 0.7,
                endY: 0,
                rotation: 15
            },
            up: {
                endX: window.innerWidth * 0.5,
                endY: -window.innerHeight * 0.5,
                rotation: 5
            }
        }[direction];

        const originalStyles = {
            transform: cardRef.style.transform,
            transition: cardRef.style.transition,
            opacity: cardRef.style.opacity,
            zIndex: cardRef.style.zIndex
        };

        cardRef.style.transition = 'transform 800ms ease-out, opacity 800ms ease-out';
        cardRef.style.transform = `translate(${params.endX}px, ${params.endY}px) rotate(${params.rotation}deg)`;
        cardRef.style.zIndex = '10000';

        setTimeout(() => {
            // Удаляем иконку фильтра
            feedbackIcon.style.opacity = '0';
            feedbackIcon.style.transform = 'translateY(-50%) scale(0.5)';

            cardRef.style.transition = 'transform 300ms ease-out, opacity 300ms ease-out';
            cardRef.style.transform = originalStyles.transform;

            setTimeout(() => {
                // Окончательная очистка
                cardRef.removeChild(feedbackIcon);
                cardRef.style.transition = originalStyles.transition;
                cardRef.style.zIndex = originalStyles.zIndex;
                setIsOnboardingActive(false);
                setIsAnimating(false);
            }, 300);
        }, 800);
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
                            swipeConfig={swipeConfig}
                            isExpanded={expandedCardId === card.id}
                            onExpand={() => setExpandedCardId(card.id)}
                            onCollapse={() => setExpandedCardId(null)}
                            isPending={card._pending}
                            swipeProgress={index === 0 ? swipeProgress : {direction: null, opacity: 0}}
                            isTopCard={index === 0}
                            setCardRef={setCardRef}
                            isOnboardingActive={showOnboarding && index === 0}
                            onSaveClick={handleOpenSaveModal}
                        />
                    ))}

                    {!store.catalogStore.loading && store.catalogStore.cards?.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.notCard}>
                                <p  className={styles.notCardText}>Товары из ассортимента брендов закончились</p>
                            </div>
                            <p className={styles.notCardCatText}>
                                Но можно посмотреть подборки
                            </p>
                            <div className={styles.collectionsBlock}>
                                {store?.popular?.collections?.map((item) => (
                                    <div
                                        key={`${item.id}`}
                                        className={styles.collectionCard}
                                        onClick={() => navigate(`/trands/collection/${item.id}`)}
                                    >
                                        <img
                                            className={styles.collectionImg}
                                            src={item.cover_image_url}
                                            alt={item.name}
                                        />
                                        <p className={styles.collectionTitle}>{item.name}</p>
                                    </div>))}
                            </div>

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
            </div>
            <SaveToCollectionModal
                isOpen={isSaveModalOpen}
                onClose={handleCloseSaveModal}
                productId={selectedProduct?.id}
                productName={selectedProduct?.name}
                productInCollection={selectedProduct?.is_contained_in_user_collections}
                onSaveSuccess={(isSaved) => {
                    if (selectedProduct) {
                        handleSaveSuccess(selectedProduct.id, isSaved);
                    }
                }}
            />
        </>
    );
});

export default TinderCards;