// HelpStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import { AUTH_TOKEN } from "../constants.js";

class HelpStore {
    metaData = null;
    loading = false;
    error = null;

    constructor(rootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
        this.fetchMetaData();
    }

    async fetchMetaData() {
        this.loading = true;
        this.error = null;

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/catalog/search/meta', {
                method: 'GET',
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch meta data');
            }

            const data = await response.json();

            runInAction(() => {
                this.metaData = data;
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.message;
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }
}

export default HelpStore;