import React, {useEffect, useMemo, useState} from 'react';
import {Link, useParams, useNavigate, useLocation} from 'react-router-dom';
import styles from './ui/compilation.module.css';
import Sidebar from './Sidebar';
import Modal from './utils/Modal.jsx'
import { observer } from "mobx-react-lite";
import { useStore } from '../provider/StoreContext';
import Share from "./utils/Share.jsx";
import AddList from "./AddList.jsx";
import CustomSkeleton from "./utils/CustomSkeleton.jsx";
import {FilterBar} from "./FilterBar.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import {AUTH_TOKEN} from "../constants.js";
import ButtonWrapper from "./utils/ButtonWrapper.jsx";
import CustomCheckbox from "./CustomCheckbox.jsx";

const Compilation = observer(() => {
    const { id } = useParams();
    const location = useLocation();
    const { collectionStore } = useStore();
    const [isSave, setIsSave] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [filters, setFilters] = useState({
        size: [],
        brand: [],
        price: { min: null, max: null },
        type: []
    });

    useEffect(() => {
        const isSaveCollection = location.pathname.includes('/save/');
        setIsSave(isSaveCollection);
        collectionStore.loadCollection(id, isSaveCollection);
    }, [id, location.pathname, collectionStore]);

    const { currentCollection: save, loading } = collectionStore;

    const filteredProducts = useMemo(() => {
        if (!save?.products) return [];

        return save.products.filter(product => {
            if (filters.size.length > 0) {
                const productSizes = product.sizes || [];
                const hasSizeMatch = productSizes.some(productSize => {
                    if (Array.isArray(productSize)) {
                        const [sizeName, sizeMin, sizeMax] = productSize;
                        return (
                            filters.size.includes(sizeName) ||
                            filters.size.includes(sizeMin) ||
                            filters.size.includes(sizeMax)
                        );
                    }
                    return filters.size.includes(productSize);
                });

                if (!hasSizeMatch) return false;
            }

            if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
                return false;
            }

            if (filters.price.min !== null && product.price < filters.price.min) {
                return false;
            }
            if (filters.price.max !== null && product.price > filters.price.max) {
                return false;
            }

            if (filters.type.length > 0 && !filters.type.includes(product.type)) {
                return false;
            }

            return true;
        });
    }, [save?.products, filters]);

    const handleDeleteItems = async (productIds) => {
        try {
            await collectionStore.removeProductsFromCollection(id, productIds);
        } catch (error) {
            console.error('Ошибка удаления товаров:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.scrollContent}>
                <Banner
                    id={id}
                    save={save}
                    isSave={isSave}
                    loading={loading}
                    onEnterEditMode={() => setIsEditMode(true)}
                />
                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    products={save?.products || []}
                />
                <ItemGrid
                    items={filteredProducts}
                    loading={loading}
                    isEditMode={isEditMode}
                    onDeleteItems={handleDeleteItems}
                    onCancelEdit={() => setIsEditMode(false)}
                />
            </div>
            <Sidebar />
        </div>
    );
});

export default Compilation;


export const Banner = observer(({ save, isSave = false, loading, id, onEnterEditMode }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const store = useStore();

    const handleCloseShare = () => setIsShareOpen(false);

    const handleCreateCollection = (name, coverUrl) => {
        store.createCollection(name, coverUrl);
        setIsModalOpen(false);
    };

    const handleUpdateCollection = async (name, coverUrl) => {
        if (editingCollection) {
            try {
                const response = await fetch(`https://api.lookvogue.ru/v1/collection/${editingCollection.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `tma ${AUTH_TOKEN}`
                    },
                    body: JSON.stringify({
                        "name": name,
                        "cover_image_url": coverUrl
                    })
                });

                if (!response.ok) {
                    throw new Error('Ошибка при обновлении коллекции на сервере');
                }

                store.collectionStore.updateCollectionLocal(editingCollection.id, {
                    name,
                    cover_image_url: coverUrl
                });

                setIsModalOpen(false);
                setEditingCollection(null);

            } catch (error) {
                console.error('Ошибка при обновлении коллекции:', error);
            }
        }
    };
    const handleEditCollection = () => {
        setEditingCollection(save);
        setIsEditMode(true);
    };

    const handleEditProducts = () => {
        onEnterEditMode?.();
        setIsEditMode(false);
    };
    const handleCancelEdit = () => {
        setIsEditMode(false);
    };

    if (loading) {
        return (
            <div className={styles.bannerContainer}>
                <div className={styles.banner}>
                    <CustomSkeleton className={styles.bannerImage} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.bannerContainer}>
            <div className={styles.banner}>
                <img
                    src={save?.cover_image_url || '/placeholder-banner.jpg'}
                    alt={save?.name}
                    className={styles.bannerImage}
                    onError={(e) => {
                        e.target.src = '/placeholder-banner.jpg';
                    }}
                />
                <div className={styles.bannerText}>{save?.name}</div>

                <button onClick={() => setIsShareOpen(true)}>
                    <img className={styles.shareIcon} src='/subicons/share.svg' alt="Поделиться"/>
                </button>

                {isSave && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditCollection();
                        }}
                    >
                        <img className={styles.editIcon} src='/subicons/edit.svg' alt="Редактировать"/>
                    </button>
                )}

                {isEditMode && (
                    <div className={styles.editOverlay}>
                        <FullScreenButton
                            color='var(--white)'
                            textColor='var(--black'
                            onClick={() => {
                                setIsModalOpen(true);
                                setIsEditMode(false);
                            }}
                        >
                            Переименовать
                        </FullScreenButton>
                        <FullScreenButton
                            color='var(--white)'
                            textColor='var(--black'
                            onClick={handleEditProducts}
                        >
                            Удалить товары из подборки
                        </FullScreenButton>
                        <FullScreenButton
                            onClick={handleCancelEdit}
                        >
                            Отменить
                        </FullScreenButton>
                    </div>
                )}

                <Modal isOpen={isShareOpen} onClose={handleCloseShare}>
                    <Share id={id}/>
                </Modal>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <AddList
                        onCreate={handleCreateCollection}
                        onUpdate={handleUpdateCollection}
                        collection={editingCollection}
                        coverImage={save?.cover_image_url}
                    />
                </Modal>
            </div>
        </div>
    );
});

const ItemGrid = observer(({ items, loading, isEditMode, onDeleteItems, onCancelEdit }) => {
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        if (!isEditMode) {
            setSelectedItems([]);
        }
    }, [isEditMode]);

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleDelete = async () => {
        if (selectedItems.length === 0) return;
        await onDeleteItems(selectedItems);
        setSelectedItems([]);
        onCancelEdit();
    };

    if (loading) {
        return (
            <div className={styles.itemsGrid}>
                {[...Array(8)].map((_, i) => (
                    <CustomSkeleton
                        key={i}
                        className={styles.itemImage}
                        style={{ height: '200px' }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={styles.itemsGrid}>
            {isEditMode && (
                <ButtonWrapper>
                    <FullScreenButton
                        className={styles.deleteButton}
                        onClick={handleDelete}
                        disabled={selectedItems.length === 0}
                    >
                        Удалить выбранные
                    </FullScreenButton>
                    <FullScreenButton
                        className={styles.cancelButton}
                        onClick={onCancelEdit}
                    >
                        Отменить
                    </FullScreenButton>
                </ButtonWrapper>
            )}

            {items?.map(item => (
                <div key={item?.id} className={styles.itemContainer}>
                    {isEditMode && (
                        <div
                            className={styles.checkboxContainer}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleItemSelection(item.id);
                            }}
                        >
                            <CustomCheckbox
                                id={`item-${item.id}`}
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                className={styles.itemCheckbox}
                            />

                        </div>
                    )}
                    <Link to={`/product/${item?.id}`} className={styles.itemLink}>
                        <img
                            src={item?.image_urls?.[0]}
                            alt={item.name}
                            className={styles.itemImage}
                            onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                            }}
                        />
                    </Link>
                </div>
            ))}
        </div>
    );
});
