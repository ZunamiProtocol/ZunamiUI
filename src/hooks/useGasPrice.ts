import { useState, useEffect } from 'react';

const API_KEY = 'UPPVCS8VTCCNT3T83BZ8H6YRE9WVDY6W2P';

export const useGasPrice = () => {
    const [gasPrice, setGasPrice] = useState('');

    useEffect(() => {
        fetch(`https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${API_KEY}`)
            .then((response) => response.json())
            .then((data) => setGasPrice(data.result.ProposeGasPrice));
    }, []);

    return gasPrice;
};
