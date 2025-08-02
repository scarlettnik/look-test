// ShoppingCard.jsx
import React, { useState } from 'react';
import styles from './ui/shoppingCart.module.css';
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import { observer } from 'mobx-react';
import { useStore } from "../provider/StoreContext.jsx";
import useIsKeyboardOpen from "../hooks/useIsKeyboardOpen.js";

const ShoppingCard = observer(() => {
    const store = useStore();
    const [promoCode, setPromoCode] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('standard');
    const [showPromoInput, setShowPromoInput] = useState(false);
    const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
    const isKeyBoardOpen = useIsKeyboardOpen()

    if (store.cartStore.isCartLoading) {
        return <div className={styles.loading}>Загрузка корзины...</div>;
    }

    // if (store.cartStore.cartError) {
    //     return <div className={styles.error}>Ошибка: {store.cartStore.cartError}</div>;
    // }

    const subtotal = store.cartStore.cart.reduce((sum, item) => sum + (item.price || 10), 0);
    const deliveryCost = deliveryMethod === 'express' ? 10 : 5;
    const total = subtotal + deliveryCost;

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.inCreate}>
                    <p style={{width: '100vw', textAlign: 'center', right: '0', fontSize: '14px'
                    }}>
                        Страница находится в разработке
                    </p>
                </div>
                {/*<div className={styles.cardItems}>*/}
                {/*    {store?.cartStore.cart.length === 0 ? (*/}
                {/*        <div className={styles.emptyCart}>Корзина пуста</div>*/}
                {/*    ) : (*/}
                {/*        store.cartStore.cart.map(item => (*/}
                {/*            <div key={item.cartItemId} className={styles.cartItem}>*/}
                {/*                <img*/}
                {/*                    src={item.image_urls?.[0] || "https://via.placeholder.com/150"}*/}
                {/*                    alt={item.name}*/}
                {/*                    className={styles.itemImage}*/}
                {/*                />*/}
                {/*                <div className={styles.itemDetails}>*/}
                {/*                    <div className={styles.itemTitle}>{item.name}</div>*/}
                {/*                    <div className={styles.itemBrand}>{item.brand || "Бренд не указан"}</div>*/}
                {/*                    <div className={styles.price}>{item.price?.toFixed(2) || 10} ₽</div>*/}
                {/*                </div>*/}
                {/*                <button*/}
                {/*                    className={styles.deleteButton}*/}
                {/*                    onClick={() => store.removeFromCart(item.cartItemId)}*/}
                {/*                    disabled={store.isCartLoading}*/}
                {/*                >*/}
                {/*                    <Trash2 size={18}/>*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        ))*/}
                {/*    )}*/}

                {/*    <div className={styles.promoSection}>*/}
                {/*        <div*/}
                {/*            className={styles.sectionHeader}*/}
                {/*            onClick={() => setShowPromoInput(!showPromoInput)}*/}
                {/*        >*/}
                {/*            <span>Промокод</span>*/}
                {/*            {showPromoInput ? <ChevronUp/> : <ChevronDown/>}*/}
                {/*        </div>*/}

                {/*        {showPromoInput && (*/}
                {/*            <div className={styles.promoInputGroup}>*/}
                {/*                <input*/}
                {/*                    type="text"*/}
                {/*                    placeholder="Введите промокод"*/}
                {/*                    value={promoCode}*/}
                {/*                    onChange={(e) => setPromoCode(e.target.value)}*/}
                {/*                    className={styles.promoInput}*/}
                {/*                />*/}
                {/*                <button*/}
                {/*                    className={styles.applyButton}*/}
                {/*                    onClick={() => console.log('Применить промокод:', promoCode)}*/}
                {/*                >*/}
                {/*                    Применить*/}
                {/*                </button>*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}

                {/*    <div className={styles.deliverySection}>*/}
                {/*        <div*/}
                {/*            className={styles.sectionHeader}*/}
                {/*            onClick={() => setShowDeliveryOptions(!showDeliveryOptions)}*/}
                {/*        >*/}
                {/*            <span>Способ доставки</span>*/}
                {/*            {showDeliveryOptions ? <ChevronUp/> : <ChevronDown/>}*/}
                {/*        </div>*/}

                {/*        {showDeliveryOptions && (*/}
                {/*            <div className={styles.deliveryOptions}>*/}
                {/*                <label className={styles.deliveryOption}>*/}
                {/*                    <div className={styles.deliveryInfo}>*/}
                {/*                        <div>*/}
                {/*                            <input*/}
                {/*                                type="radio"*/}
                {/*                                name="delivery"*/}
                {/*                                value="standard"*/}
                {/*                                checked={deliveryMethod === 'standard'}*/}
                {/*                                onChange={() => setDeliveryMethod('standard')}*/}
                {/*                                className={styles.radioInput}*/}
                {/*                            />*/}
                {/*                            <span>Стандартная доставка</span>*/}
                {/*                        </div>*/}
                {/*                        <span>5.00 ₽</span>*/}
                {/*                    </div>*/}
                {/*                    <div className={styles.deliveryTime}>3-5 рабочих дней</div>*/}

                {/*                </label>*/}

                {/*                <label className={styles.deliveryOption}>*/}
                {/*                    <div className={styles.optionContent}>*/}

                {/*                        <div className={styles.deliveryInfo}>*/}
                {/*                            <div>*/}
                {/*                                <input*/}
                {/*                                    type="radio"*/}
                {/*                                    name="delivery"*/}
                {/*                                    value="express"*/}
                {/*                                    checked={deliveryMethod === 'express'}*/}
                {/*                                    onChange={() => setDeliveryMethod('express')}*/}
                {/*                                    className={styles.radioInput}*/}
                {/*                                />*/}
                {/*                                <span>Экспресс-доставка</span>*/}
                {/*                            </div>*/}
                {/*                            <span>10.00 ₽</span>*/}
                {/*                        </div>*/}
                {/*                        <div className={styles.deliveryTime}>1-2 рабочих дня</div>*/}
                {/*                    </div>*/}
                {/*                </label>*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}

                {/*    <div className={styles.summarySection}>*/}
                {/*        <div className={styles.summaryRow}>*/}
                {/*            <span>Товары:</span>*/}
                {/*            <span>{subtotal.toFixed(2)} ₽</span>*/}
                {/*        </div>*/}
                {/*        <div className={styles.summaryRow}>*/}
                {/*            <span>Доставка:</span>*/}
                {/*            <span>{deliveryCost.toFixed(2)} ₽</span>*/}
                {/*        </div>*/}
                {/*        <div className={styles.summaryRowTotal}>*/}
                {/*            <span>Итого:</span>*/}
                {/*            <span>{total.toFixed(2)} ₽</span>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*    {store.cartStore.cart.length > 0 && !isKeyBoardOpen && (*/}
                {/*        <div className={styles.checkoutButtonContainer}>*/}
                {/*            <FullScreenButton onClick={() => console.log('Оформление заказа')}>*/}
                {/*                Оформить заказ*/}
                {/*            </FullScreenButton>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</div>*/}

            </div>

            <Sidebar/>
        </div>
    );
});

export default ShoppingCard;