import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonWrapper from "./utils/ButtonWrapper.jsx";
import styles from "./ui/profile.module.css";
import FullScreenButton from "./FullScrinButton.jsx";
import { useStore } from "../provider/StoreContext";
import {AUTH_TOKEN} from "../constants.js";

const DeleteProfileButtons = ({ onCancel }) => {
    const [confirmStep, setConfirmStep] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { authStore } = useStore();

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const response = await fetch('https://api.lookvogue.ru/v1/user', {
                method: 'DELETE',
                headers: {
                    "ngrok-skip-browser-warning": true,
                    "Content-Type": "application/json",
                    Authorization: `tma ${AUTH_TOKEN}`,
                },
            });

            if (!response.ok) {
                throw new Error('Не удалось удалить аккаунт');
            }


            navigate("/account-deleted");

        } catch (err) {
            setError(err.message);
            console.error('Ошибка при удалении аккаунта:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteClick = () => {
        if (confirmStep === 0) {
            setConfirmStep(1);
        } else {
            handleDeleteAccount();
        }
    };

    return (
        <ButtonWrapper>
            {confirmStep === 1 && (
                <p className={styles.confirmDelete}>
                    Вы уверены, что хотите удалить аккаунт?
                </p>
            )}

            {error && <p className={styles.errorMessage}>{error}</p>}

            <FullScreenButton
                color="var(--light-gray)"
                textColor="var(--black)"
                onClick={handleDeleteClick}
                disabled={isDeleting}
            >
                {isDeleting ? 'Удаление...' :
                    confirmStep === 0 ? 'Удалить аккаунт' : 'Да, удалить'}
            </FullScreenButton>

            <FullScreenButton
                onClick={confirmStep === 0 ? onCancel : () => setConfirmStep(0)}
                disabled={isDeleting}
            >
                Отменить
            </FullScreenButton>
        </ButtonWrapper>
    );
};

export default DeleteProfileButtons;