import {
    UserIcon,
    ShoppingBagIcon,
    CreditCardIcon,
    PercentIcon,
    Trash2Icon,
    HelpCircleIcon,
} from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../provider/AuthProvider.jsx";
import React, { useState, useEffect, useRef } from "react";
import FullScreenButton from "./FullScrinButton.jsx";
import styles from "./ui/profile.module.css";
import ButtonWrapper from "./utils/ButtonWrapper.jsx";
import DeleteProfileButtons from "./DeleteProfileButtons.jsx";
import ProfileMeasurementsModal from "./ProfileMeasurementsModal.jsx";
import UserInfo from "./UserInfo.jsx";

const menuItems = [
    { label: "Мои параметры", icon: UserIcon },
    { label: "Заказы", icon: ShoppingBagIcon, dev: true },
    { label: "Способ оплаты", icon: CreditCardIcon, dev: true },
    { label: "Промокоды", icon: PercentIcon, dev: true },
    { label: "Удаление аккаунта", icon: Trash2Icon, delete: true },
    { label: "Поддержка", icon: HelpCircleIcon, support: true },
];



const MenuItem = ({ item, index, activeIndex, onClick }) => {
    const Icon = item.icon;
    const isActive = activeIndex === index;

    return (
        <div
            className={styles.menuItem}
            onClick={() => onClick(item, index)}
        >
            <Icon size={20} className={styles.menuIcon} />
            <span className={styles.menuLabel}>{item.label}</span>
            {item.dev && isActive && (
                <div className={styles.devPanel}>В разработке</div>
            )}
        </div>
    );
};

const SupportButtons = ({ onSupportClick }) => (
    <ButtonWrapper>
        <FullScreenButton
            color="var(--light-gray)"
            textColor="var(--black)"
            onClick={onSupportClick}
        >
            Связаться с поддержкой в Telegram
        </FullScreenButton>
    </ButtonWrapper>
);


export default function ProfilePage() {
    const { data } = useAuth();
    const [activeDevItem, setActiveDevItem] = useState(null);
    const [showSupportButton, setShowSupportButton] = useState(false);
    const [showDeleteProfileButton, setShowDeleteProfileButton] = useState(false);
    const timeoutRef = useRef(null);
    const [showMeasurements, setShowMeasurements] = useState(false);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleMenuItemClick = (item, index) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (item.support) {
            setShowSupportButton(true);
            setShowDeleteProfileButton(false);
            setActiveDevItem(null);
            return;
        }

        if (item.delete) {
            setShowDeleteProfileButton(true);
            setShowSupportButton(false);
            setActiveDevItem(null);
            return;
        }
        if (item.label === "Мои параметры") {
            setShowMeasurements(true);
        }
        if (item.dev) {
            setActiveDevItem(index);
            setShowSupportButton(false);
            setShowDeleteProfileButton(false);

            timeoutRef.current = setTimeout(() => {
                setActiveDevItem(null);
            }, 3000);
        } else {
            setActiveDevItem(null);
            setShowSupportButton(false);
        }
    };

    const handleSupportButtonClick = () => {
        window.open("https://t.me/scarlettnik", "_blank");
    };

    const handleDeleteBackScape = () => {
        setShowDeleteProfileButton(false);
    };

    return (
        <div className={styles.page}>
            <UserInfo
                photoUrl={data?.photo_url}
                firstName={data?.first_name}
                lastName={data?.last_name}
            />

            <div className={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        item={item}
                        index={index}
                        activeIndex={activeDevItem}
                        onClick={handleMenuItemClick}
                    />
                ))}
            </div>

            <Sidebar />

            {showSupportButton && (
                <SupportButtons onSupportClick={handleSupportButtonClick} />
            )}

            {showDeleteProfileButton && (
                <DeleteProfileButtons
                    onDelete={() => console.log("Удаление")}
                    onCancel={handleDeleteBackScape}
                />
            )}
            {showMeasurements && (
                <ProfileMeasurementsModal
                    isOpen={showMeasurements}
                    onClose={() => setShowMeasurements(false)}
                    user={{
                        firstName: data?.first_name,
                        lastName: data?.last_name,
                        photoUrl: data?.photo_url
                    }}
                />
            )}
        </div>
    );
}