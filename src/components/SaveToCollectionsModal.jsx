import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../provider/StoreContext.jsx';
import styles from './ui/saveToCollectionsModal.module.css'
import CustomCheckbox from "./CustomCheckbox.jsx";
import Modal from "./utils/Modal.jsx";
import FullScreenButton from "./FullScrinButton.jsx";

const SaveToCollectionModal = observer(({
                                            isOpen,
                                            onClose,
                                            productId,
                                            productName
                                        }) => {
    const store = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    const filteredCollections = store?.authStore?.data?.collections?.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleCollectionToggle = (collectionId) => {
        setSelectedCollections(prev =>
            prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const handleSave = async () => {
        if (!productId || selectedCollections.length === 0) return;

        setIsLoading(true);
        try {
            await store.productStore.addToCollections({
                collection_ids: selectedCollections,
                product_ids: [productId]
            });
            onClose();
        } catch (error) {
            console.error('Ошибка при сохранении в коллекцию:', error);
        } finally {
            setIsLoading(false);
        }
    };

    console.log(filteredCollections)

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.scrollWrapper}>
                <div className={styles.modalHeader}>
                    <p>Добавить в подборку</p>
                </div>

                <div className={styles.searchContainer}>
                <span
                    className={styles.searchIcon}
                    role="button"
                    tabIndex={0}
                >
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
                                    <img className={styles.collectionImg} src={collection?.cover_image_url}/>
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
                            {searchQuery ? 'Ничего не найдено' : 'У вас пока нет коллекций'}
                        </div>
                    )}
                </div>

            </div>
            <div className={styles.modalFooter}>
                <FullScreenButton
                    onClick={handleSave}
                    disabled={selectedCollections.length === 0 || isLoading}
                    className={styles.saveButton}
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </FullScreenButton>
            </div>
        </Modal>
    );
});

export default SaveToCollectionModal;