import React, {useEffect, useState, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {useStore} from "../provider/StoreContext.jsx";
import styles from './ui/popualCollection.module.css';
import Sidebar from "./Sidebar.jsx";
import CustomSkeleton from "./utils/CustomSkeleton.jsx";
import SaveToCollectionModal from "./SaveToCollectionsModal.jsx";

const PopularCollection = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const store = useStore();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [collectionImage, setCollectionImage] = useState('');
    const [collectionName, setCollectionName] = useState('');

    const { currentCollection: collection, loading } = store.collectionStore;
    const currentItem = store.popular.popular.find(item => item.id === id) || {};

    useEffect(() => {
        const loadCollection = async () => {
            await store.collectionStore.loadCollection(id, false);
            if (store.collectionStore.currentCollection) {
                setCollectionImage(store.collectionStore.currentCollection.cover_image_url);
                setCollectionName(store.collectionStore.currentCollection.name);
            }
        };
        loadCollection();
    }, [id, store.collectionStore]);

    useEffect(() => {
        if (currentItem.cover_image_url) {
            setCollectionImage(currentItem.cover_image_url);
        }
        if (currentItem.name && !collectionName) {
            setCollectionName(currentItem.name);
        }
    }, [currentItem.cover_image_url, currentItem.name, collectionName]);

    const handleOpenSaveModal = useCallback((product) => {
        setSelectedProduct(product);
        setIsSaveModalOpen(true);
    }, []);

    const handleCloseSaveModal = useCallback(() => {
        setIsSaveModalOpen(false);
        setSelectedProduct(null);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.stepHeader}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <img src='/subicons/arrowleft.svg' className={styles.backButtonImg} alt="Назад"/>
                </button>
                <p className={styles.stepTitle}>{collectionName || ''}</p>
            </div>

            <div className={styles.collectionImageWrapper}>
                {loading ? (
                            <CustomSkeleton
                                className={styles.collectionImage}

                            />
                            ): (<img
                        className={styles.collectionImage}
                        src={collectionImage}
                        alt={collectionName}
                    />)
                }
            </div>

            <div className={styles.cardContainer}>
                {loading ? (
                    [...Array(8)].map((_, i) => (
                        <CustomSkeleton
                            className={styles.card}
                            key={i}
                            style={{width:'46vw', height:'46vw', marginTop: '10px'}}
                        />
                    ))
                ) : (
                    collection?.products?.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            onSaveClick={handleOpenSaveModal}
                        />
                    ))
                )}
            </div>

            <Sidebar/>

            <SaveToCollectionModal
                isOpen={isSaveModalOpen}
                onClose={handleCloseSaveModal}
                productId={selectedProduct?.id}
                productName={selectedProduct?.name}
                productInCollection={selectedProduct?.is_contained_in_user_collections}
            />
        </div>
    );
});
const ProductCard = ({ item, onSaveClick }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.productWrapper}>
            <img
                onClick={() => navigate(`/trands/product/${item.id}`)}
                className={styles.card}
                src={item.image_urls?.[0] || '/placeholder-product.jpg'}
                alt={item.name}
                onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                }}
            />
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onSaveClick(item);
                }}
            >
                <img
                    className={styles.saveIcon}
                    src={item.is_contained_in_user_collections
                        ? "/menuIcons/active/save.svg"
                        : "/menuIcons/unactive/save.svg"}
                    alt={item.is_contained_in_user_collections ? "Сохранено" : "Сохранить"}
                />
            </button>
        </div>
    );
};

export default PopularCollection;