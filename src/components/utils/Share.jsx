import React, { useState } from 'react';
import {
    TelegramShareButton,
    WhatsappShareButton,
    FacebookShareButton,
    TwitterShareButton,
    VKShareButton,
    OKShareButton,
    RedditShareButton,
    LinkedinShareButton,
    TelegramIcon,
    WhatsappIcon,
    FacebookIcon,
    TwitterIcon,
    VKIcon,
    OKIcon,
    RedditIcon,
    LinkedinIcon,

} from 'react-share';
import styles from '../ui/share.module.css';
import FullScreenButton from "../FullScrinButton.jsx";
import {HOSTNAME} from "../../constants.js";

const Share = ({ id }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${HOSTNAME}/collection/${id}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('Ошибка копирования');
        }
    };

    const shareButtons = [
        { Button: TelegramShareButton, Icon: TelegramIcon, name: 'Telegram' },
        { Button: WhatsappShareButton, Icon: WhatsappIcon, name: 'WhatsApp' },
        { Button: FacebookShareButton, Icon: FacebookIcon, name: 'Facebook' },
        { Button: TwitterShareButton, Icon: TwitterIcon, name: 'Twitter' },
        { Button: VKShareButton, Icon: VKIcon, name: 'VK' },
        { Button: OKShareButton, Icon: OKIcon, name: 'OK' },
        { Button: RedditShareButton, Icon: RedditIcon, name: 'Reddit' },
        { Button: LinkedinShareButton, Icon: LinkedinIcon, name: 'LinkedIn' },
    ];

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Поделиться</h3>

            <div className={styles.scrollContainer}>
                <div className={styles.scrollContent}>
                    {shareButtons.map(({ Button, Icon, name }) => (
                        <div className={styles.scrollItem} key={name}>
                            <Button url={`${HOSTNAME}/collection/${id}`}>
                                <div className={styles.iconContainer}>
                                    <Icon size={64} round />
                                    <span className={styles.iconLabel}>{name}</span>
                                </div>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.copyButton}>
                <FullScreenButton onClick={handleCopy} title="Скопировать ссылку">
                    Копировать ссылку
                </FullScreenButton>
            </div>

            {copied && <div className={styles.toast}>Ссылка скопирована!</div>}
        </div>
    );
};

export default Share;