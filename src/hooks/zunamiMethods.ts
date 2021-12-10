import BigNumber from 'bignumber.js'
import {useEffect, useState} from 'react'
import {getMasterChefContract} from '../sushi/utils'
import useSushi from "./useSushi";
import {BIG_ZERO} from "../utils/formatbalance";
import {getTotalHoldings} from "../utils/zunami";

export const useTotalHoldings = () => {
    const [allowance, setAllowance] = useState(BIG_ZERO)
    const sushi = useSushi()
    const masterChefContract = getMasterChefContract(sushi)

    useEffect(() => {
        const fetchTotalHolds = async () => {
            const allowance = await getTotalHoldings(
                masterChefContract
            )
            setAllowance(new BigNumber(allowance))
        }

        if (masterChefContract) {
            fetchTotalHolds()
        }
        let refreshInterval = setInterval(fetchTotalHolds, 10000)
        return () => clearInterval(refreshInterval)
    }, [masterChefContract])

    return allowance
}

