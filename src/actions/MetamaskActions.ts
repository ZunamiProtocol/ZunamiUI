const ethereum = (window as any).ethereum;

export const isWalletConnected = (): boolean => {
    return ethereum && ethereum.isMetaMask;
};

export const connectWallet = async () => {
    if (!isWalletConnected()) {
        alert('Connect your wallet');
    }

    try {
        await ethereum.request({method: 'eth_requestAccounts'});
    } catch (error) {
        alert(error);
    }
};
