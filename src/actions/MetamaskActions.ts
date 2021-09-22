const ethereum = (window as any).ethereum;

export const isWalletConnected = (): boolean => {
    return ethereum && ethereum.isMetaMask;
};

export const connectWallet = async () => {
    if (!isWalletConnected()) {
        alert('Connect your wallet');

        try {
            await ethereum.request({method: 'eth_requestAccounts'});
        } catch (error) {
            console.log(error);
        }
    }
};

export const getWalletAddrs = async (): Promise<string[] | null> => {
    if (!isWalletConnected()) {
        alert('Connect your wallet');
        return null;
    }

    const accounts: string[] = await ethereum.request({method: 'eth_accounts'});
    return accounts;
};
