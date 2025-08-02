import { useState, useEffect } from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import styles from './ui/sidebar.module.css';
import useIsKeyboardOpen from "../hooks/useIsKeyboardOpen.js";

const Sidebar = ({highlightSave, highlightPopular, onboarding}) => {
    const isKeyboardOpen = useIsKeyboardOpen();
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarConfig = [
        { path: '/', exact: true },
        { path: '/save', matchPattern: '/save/*' },
        { path: '/trands', matchPattern: '/trands/*' },
        { path: '/shoppingcard', exact: true },
        { path: '/profile', exact: true }
    ];

    const [activePath, setActivePath] = useState('/cards');
    useEffect(() => {
        setActivePath(onboarding ? '/' : '/cards');
    }, [onboarding]);


    useEffect(() => {
        const currentPath = sidebarConfig.find(({ path, matchPattern, exact }) => {
            return matchPattern
                ? matchPath(matchPattern, location.pathname)
                : exact
                    ? location.pathname === path
                    : location.pathname.startsWith(path);
        })?.path;

        if (currentPath) setActivePath(currentPath);
    }, [location.pathname]);

    const getIconPath = (iconName, isActive) => {
        return `/menuIcons/${isActive ? 'active' : 'unactive'}/${iconName}.svg`;
    };

    return isKeyboardOpen ? null : (
        <div className={`${onboarding ? styles.onboarding : ''} ${styles.sidebar}`}>
            <button
                disabled={onboarding}
                className={styles.sidebarbutton}
                onClick={() => navigate('/cards')}>
                <img
                    src={getIconPath('home', activePath === '/cards')}
                    alt="Home"
                    className={styles.icon}
                />
            </button>

            <button
                disabled={onboarding}

                className={`${styles.sidebarbutton} ${activePath === '/save' ? styles.active : ''} ${highlightSave ? styles.highlight : ''}`}
                onClick={() => navigate('/save')}>
                <img
                    src={highlightSave ? '/menuIcons/onboarding/save.svg' : getIconPath('save', activePath === '/save')}
                    alt="save"
                    className={styles.icon}
                />
            </button>

            <button
                disabled={onboarding}
                className={`${styles.sidebarbutton} ${activePath === '/compare' ? styles.active : ''} ${highlightPopular ? styles.highlight : ''}`}
                onClick={() => navigate('/trands')}>
                <img
                    src={highlightPopular ? '/menuIcons/onboarding/trands.svg' : getIconPath('trends', activePath === '/trands')}
                    alt="trends"
                    className={styles.icon}
                />
            </button>

            <button
                disabled={onboarding}

                className={`${styles.sidebarbutton} ${activePath === '/shoppingcard' ? styles.active : ''}`}
                onClick={() => navigate('/shoppingcard')}>
                <img
                    src={getIconPath('shop', activePath === '/shoppingcard')}
                    alt="Cart"
                    className={styles.icon}
                />
            </button>

            <button
                disabled={onboarding}

                className={`${styles.sidebarbutton} ${activePath === '/profile' ? styles.active : ''}`}
                onClick={() => navigate('/profile')}>
                <img
                    src={getIconPath('profile', activePath === '/profile')}
                    alt="Profile"
                    className={styles.icon}
                />
            </button>
        </div>
    );
};

export default Sidebar;