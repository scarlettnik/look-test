import {useState, useRef, useEffect} from 'react';
import Sidebar from './Sidebar';
import {useNavigate, useParams} from 'react-router-dom';
import styles from './ui/productPage.module.css';
import Share from "./utils/Share.jsx";
import Modal from "./utils/Modal.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import {AUTH_TOKEN} from "../constants.js";

const Compilation = () => {
    const {id} = useParams();
    console.log(id);
    const navigate = useNavigate();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const handleShare = () => setIsShareOpen(true);
    const handleCloseShare = () => setIsShareOpen(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartX = useRef(0);
    const [selectedColor, setSelectedColor] = useState(null);

    const sizes = [
        'XS / 42-44',
        'S / 46-48',
        'M / 50-52',
        'L / 54-56',
        'XL / 58-60',
        'XXL / 62-64',
        '3XL / 66-68',
        '4XL / 70-72'
    ];


    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log(product)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://api.lookvogue.ru/v1/catalog/product/${id}`, {
                    headers: {
                        "Authorization": `tma ${AUTH_TOKEN}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const [selectedSize, setSelectedSize] = useState(null);
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
                {/*<button className={styles.shareButton} onClick={handleShare}>*/}
                {/*    <img style={{ width: '20px' }} src='/subicons/darkshare.svg' alt="Поделиться"/>*/}
                {/*</button>*/}
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
            </div>

            <div className={styles.infoCard}>
                <p className={styles.title}>{product?.name}</p>
                <p className={styles.brand}>{product?.brand}</p>
                <div className={styles.header}>
                    <p className={styles.price}>
                        {product?.discount_price ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
                                    {product.price} ₽
                                </span>
                                {product?.discount_price} ₽
                            </>
                        ) : (
                            `${product?.price} ₽`
                        )}
                    </p>
                    <img src='/menuIcons/unactive/save.svg' alt="Сохранить"/>
                </div>

                <FullScreenButton>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        На сайт продавца <img src='/subicons/shoppingBag.svg' alt="Корзина"/>
                    </p>
                </FullScreenButton>

                <p className={styles.blockTitle}>О товаре</p>
                <p className={styles.description}>{product?.description}</p>

                {product?.sizes && (
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
                )}

                {product?.color_name && (
                    <>
                        <div style={{ display: "flex", alignItems: 'center' }}>
                            <p className={styles.blockTitle}>Цвет</p>
                            <p className={styles.colorTitle}>{product?.color_name}</p>
                        </div>
                        <div className={`${styles.bar} ${styles.border}`}>
                                <div className={styles.colorCircleWrapper}>
                                    <div
                                        className={styles.colorCircle}
                                        style={{ backgroundColor: product?.color_code }}
                                    />
                                </div>

                        </div>
                    </>
                )}

                <p className={styles.blockTitle}>Детали</p>
                <div className={styles.infoSection}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Артикул</span>
                        <span className={styles.infoValue}>{product?.article}</span>
                    </div>
                    {/*{product?.details && Object.entries(product.details).map(([label, value], index) => (*/}
                    {/*    <div key={index} className={styles.infoRow}>*/}
                    {/*        <span className={styles.infoLabel}>{label}</span>*/}
                    {/*        <span className={styles.infoValue}>{value}</span>*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>
            </div>

            <Sidebar/>
        </div>
    );
};

export default Compilation;
