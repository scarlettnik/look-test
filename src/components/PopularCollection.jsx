import {useNavigate, useParams} from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {useStore} from "../provider/StoreContext.jsx";
import styles from './ui/popualCollection.module.css';
import React, {useEffect, useState} from "react";
import Sidebar from "./Sidebar.jsx";
import CustomSkeleton from "./utils/CustomSkeleton.jsx";
import Modal from "./utils/Modal.jsx";
import SaveToCollectionModal from "./SaveToCollectionsModal.jsx";

const PopularCollection = observer(() => {
    const { id } = useParams();
    const navigate = useNavigate();
    const store = useStore();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    console.log(id)
    console.log(store)

    useEffect(() => {
        store.collectionStore.loadCollection(id);
    }, [id, location.pathname]);

    const { currentCollection: save, loading } = store.collectionStore;
    const currentItem = store.popular.popular.find(item => item.id === id);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const handleOpenSaveModal = (product) => {
        setSelectedProduct(product);
        setIsSaveModalOpen(true);
    };

    const handleCloseSaveModal = () => {
        setIsSaveModalOpen(false);
        setSelectedProduct(null);
    };



    if (!currentItem) {
        return <div>Коллекция не найдена</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.stepHeader}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    <img src='/subicons/arrowleft.svg' className={styles.backButtonImg} alt="Назад"/>
                </button>
                <p className={styles.stepTitle}>{currentItem.name}</p>
            </div>
            <img className={styles.collectionImage} src={currentItem.cover_image_url}/>
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
                    save?.products?.map((item) => (
                        <div key={item.id} className={styles.productWrapper}>
                            <img
                                className={styles.card}
                                src={item.image_urls[0]}
                                alt={item.name}
                            />
                            <button
                                className={styles.saveIcon}
                                onClick={() => handleOpenSaveModal(item)}
                            >
                                <img src="/menuIcons/unactive/save.svg" alt="Сохранить" />
                            </button>
                        </div>
                    ))
                )}
            </div>
            <Sidebar/>

            <SaveToCollectionModal
                isOpen={isSaveModalOpen}
                onClose={handleCloseSaveModal}
                productId={selectedProduct?.id}
                productName={selectedProduct?.name}
            />
        </div>
    );
});

export default PopularCollection;