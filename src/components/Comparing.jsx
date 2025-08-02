import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite/src"; // используем, как в твоем коде
import { useStore } from '../provider/StoreContext.jsx';

import Sidebar from "./Sidebar";
import CustomSkeleton from "./utils/CustomSkeleton.jsx";

import styles from "./ui/comparing.module.css";

const Comparing = observer(() => {
    const store  = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("trands");

    useEffect(() => {
        if (activeTab === "trands") {
            store.popular.fetchTrends();
            store.popular.fetchCollections();
        } else {
            store.popular.fetchBrands();
            store.popular.fetchPersonalBrands();
        }
    }, [activeTab]);

    const isTrands = activeTab === "trands";

    const items = isTrands ? store.popular.trends : store.popular.brands;
    const picks = isTrands
        ? store.popular.collections
        : store.popular.personalBrands;

    const loadingItems = isTrands
        ? store.popular.loadingTrends
        : store.popular.loadingBrands;
    const loadingPicks = store.popular.loadingTrandsCollections || store.popular.loadingBrandsCollections;

    console.log(picks)

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.tabs}>
                <button
                    className={activeTab === "trands" ? styles.active : ""}
                    onClick={() => setActiveTab("trands")}
                >
                    Тренды
                </button>
                <button
                    className={activeTab === "brands" ? styles.active : ""}
                    onClick={() => setActiveTab("brands")}
                >
                    Бренды
                </button>
            </div>

            <p className={styles.trandsTitle}>
                {isTrands ? "Тренды сезона" : "Популярные бренды"}
            </p>

            <div className={styles.scrollBlock}>
                {loadingItems
                    ? Array(4)
                        .fill()
                        .map((_, i) => (
                            <div key={i} className={styles.card}>
                                <CustomSkeleton
                                    style={{ height: "16vh" }}
                                    className={styles.cardImg}
                                />
                                <CustomSkeleton
                                    style={{ height: "1rem", marginTop: "5px" }}
                                    className={styles.cardTitle}
                                />
                            </div>
                        ))
                    : Array(1)
                        .fill()
                        .flatMap(() => items || [])
                        .map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className={styles.card}
                                onClick={() => navigate(`/trands/${item.id}`)}
                            >
                                <img
                                    className={styles.cardImg}
                                    src={item.cover_image_url}
                                    alt={item.name}
                                />
                                <p className={styles.cardTitle}>{item.name}</p>
                            </div>
                        ))}
            </div>

            <p className={styles.trandsTitle}>Подборки</p>
            <div className={styles.collectionsBlock}>
                {loadingPicks
                    ? Array(4)
                        .fill()
                        .map((_, i) => (
                            <div key={i} className={styles.collectionCard}>
                                <CustomSkeleton
                                    style={{ height: "7rem" }}
                                    className={styles.collectionImg}
                                />
                                <CustomSkeleton
                                    className={styles.collectionTitle}
                                    style={{ height: "1rem", marginTop: "5px" }}
                                />
                            </div>
                        ))
                    : Array(1)
                        .fill()
                        .flatMap(() => picks || [])
                        .map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className={styles.collectionCard}
                                onClick={() => navigate(`/trands/collection/${item.id}`)}
                            >
                                <img
                                    className={styles.collectionImg}
                                    src={item.cover_image_url}
                                    alt={item.name}
                                />
                                <p className={styles.collectionTitle}>{item.name}</p>
                            </div>
                        ))}
            </div>
        </div>
    );
});

export default Comparing;
