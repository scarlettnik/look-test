import { makeAutoObservable } from "mobx";
import AuthStore from "./provider/AuthStore";
import CollectionStore from "./provider/collectionStore";
import CartStore from "./provider/cardStore";
import CatalogStore from "./provider/catalogStore";
import Onboarding from "./provider/Onboarding";
import PopularStore from "./provider/PopularStore";
import HelpStore from "./provider/HelpStore"; // Новый импорт


class AppStore {
    authStore = new AuthStore(this);
    collectionStore = new CollectionStore(this);
    cartStore = new CartStore(this);
    catalogStore = new CatalogStore(this);
    onboarding = new Onboarding(this);
    popular = new PopularStore(this);
    help = new HelpStore(this);
    constructor() {
        makeAutoObservable(this);
    }
}

const appStore = new AppStore();
export default appStore;
