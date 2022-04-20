import { useState, useEffect } from 'react';

const useOnlineState = () => {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        window.addEventListener('offline', function (e) {
            setOnline(false);
        });

        window.addEventListener('online', function (e) {
            setOnline(true);
        });
    }, []);

    return online;
};

export default useOnlineState;
