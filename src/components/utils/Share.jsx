import React, { useState } from 'react';
import {
    TelegramShareButton,
    WhatsappShareButton,
    FacebookShareButton,
    TelegramIcon,
    WhatsappIcon,
    FacebookIcon,
} from 'react-share';
import styles from '../ui/share.module.css';

const Share = ({ url }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('Ошибка копирования');
        }
    };

    return (
        <>
            <h3 className={styles.title}>Поделиться</h3>

            <div className={styles.icons}>
                <TelegramShareButton url={url}>
                    <TelegramIcon size={48} round />
                </TelegramShareButton>
                <WhatsappShareButton url={url}>
                    <WhatsappIcon size={48} round />
                </WhatsappShareButton>
                <FacebookShareButton url={url}>
                    <FacebookIcon size={48} round />
                </FacebookShareButton>
                <button className={styles.copyIcon} onClick={handleCopy} title="Скопировать ссылку">
                    📋
                </button>
            </div>

            {copied && <div className={styles.toast}>Ссылка скопирована!</div>}
        </>
    );
};

export default Share;