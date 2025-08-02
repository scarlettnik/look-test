import {createContext, useContext} from 'react';
import appStore from '../store.js';

export const StoreContext = createContext(appStore);

export const StoreProvider = ({ children }) => {
    return (
        <StoreContext.Provider value={appStore}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    return useContext(StoreContext);
};