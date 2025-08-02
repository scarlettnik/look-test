import { makeAutoObservable, runInAction } from "mobx";
import {AUTH_TOKEN} from "../constants.js";

class AuthStore {
    data = null;
    loading = false;
    error = null;
    hasFetched = false;

    constructor() {
        makeAutoObservable(this);
    }

    async postData() {  // Переименовали initialize в postData для согласованности
        if (this.hasFetched || this.loading) return;

        this.loading = true;
        this.error = null;

        const authToken = AUTH_TOKEN;

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/auth/init-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `tma ${authToken}`
                },
            });

            const result = await response.json();

            runInAction(() => {
                this.data = result;
                this.hasFetched = true;
            });

        } catch (err) {
            runInAction(() => {
                this.error = err.message;
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    setUserData(newData) {
        runInAction(() => {
            this.data = {
                ...this.data,
                ...newData,
                preferences: {
                    ...this.data?.preferences,
                    ...newData.preferences
                }
            };
        });
    }

}

export default AuthStore;