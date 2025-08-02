import React, {useState, useRef, useEffect, useCallback} from 'react';
import Sidebar from './Sidebar';
import {useNavigate, useParams} from 'react-router-dom';
import styles from './ui/productPage.module.css';
import FullScreenButton from "./FullScrinButton.jsx";
import {AUTH_TOKEN} from "../constants.js";
import CustomSkeleton from "./utils/CustomSkeleton.jsx";
import SaveToCollectionModal from "./SaveToCollectionsModal.jsx";

const ProductPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartX = useRef(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [currentColorId, setCurrentColorId] = useState(id);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [collectionImage, setCollectionImage] = useState('');

    const handleColorChange = async (color) => {
        if (color.product_id === currentColorId || isTransitioning) return;

        try {
            setIsTransitioning(true);
            await loadProduct(color.product_id);
            setCurrentColorId(color.product_id); // Обновляем ID текущего цвета
        } catch (err) {
            console.error('Error changing color:', err);
        } finally {
            setIsTransitioning(false);
        }
    };

    const fetchProduct = async (productId) => {
        try {
            setLoading(true);
            const response = await fetch(`https://api.lookvogue.ru/v1/catalog/product/${productId}`, {
                headers: {
                    "Authorization": `tma ${AUTH_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error('Failed to fetch product');
            return await response.json();
        } catch (err) {
            console.error('Error fetching product:', err);
            throw err;
        }
    };

    console.log(id)
    const handleOpenSaveModal = useCallback((product) => {
        setSelectedProduct(product);
        setIsSaveModalOpen(true);
    }, []);
    const handleCloseSaveModal = useCallback(() => {
        setIsSaveModalOpen(false);
        setSelectedProduct(null);
    }, []);


    const loadProduct = async (productId) => {
        try {
            setLoading(true);
            const data = await fetchProduct(productId);
            setProduct(data);
            setSelectedColor(data.color_group?.find(c => c.product_id === productId) || null);
            setCurrentIndex(0);
            setSelectedSize(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadProduct(id);
    }, [id]);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        const moveX = e.touches[0].clientX - touchStartX.current;
        setDragX(moveX);
    };

    const handleTouchEnd = () => {
        if (dragX > 80 && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (dragX < -80 && currentIndex < product?.image_urls.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
        setDragX(0);
        setIsDragging(false);
    };

    if (error) return <div className={styles.error}>Ошибка загрузки товара: {error}</div>;

    return (
        <div className={styles.container}>
            <div
                className={styles.slider}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <img style={{ width: '30px' }} src='/subicons/arrowleft.svg' alt="Назад"/>
                </button>

                {loading ? (
                    <CustomSkeleton  style={{width: '100vw', height: '100vh'}} />
                ) : (
                    <>
                        <div
                            className={styles.sliderInner}
                            style={{
                                transform: `translateX(calc(${-currentIndex * 100}% + ${dragX}px))`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease',
                            }}
                        >
                            {product?.image_urls?.map((src, index) => (
                                <img key={index} src={src} alt={`Slide ${index}`} className={styles.image}/>
                            ))}
                        </div>
                        <div className={styles.progressDots}>
                            {product?.image_urls?.map((_, index) => (
                                <span
                                    key={index}
                                    className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className={styles.infoCard}>
                {loading ? (
                    <>
                        <CustomSkeleton style={{height: '20px', marginTop: '5px', width: '100%'}} />
                        <CustomSkeleton style={{height: '15px', marginTop: '5px', width: '100%'}}/>
                        <CustomSkeleton style={{height: '35px', marginTop: '5px', marginBottom: '5px', width: '100%'}}/>
                        <FullScreenButton>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                На сайт продавца <img src='/subicons/shoppingBag.svg' alt="Корзина"/>
                            </p>
                        </FullScreenButton>                    </>
                ) : (
                    <>
                        <p className={styles.title}>{product?.name}</p>
                        <p className={styles.brand}>{product?.brand}</p>
                        <div className={styles.header}>
                            <p className={styles.price}>
                                {product?.discount_price && product?.discount_price != product?.price ? (
                                    <>
                                        <span
                                            style={{textDecoration: 'line-through', color: 'gray', marginRight: '8px'}}>
                                            {product.price} ₽
                                        </span>
                                        {product?.discount_price} ₽
                                    </>
                                ) : (
                                    `${product?.price} ₽`
                                )}
                            </p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSaveModal(product);
                                }}
                            >
                                <img
                                    className={styles.saveIcon}
                                    src={product.is_contained_in_user_collections
                                        ? "/menuIcons/active/save.svg"
                                        : "/menuIcons/unactive/save.svg"}
                                    alt={product.is_contained_in_user_collections ? "Сохранено" : "Сохранить"}
                                />
                            </button>
                        </div>

                        <FullScreenButton>
                            <p style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>
                                На сайт продавца <img src='/subicons/shoppingBag.svg' alt="Корзина"/>
                            </p>
                        </FullScreenButton>
                    </>
                )}

                <p className={styles.blockTitle}>О товаре</p>
                {loading ? (
                    <CustomSkeleton style={{width: '100%', height: '80px', marginBottom: '24px'}} />
                ) : (
                    <p className={styles.description}>{product?.description}</p>
                )}

                {loading ? (
                    <CustomSkeleton style={{width: '100%', height: '80px', marginBottom: '24px'}} />
                ) : (
                    product?.sizes && (
                        <>
                            <p className={styles.blockTitle}>Размеры</p>
                            <div className={styles.bar}>

                                {product?.sizes?.map((size, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.sizeOption} ${
                                            selectedSize === size ? styles.active : ''
                                        }`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </>
                    )
                )}
                {loading ? (
                    <CustomSkeleton style={{width: '100%', height: '80px', marginBottom: '24px'}} />
                ) : (
                    product?.color_group?.length > 0 && (
                        <>
                            <div className={styles.colorHeader}>
                                <p className={styles.blockTitle}>Цвет</p>
                                <p className={styles.colorTitle}>{product?.color_name}</p>
                            </div>
                            <div className={styles.colorsContainer}>
                                {product.color_group.map((color, index) => (
                                    <div
                                        key={index}
                                        className={styles.colorCircleWrapper}
                                        onClick={() => handleColorChange(color)}
                                    >
                                        <div
                                            className={`${styles.colorCircle} ${
                                                color.product_id === currentColorId ? styles.selected : ''
                                            }`}
                                            style={{backgroundColor: color.color_code}}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                )}

                <p className={styles.blockTitle}>Детали</p>
                <div className={styles.infoSection}>
                    {loading ? (
                        <>
                            <CustomSkeleton style={{width: '100%', height: '20px', marginBottom: '12px'}}/>
                            <CustomSkeleton style={{width: '100%', height: '20px', marginBottom: '12px'}}/>
                            <CustomSkeleton style={{width: '100%', height: '20px', marginBottom: '12px'}} />
                        </>
                    ) : (
                        product?.details && Object.entries(product.details).map(([label, value], index) => (
                            <div key={index} className={styles.infoRow}>
                                <span className={styles.infoLabel}>{label}</span>
                                <span className={styles.infoValue}>{value}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <SaveToCollectionModal
                isOpen={isSaveModalOpen}
                onClose={handleCloseSaveModal}
                productId={product?.id}
                productName={product?.name}
                productInCollection={product?.is_contained_in_user_collections}
                onSaveSuccess={(isSaved) => {
                    setProduct(prev => ({
                        ...prev,
                        is_contained_in_user_collections: isSaved
                    }));
                }}
            />
            <Sidebar/>
        </div>
    );
};

export default ProductPage;