import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ui/accountDeleted.module.css";
import Sidebar from "./Sidebar.jsx";

const AccountDeleted = () => {
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate("/");
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    return (<>
        <div className={styles.container}>
            <div className={styles.deletedAcc}>Аккаунт удалён</div>
            <p className={styles.deletedTimer}>Вы будете перенаправлены на главную страницу через {countdown} сек.</p>
        </div>
        {/*<Sidebar/>*/}
        </>
    );
};

export default AccountDeleted;
