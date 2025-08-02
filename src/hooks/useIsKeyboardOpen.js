import { useState, useEffect } from 'react';

const useKeyboardVisibility = () => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [initialHeight, setInitialHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;

            if (currentHeight < initialHeight - 30) {
                setIsKeyboardVisible(true);
            }
            else if (currentHeight > initialHeight - 50) {
                setIsKeyboardVisible(false);
            }
        };

        setInitialHeight(window.visualViewport?.height || window.innerHeight);

        window.visualViewport?.addEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', handleResize);
        };
    }, [initialHeight]);

    return isKeyboardVisible;
};

export default useKeyboardVisibility;