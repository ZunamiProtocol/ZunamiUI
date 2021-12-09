import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import { approve, getMasterChefContract } from '../sushi/utils'
import useSushi from './useSushi'

const useApprove = (tokenAddress: string) => {
    const { account, ethereum } = useWallet()
    const sushi = useSushi()
    const masterChefContract = getMasterChefContract(sushi)

    const handleApprove = useCallback(async () => {
        try {
            const tx = await approve(ethereum, tokenAddress, masterChefContract, account)
            if (tx) {
                // gtag('event', 'Approve', {'Account': 'AC_' + account.toString()});
            }
            return tx
        } catch (e) {
            console.log(e)
            return false
        }
    }, [account, tokenAddress, masterChefContract])

    return { onApprove: handleApprove }
}

export default useApprove
