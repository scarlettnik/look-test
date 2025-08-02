import { createContext, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from "./StoreContext.jsx";

const AuthContext = createContext();

export const AuthProvider = observer(({ children }) => {
    const { authStore } = useStore();

    // Добавляем проверку на существование authStore и postData
    useEffect(() => {
        if (authStore && typeof authStore.postData === 'function' && !authStore.hasFetched) {
            authStore.postData();
        }
    }, [authStore]);

    const contextValue = authStore ? {
        data: authStore.data,
        loading: authStore.loading,
        error: authStore.error
    } : {
        data: null,
        loading: false,
        error: 'AuthStore not available'
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};