import { makeAutoObservable } from "mobx";
import {AUTH_TOKEN} from "../constants.js";

class CartStore {
    cart = [];
    isCartLoading = false;
    cartError = null;

    constructor() {
        makeAutoObservable(this);
        this.loadCart();
    }

    getAuthHeaders() {
        const authToken = AUTH_TOKEN;

        return {
            "ngrok-skip-browser-warning": true,
            'Content-Type': 'application/json',
            'Authorization': `tma ${authToken}`
        };
    }

    async loadCart() {
        this.isCartLoading = true;
        this.cartError = null;

        try {
            const response = await fetch(`https://api.lookvogue.ru/v1/catalog/search`, {
                method: 'POST',
                body: JSON.stringify({}),
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const cartData = await response.json();
            this.cart = cartData.map(item => ({
                ...item,
                cartItemId: item.id
            }));
        } catch (err) {
            this.cartError = err.message;
            console.error("Cart loading error:", err);
        } finally {
            this.isCartLoading = false;
        }
    }
}

export default CartStore;