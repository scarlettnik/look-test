import React, { useState, useEffect, useRef } from 'react';
import styles from './ui/addList.module.css';
import ButtonWrapper from "./utils/ButtonWrapper.jsx";
import FullScreenButton from "./FullScrinButton.jsx";
import useIsKeyboardOpen from "../hooks/useIsKeyboardOpen.js";

const coverImages = [
    { url: 'https://avatars.mds.yandex.net/i?id=022c655b21f79d8837185f96c6e208dd_l-10767434-images-thumbs&n=13' },
    { url: 'https://avatars.mds.yandex.net/i?id=b72991f884a5e936aa5286616fd944ef5c77f65d-5103756-images-thumbs&n=13' },
    { url: 'https://avatars.mds.yandex.net/i?id=b4170aae9d2bf4bda8d5e9a133596db6d28b0b00-4964301-images-thumbs&n=13' },
    { url: 'https://avatars.mds.yandex.net/i?id=b30a65786fa5f71b7ba6efed2203bda0860ad43c-5086925-images-thumbs&n=13' },
    { url: 'https://avatars.mds.yandex.net/i?id=705d9c73d39904eb00e8f3db6635a4f55c3907ca-4594854-images-thumbs&n=13'},
    { url: 'https://avatars.mds.yandex.net/i?id=6c27e518e46665088413237506280fd3721711b6-10636720-images-thumbs&n=13' }
]

const SelectedCoverPreview = ({ imageUrl, title }) => (
    <div className={styles.selectedCover}>
        <img src={imageUrl} alt="Selected Cover"/>
        <div className={styles.overlay}></div>
        <span className={styles.coverText}>{title}</span>
    </div>
);

function AddList({
                     onCreate,
                     onUpdate,
                     collection = null // Передаем коллекцию для редактирования
                 })  {
    const [closetName, setClosetName] = useState('');
    const [selectedCover, setSelectedCover] = useState(
        collection?.url || coverImages[0].url
    );
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const containerRef = useRef(null);
    const isKeyboardOpen = useIsKeyboardOpen()

    useEffect(() => {
        if (collection) {
            setClosetName(collection.name);
            setSelectedCover(collection.url);
        }
    }, [collection]);

    const handleSave = () => {
        if (!closetName.trim()) return;

        if (collection) {
            onUpdate(closetName, selectedCover);
        } else {
            onCreate(closetName, selectedCover);
        }
    };



    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            const newHeight = window.visualViewport.height;
            const keyboardHeight = window.innerHeight - newHeight;
            setKeyboardHeight(keyboardHeight > 100 ? keyboardHeight : 0);
        };

        window.visualViewport.addEventListener('resize', handleResize);
        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{
                height: keyboardHeight > 0
                    ? `${window.visualViewport?.height || window.innerHeight}px`
                    : 'auto',
                overflow: 'auto'
            }}
        >
            <div className={styles.content}>
                <h2 className={styles.title}>{collection ? "Редактировать подборку" : "Создать подборку"}</h2>

                <label className={styles.label}>Название</label>
                <input
                    type="text"
                    value={closetName}
                    onChange={(e) => setClosetName(e.target.value)}
                    className={styles.input}
                />

                <label className={styles.label}>Обложка</label>
                <SelectedCoverPreview
                    imageUrl={selectedCover}
                />

                <div className={styles.coverGrid}>
                    {coverImages.map((img) => (
                        <div
                            key={img.url}
                            className={styles.coverThumbContainer}
                            onClick={() => setSelectedCover(img.url)}
                        >
                            <img
                                src={img.url}
                                className={`${styles.coverThumb} ${selectedCover === img.url ? styles.active : ''}`}

                            />
                            {selectedCover === img.url && (
                                <div className={styles.coverOverlay}>
                                    <img
                                        src="/subicons/checkmark.svg"
                                        className={styles.butterflyIcon}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {!isKeyboardOpen &&
                <ButtonWrapper>
                    <FullScreenButton
                        onClick={handleSave}
                        disabled={!closetName.trim()}
                    >
                        {collection ? "Сохранить изменения" : "Сохранить подборку"}
                    </FullScreenButton>
                </ButtonWrapper>}
        </div>
    );
}

export default AddList;