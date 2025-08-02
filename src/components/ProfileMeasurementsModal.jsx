import {useEffect, useState} from "react";
import { observer } from "mobx-react";
import { useAuth } from "../provider/AuthProvider.jsx";
import { useStore } from "../provider/StoreContext.jsx";
import ButtonWrapper from "./utils/ButtonWrapper.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import FitOptions from "./FitOptions.jsx";
import ParamsTab from "./ParamsTab.jsx";
import SizeGrid from "./SizeGrid.jsx";
import TabButton from "./TabButton.jsx";
import UserInfo from "./UserInfo.jsx";
import styles from './ui/profile.module.css';
import {AUTH_TOKEN} from "../constants.js";
import {runInAction} from "mobx";

const ProfileMeasurementsModal = observer(({ isOpen, onClose }) => {
    const store = useStore();
    const [preferences, setPreferences] = useState({
        clothing_size: store.authStore.data?.preferences?.clothing_size || 'M',
        size_parameters: store.authStore.data?.preferences?.size_parameters || {
            breast: 90,
            waist: 60,
            hip: 90
        },
        wearing_styles: store.authStore.data?.preferences?.wearing_styles || [],
        age: store.authStore.data?.preferences?.age || 25 // ← добавили
    });

    const { data } = useAuth();
    const [activeTab, setActiveTab] = useState("size");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    console.log(preferences)

    useEffect(() => {
        console.log("Current clothing_size:", preferences.clothing_size);
    }, [preferences.clothing_size]);

    const updateParam = (field, value) => {
        if (['breast', 'waist', 'hip'].includes(field)) {
            setPreferences(prev => ({
                ...prev,
                size_parameters: {
                    ...prev.size_parameters,
                    [field]: value
                }
            }));
        } else if (field === 'wearing_styles') {
            setPreferences(prev => {
                const newStyles = prev.wearing_styles.includes(value)
                    ? prev.wearing_styles.filter(f => f !== value)
                    : [...prev.wearing_styles, value];

                return {
                    ...prev,
                    wearing_styles: newStyles
                };
            });
        } else {
            setPreferences(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    console.log(preferences)
    const handleSaveChanges = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/user', {
                method: 'PATCH',
                headers: {
                    "Authorization": `tma ${AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    preferences: {
                        clothing_size: preferences.clothing_size,
                        size_parameters: preferences.size_parameters,
                        wearing_styles: preferences.wearing_styles
                    }
                })
            });

            if (!response.ok) throw new Error('Update failed');

            const updated = await response.json();

            runInAction(() => {
                if (store.authStore.data) {
                    store.authStore.data.preferences = {
                        ...store.authStore.data.preferences,
                        clothing_size: preferences.clothing_size,
                        wearing_styles: preferences.wearing_styles,
                        size_parameters: preferences.size_parameters
                    };
                }
            });

            onClose();
        } catch (error) {
            console.error('Update error:', error);
            setError('Failed to save changes');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <UserInfo
                    photoUrl={data?.photo_url}
                    firstName={data?.first_name}
                    lastName={data?.last_name}
                />

                <p className={styles.manuLabel} style={{paddingLeft: '2%'}}>
                    Мои параметры
                </p>

                <div className={styles.paramsBlock}>
                    <div className={styles.tabs}>
                        <TabButton
                            active={activeTab === "size"}
                            onClick={() => setActiveTab("size")}
                            label="Размер"
                        />
                        <TabButton
                            active={activeTab === "params"}
                            onClick={() => setActiveTab("params")}
                            label="Параметры"
                        />
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === "size" && (
                            <SizeGrid
                                params={preferences}
                                updateParam={updateParam}
                            />
                        )}

                        {activeTab === "params" && (
                            <ParamsTab
                                params={preferences}
                                updateParam={updateParam}
                            />
                        )}

                        <div className={styles.fitOptionsWrapper}>
                            <p>Ношу одежду</p>
                            <FitOptions
                                params={preferences}
                                updateParam={(value) => updateParam('wearing_styles', value)}
                            />
                        </div>
                    </div>
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <ButtonWrapper>
                    <FullScreenButton
                        color='var(--light-gray)'
                        textColor='var(--black)'
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Сохранение...' : 'Изменить значения'}
                    </FullScreenButton>
                    <FullScreenButton
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Отменить
                    </FullScreenButton>
                </ButtonWrapper>
            </div>
        </div>
    );
});

export default ProfileMeasurementsModal;