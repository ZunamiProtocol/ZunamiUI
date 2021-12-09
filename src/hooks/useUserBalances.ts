import BigNumber from 'bignumber.js'
import {useEffect, useState} from 'react'
import {useWallet} from 'use-wallet'
import {getBalance} from "../utils/erc20";
import {BIG_ZERO, daiAddress, usdcAddress, usdtAddress} from "../utils/formatbalance";


export const useUserBalances = () => {
    const [balance, setbalance] = useState([BIG_ZERO, BIG_ZERO, BIG_ZERO])
    const {account, ethereum} = useWallet()

    useEffect(() => {
        const fetchbalanceStables = async () => {
            const balanceDai = await getBalance(
                ethereum,
                daiAddress,
                // @ts-ignore
                account,
            )
            const balanceUsdc = await getBalance(
                ethereum,
                usdcAddress,
                // @ts-ignore
                account,
            )
            const balanceUsdt = await getBalance(
                ethereum,
                usdtAddress,
                // @ts-ignore
                account,
            )
            const data =
                [new BigNumber(balanceDai),
                    new BigNumber(balanceUsdc),
                    new BigNumber(balanceUsdt)]
            // @ts-ignore
            setbalance(data)
        }

        if (account) {
            fetchbalanceStables()
        }
        let refreshInterval = setInterval(fetchbalanceStables, 10000)
        return () => clearInterval(refreshInterval)
    }, [account, ethereum])

    return balance
}

