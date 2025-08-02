import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../provider/StoreContext.jsx';
import styles from './ui/saveToCollectionsModal.module.css';
import CustomCheckbox from "./CustomCheckbox.jsx";
import Modal from "./utils/Modal.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import {AUTH_TOKEN} from "../constants.js";
import {runInAction} from "mobx";
import AddList from "./AddList.jsx";

const SaveToCollectionModal = observer(({
                                            isOpen,
                                            onClose,
                                            productId,
                                            productName,
                                            productInCollection,
                                            onSaveSuccess
                                        }) => {
    const store = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [initialCollections, setInitialCollections] = useState([]);
    const [defaultCollectionId, setDefaultCollectionId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const createClose = () => {
        setIsModalOpen(false);
    };
    const handleCreateCollection = async (name, coverUrl) => {
        if (!name.trim()) return;
        setIsModalOpen(false);
        try {
            const newCollection = await store.collectionStore.createCollection(name, coverUrl);
        } catch (error) {
            console.error('Create failed:', error);
            alert('Не удалось создать коллекцию. Попробуйте снова.');
        }
    };

    const createOpen = () => {
        setIsModalOpen(true);
    };
    useEffect(() => {
        if (isOpen && productId) {
            loadCollections();
        }
    }, [isOpen, productId]);

    console.log(productId)
    console.log(productName);

    const loadCollections = async () => {
        try {
            const collections = store?.authStore?.data?.collections || [];
            if (collections.length > 0) {
                setDefaultCollectionId(collections[0].id);
                setSelectedCollections([]);
            }

            const response = await fetch(`https://api.lookvogue.ru/v1/product/${productId}/collections`, {
                headers: {
                    'Authorization': `tma ${AUTH_TOKEN}`
                }
            });
            const data = await response.json();
            setInitialCollections(data || []);
            if (data && data.length > 1) {
                setSelectedCollections(data);
            } else if (data && data.length === 1 && data[0] !== collections[0]?.id) {
                setSelectedCollections(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки коллекций:', error);
        }
    };
    console.log(selectedCollections)
    const filteredCollections = store?.authStore?.data?.collections
        ?.filter((collection, index) =>
            index !== 0 &&
            collection.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

    const handleCollectionToggle = (collectionId) => {
        setSelectedCollections(prev => {
            let newSelection;

            if (collectionId === defaultCollectionId) {
                if (prev.includes(collectionId)) {
                    newSelection = prev.filter(id => id !== collectionId);
                } else {
                    newSelection = [...prev, collectionId];
                }
            }
            else {
                if (prev.includes(collectionId)) {
                    newSelection = prev.filter(id => id !== collectionId);

                    if (newSelection.length === 1 && newSelection[0] === defaultCollectionId) {
                        newSelection = [];
                    }
                } else {
                    newSelection = [...prev, collectionId];

                    if (!prev.includes(defaultCollectionId) &&
                        newSelection.some(id => id !== defaultCollectionId)) {
                        newSelection.push(defaultCollectionId);
                    }
                }
            }

            return newSelection;
        });
    };

    const handleSave = async () => {
        if (!productId) return;

        setIsLoading(true);

        const requestData = [...selectedCollections];
        const isSaved = requestData.length > 0;


        try {
            const response = await fetch(`https://api.lookvogue.ru/v1/product/${productId}/collections`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `tma ${AUTH_TOKEN}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) throw new Error('Ошибка сохранения');

            runInAction(() => {
                const popularItem = store.popular.popular.find(item =>
                    item.products?.some(p => p.id === productId)
                );
                if (popularItem) {
                    const product = popularItem.products.find(p => p.id === productId);
                    if (product) {
                        product.is_contained_in_user_collections = requestData.length > 0;
                    }
                }

                if (store.collectionStore.currentCollection?.products) {
                    const productInCollection = store.collectionStore.currentCollection.products.find(p => p.id === productId);
                    if (productInCollection) {
                        productInCollection.is_contained_in_user_collections = requestData.length > 0;
                    }
                }
            });
            if (onSaveSuccess) {
                onSaveSuccess(isSaved);
            }
            onClose();
        } catch (error) {
            console.error('Ошибка при сохранении в коллекцию:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal height={'90vh'} isOpen={isOpen} onClose={onClose}>
            <div className={styles.scrollWrapper}>
                <div className={styles.modalHeader}>
                    <p>Добавить в подборку</p>
                </div>

                <div className={styles.searchContainer}>
                    <span className={styles.searchIcon} role="button" tabIndex={0}>
                        <img src="/subicons/search.svg" alt="Search"/>
                    </span>

                    <input
                        type="text"
                        placeholder="Поиск по подборкам"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />

                    {searchQuery && (
                        <span
                            className={styles.clearIcon}
                            onClick={() => setSearchQuery('')}
                            role="button"
                            tabIndex={0}
                        >
                            <img src="/subicons/close.svg" alt="Clear"/>
                        </span>
                    )}
                </div>

                <div className={styles.collectionsList}>
                    {filteredCollections.length > 0 ? (
                        filteredCollections.map(collection => (
                            <div key={collection.id} className={styles.collectionItem}>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <img
                                        className={styles.collectionImg}
                                        src={collection?.cover_image_url}
                                        alt={collection.name}
                                    />
                                    <span>{collection.name}</span>
                                </div>
                                <CustomCheckbox
                                    id={collection.id}
                                    checked={selectedCollections.includes(collection.id)}
                                    onChange={() => handleCollectionToggle(collection.id)}
                                    className={styles.hiddenCheckbox}
                                />
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResults}>
                        </div>
                    )}
                    <div onClick={createOpen} style={{display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                        <button className={styles.circleButton} >
                            <img src="/subicons/blackadd.svg"/>
                        </button>
                        <p style={{fontSize: '12px', fontWeight: '400', paddingLeft: '10px'}}>
                            Создать новую подборку
                        </p>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={createClose}>
                <AddList onCreate={handleCreateCollection}/>
            </Modal>
            <div className={styles.modalFooter}>

                <FullScreenButton
                    onClick={handleSave}
                    disabled={isLoading}
                    className={styles.saveButton}
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </FullScreenButton>
            </div>
        </Modal>
    );
});

export default SaveToCollectionModal;