// CollectionStore.js
import {makeAutoObservable, runInAction} from 'mobx';
import { AUTH_TOKEN } from "../constants.js";

class CollectionStore {
    currentCollection = null;
    loading = false;
    error = null;

    constructor(rootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }

    async loadCollection(collectionId, isSave = false) {
        this.loading = true;
        this.error = null;

        try {
            const response = await fetch(`https://api.lookvogue.ru/v1/collection/${collectionId}`, {
                method: 'GET',
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
            });
            const data = await response.json();
            this.currentCollection = data;
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    async createCollection(name, coverImageUrl) {
        this.loading = true;
        this.error = null;

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/collection', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
                body: JSON.stringify({
                    name: name,
                    cover_image_url: coverImageUrl
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create collection');
            }

            const newCollection = await response.json();

            if (this.rootStore.authStore.data?.collections) {
                this.rootStore.authStore.data.collections.splice(1, 0, newCollection);
            }

            return newCollection;
        } catch (error) {
            this.error = error.message;
            throw error;
        } finally {
            this.loading = false;
        }
    }

    async deleteCollections(collectionIds) {
        this.loading = true;
        this.error = null;

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/collections', {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
                body: JSON.stringify(collectionIds)
            });

            if (!response.ok) {
                throw new Error('Failed to delete collections');
            }

            // Обновляем данные в authStore
            if (this.rootStore.authStore.data?.collections) {
                this.rootStore.authStore.data.collections =
                    this.rootStore.authStore.data.collections.filter(
                        collection => !collectionIds.includes(collection.id)
                    );
            }
        } catch (error) {
            this.error = error.message;
            throw error;
        } finally {
            this.loading = false;
        }
    }


    async removeProductsFromCollection(collectionId, productIds) {
        try {
            const response = await fetch('https://api.lookvogue.ru/v1/collection/products', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `tma ${AUTH_TOKEN}`
                },
                body: JSON.stringify({
                    collection_ids: [collectionId],
                    product_ids: productIds
                })
            });

            if (!response.ok) throw new Error('Ошибка удаления товаров');

            runInAction(() => {
                if (this.currentCollection?.id === collectionId) {
                    this.currentCollection.products = this.currentCollection.products.filter(
                        product => !productIds.includes(product.id)
                    );
                }
            });
        } catch (error) {
            console.error('Ошибка удаления товаров:', error);
            throw error;
        }
    }
    updateCollectionLocal = (collectionId, updates) => {
        if (this.currentCollection && this.currentCollection.id === collectionId) {
            this.currentCollection = {
                ...this.currentCollection,
                ...updates
            };
        }
        // Также можно обновить в списке коллекций, если нужно
    };

}

export default CollectionStore;