import React, {useEffect, useMemo, useState} from 'react';
import {Link, useParams, useNavigate, useLocation} from 'react-router-dom';
import styles from './ui/compilation.module.css';
import Sidebar from './Sidebar';
import Modal from './utils/Modal.jsx'
import { observer } from "mobx-react-lite";
import { useStore } from '../provider/StoreContext';
import Share from "./utils/Share.jsx";
import AddList from "./AddList.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import CustomSkeleton from "./utils/CustomSkeleton.jsx";
import {FilterBar} from "./FilterBar.jsx";
import {filterProducts} from "./utils/incideFilter.js";


const Compilation = observer(() => {
    const { id } = useParams();
    const location = useLocation();
    const { collectionStore } = useStore();
    const [isSave, setIsSave] = useState(false);


    const [filters, setFilters] = useState({
        size: [],
        brand: [],
        price: {},
        type: []
    });

    useEffect(() => {
        const isSaveCollection = location.pathname.includes('/save/');
        setIsSave(isSaveCollection);
        collectionStore.loadCollection(id, isSaveCollection);
    }, [id, location.pathname]);

    const { currentCollection: save, loading } = collectionStore;
    const [filteredProducts, setFilteredProducts] = useState(save?.products || []);

    useEffect(() => {
        if (save?.products) {
            setFilteredProducts(save.products);
        }
    }, [save?.products]);



    return (
        <div className={styles.container}>
            <div className={styles.scrollContent}>
                <Banner save={save} isSave={isSave} loading={loading} />
                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    products={save?.products || []}
                    onFilter={setFilteredProducts}
                />
                <ItemGrid items={filteredProducts} loading={loading} />
            </div>
            <Sidebar />
        </div>
    );
});


const ItemGrid = ({ items, loading }) => {
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
            {items?.map(item => (
                <Link to={`product/${item?.id}`} key={item?.id}>
                    <img
                        src={item?.image_urls?.[0]}
                        alt={item.name}
                        className={styles.itemImage}
                        onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                        }}
                    />
                </Link>
            ))}
        </div>
    );
};

export default Compilation;




export const Banner = observer(({ save, isSave = false, loading }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const store = useStore();

    const handleCloseShare = () => setIsShareOpen(false);

    const handleCreateCollection = (name, coverUrl) => {
        store.createCollection(name, coverUrl);
        setIsModalOpen(false);
    };

    const handleUpdateCollection = (name, coverUrl) => {
        if (editingCollection) {
            store.updateCollection(editingCollection.id, {
                name,
                url: coverUrl
            });
            setIsModalOpen(false);
            setEditingCollection(null);
        }
    };

    const handleEditCollection = (collection) => {
        setEditingCollection(collection);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className={styles.bannerContainer}>

            <div className={styles.banner}>
                    <CustomSkeleton className={styles.bannerImage}
                    />

            </div> </div>
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
                            handleEditCollection(save);
                        }}
                    >
                        <img className={styles.editIcon} src='/subicons/edit.svg' alt="Редактировать"/>
                    </button>
                )}

                <Modal isOpen={isShareOpen} onClose={handleCloseShare}>
                    <Share url={window.location.href}/>
                </Modal>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <AddList
                        onCreate={handleCreateCollection}
                        onUpdate={handleUpdateCollection}
                        collection={editingCollection}
                    />
                </Modal>
            </div>
        </div>
    );
});