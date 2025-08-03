import { makeAutoObservable, runInAction } from "mobx";
import {AUTH_TOKEN} from "../constants.js";

class PopularStore {
    trends = [];
    collections = [];
    brands = [];
    personalBrands = [];

    loadingTrends = false;
    loadingTrandsCollections = false;
    loadingBrands = false;
    loadingBrandsCollections = false;

    constructor() {
        makeAutoObservable(this);
        this.fetchCollections();
    }

    fetchTrends = async () => {
        if (this.trends.length > 0) return;

        this.loadingTrends = true;
        try {
            const res = await fetch("https://api.lookvogue.ru/v1/feature/trends/global", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,

                },
            });
            const data = await res.json();
            runInAction(() => {
                this.trends = data;
            });
        } catch (e) {
            console.error(e);
        } finally {
            runInAction(() => {
                this.loadingTrends = false;
            });
        }
    };

    fetchCollections = async () => {
        if (this.collections.length > 0) return;

        this.loadingTrandsCollections = true;
        try {
            const res = await fetch("https://api.lookvogue.ru/v1/feature/trends/personal", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
            });
            const data = await res.json();
            runInAction(() => {
                this.collections = data;
            });
        } catch (e) {
            console.error(e);
        } finally {
            runInAction(() => {
                this.loadingTrandsCollections = false;
            });
        }
    };

    fetchBrands = async () => {
        if (this.brands.length > 0) return;

        this.loadingBrands = true;
        try {
            const res = await fetch("https://api.lookvogue.ru/v1/feature/brands/global", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
            });
            const data = await res.json();
            runInAction(() => {
                this.brands = data;
            });
        } catch (e) {
            console.error(e);
        } finally {
            runInAction(() => {
                this.loadingBrands = false;
            });
        }
    };

    fetchPersonalBrands = async () => {
        if (this.personalBrands.length > 0) return;
        this.loadingBrandsCollections = true;
        try {
            const res = await fetch("https://api.lookvogue.ru/v1/feature/brands/personal", {
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
            });
            const data = await res.json();
            runInAction(() => {
                this.personalBrands = data;
            });
        } catch (e) {
            console.error(e);
        } finally {
            runInAction(() => {
                this.loadingBrandsCollections = false;});
        }
    };

    get popular() {
        return [...this.trends, ...this.collections, ...this.brands, ...this.personalBrands];
    }
}

export default PopularStore;
