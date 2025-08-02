import React, {useState} from "react";
import {useNavigate} from "react-router-dom";


import styles from "./ui/compilation.module.css";

export const FilterBar = ({ filters, setFilters, catalogStore, products, onFilter }) => {
    const [activeFilter, setActiveFilter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => navigate(-1);

    const openFilter = (filterName) => {
        setActiveFilter(filterName);
        setIsModalOpen(true);
    };

    const closeFilter = () => {
        setIsModalOpen(false);
        setActiveFilter(null);
    };

    const renderFilterModal = () => {
        switch (activeFilter) {
            case 'size': return <SizeFilter applyFilter={applyFilter} currentValue={filters.size} />;
            case 'brand': return <BrandFilter applyFilter={applyFilter} currentValue={filters.brand} />;
            case 'price': return <PriceFilter applyFilter={applyFilter} currentValue={filters.price} />;
            case 'type': return <TypeFilter applyFilter={applyFilter} currentValue={filters.type} />;
            default: return null;
        }
    };

    const applyFilter = (value) => {
        if (activeFilter) {
            const updatedFilters = { ...filters };

            switch (activeFilter) {
                case 'size':
                    updatedFilters.size = Array.isArray(value) ? value : [value];
                    break;
                case 'brand':
                    updatedFilters.brand = Array.isArray(value) ? value : [value];
                    break;
                case 'price':
                    updatedFilters.price = {
                        min: value?.min || null,
                        max: value?.max || null
                    };
                    break;
                case 'type':
                    updatedFilters.type = Array.isArray(value) ? value : [value];
                    break;
                default:
                    return;
            }

            setFilters(updatedFilters);
            applyFilters(updatedFilters);
            closeFilter();
        }
    };

    const applyFilters = (updatedFilters) => {
        if (catalogStore) {
            // Режим API
            const apiFilters = {
                categories: updatedFilters.size || [],
                brands: updatedFilters.brand || [],
                min_price: updatedFilters.price?.min || null,
                max_price: updatedFilters.price?.max || null,
                colors: updatedFilters.type || []
            };
            catalogStore.applyFilters(apiFilters);
        } else if (onFilter) {
            // Локальный режим
            const filtered = filterProducts(products || [], updatedFilters);
            onFilter(filtered);
        }
    };

    const clearFilter = (filterName, e) => {
        e.stopPropagation();

        const updatedFilters = { ...filters };

        switch (filterName) {
            case 'size':
                updatedFilters.size = [];
                break;
            case 'brand':
                updatedFilters.brand = [];
                break;
            case 'price':
                updatedFilters.price = { min: null, max: null };
                break;
            case 'type':
                updatedFilters.type = [];
                break;
            default:
                return;
        }

        setFilters(updatedFilters);
        applyFilters(updatedFilters);
    };

    const isFilterActive = (filterName) => {
        switch (filterName) {
            case 'size':
                return filters.size?.length > 0;
            case 'brand':
                return filters.brand?.length > 0;
            case 'price':
                return filters.price?.min != null || filters.price?.max != null;
            case 'type':
                return filters.type?.length > 0;
            default:
                return false;
        }
    };

    return (
        <>
            <div className={styles.filterBar}>
                <button onClick={handleBack} className={styles.filterButton}>
                    <img src='/subicons/arrowleft.svg' alt="Назад"/>
                </button>
                <button className={styles.filterButton}><img src='/subicons/filter.svg'/></button>

                {[
                    {key: 'size', label: 'Размер'},
                    {key: 'brand', label: 'Бренд'},
                    {key: 'price', label: 'Цена'},
                    {key: 'type', label: 'Тип'}
                ].map(({key, label}) => {
                    const active = isFilterActive(key);

                    return (
                        <button
                            key={key}
                            className={`${styles.filterButton} ${active ? styles.activeFilter : ''}`}
                            onClick={() => openFilter(key)}
                        >
                            {label}
                            {active && (
                                <span
                                    className={styles.clearFilter}
                                    onClick={(e) => clearFilter(key, e)}
                                >
                                    <img src='/subicons/close.svg' alt="Очистить"/>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {isModalOpen && renderFilterModal()}
        </>
    );
};

const SizeFilter = ({ applyFilter, currentValue }) => {
    const [selected, setSelected] = useState(currentValue || []);

    const toggle = (val) => setSelected(prev =>
        prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );

    return (
        <FullScreenModal
            title="Размер"
            onClose={() => applyFilter(null)}
            onApply={() => applyFilter(selected)}
            applyDisabled={!selected.length}
        >
            <div className={styles.gridOptions}>
                {SIZES.map(size => (
                    <button
                        key={size}
                        className={`${styles.optionButton} ${selected.includes(size) ? styles.selected : ''}`}
                        onClick={() => toggle(size)}
                    >
                        {size === 'NO SIZE' ? 'Один размер' : size}
                    </button>
                ))}
            </div>
        </FullScreenModal>
    );
};

const BrandFilter = ({ applyFilter, currentValue }) => {
    const brands = ['Bershka', 'Zara', 'H&M', 'Zarina', 'Gloria Jeans', 'Gucci', 'Nike', 'Puma'];
    const [selected, setSelected] = useState(currentValue || []);

    const toggle = (val) => setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

    return (
        <FullScreenModal title="Бренд" onClose={() => applyFilter(null)} onApply={() => applyFilter(selected)} applyDisabled={!selected.length}>
            <div className={styles.gridOptions}>
                {brands.map((brand, i) => (
                    <button key={i} className={`${styles.optionButton} ${selected.includes(brand) ? styles.selected : ''}`} onClick={() => toggle(brand)}>
                        {brand}
                    </button>
                ))}
            </div>
        </FullScreenModal>
    );
};

const TypeFilter = ({ applyFilter, currentValue }) => {
    const types = ['Одежда', 'Обувь', 'Аксессуары', 'Электроника'];
    const [selected, setSelected] = useState(currentValue || []);

    const toggle = (val) => setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

    return (
        <FullScreenModal title="Тип" onClose={() => applyFilter(null)} onApply={() => applyFilter(selected)} applyDisabled={!selected.length}>
            <div className={styles.gridOptions}>
                {types.map((type, i) => (
                    <button key={i} className={`${styles.optionButton} ${selected.includes(type) ? styles.selected : ''}`} onClick={() => toggle(type)}>
                        {type}
                    </button>
                ))}
            </div>
        </FullScreenModal>
    );
};
const PriceFilter = ({ applyFilter, currentValue }) => {
    const [min, setMin] = useState(currentValue?.min || '');
    const [max, setMax] = useState(currentValue?.max || '');

    const quickOptions = [3000, 5000, 10000];
    const selectedQuick = quickOptions.find((val) => !min && parseInt(max) === val);

    const apply = () => {
        applyFilter({
            min: min ? parseInt(min) : null,
            max: max ? parseInt(max) : null,
        });
    };

    const selectQuickMax = (value) => {
        setMin('');
        setMax(value.toString());
    };

    return (
        <FullScreenModal
            title="Стоимость"
            onClose={() => applyFilter(null)}
            onApply={apply}
            applyDisabled={!min && !max}
        >
            <div className={styles.priceInputGroup}>
                <div className={styles.inputWrapper}>
                    <input
                        className={styles.priceInput}
                        type="number"
                        placeholder="от"
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                    />
               </div>

                <span>-</span>

                <div className={styles.inputWrapper}>
                    <input
                        className={styles.priceInput}
                        type="number"
                        placeholder="до"
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.gridOptions}>
                {quickOptions.map((option) => (
                    <button
                        key={option}
                        className={`${styles.optionButton} ${selectedQuick === option ? styles.selected : ''}`}
                        onClick={() => selectQuickMax(option)}
                    >
                        до {option.toLocaleString()} ₽
                    </button>
                ))}
            </div>
        </FullScreenModal>
    );
};

import stylesM from './ui/fullScreenModal.module.css';
import {filterProducts} from "./utils/incideFilter.js";
import {SIZES} from "../constants.js";

const FullScreenModal = ({ title, onClose, onApply, children, applyDisabled = false }) => {
    return (
        <div className={stylesM.modalOverlay}>
            <div className={stylesM.modalContent}>
                <div className={stylesM.modalHeader}>
                    <p className={stylesM.label}>{title}</p>
                    <button style={{    background: 'transparent'
                    }} onClick={onClose}>
                        <img src='/subicons/close.svg'/>
                    </button>
                </div>
                <div className={stylesM.modalBody}>{children}</div>
                <button
                    className={stylesM.applyButton}
                    onClick={onApply}
                    disabled={applyDisabled}
                >
                    Показать
                </button>
            </div>
        </div>
    );
};

