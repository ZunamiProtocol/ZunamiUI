import {useEffect} from "react";

const useEagerConnect = (account: string, connect: any, ethereum: any) => {

    useEffect(() => {
        const connectorId = window.localStorage.getItem("METAMASK_ACCOUNT");

        if (!account && connectorId) {
            connect('injected');
            const eth = window.ethereum || ethereum;
            if (!eth) {
                console.log('No metamask');
            }
// requestNetworkSwitch();
        }
    }, []);
};

export default useEagerConnect;
