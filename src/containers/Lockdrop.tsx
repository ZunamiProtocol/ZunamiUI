import { useEffect, useState } from 'react';
import { Header } from '../components/Header/Header';
import { SideBar } from '../components/SideBar/SideBar';
import './Lockdrop.scss';
import { Container, Row, Col } from 'react-bootstrap';
import { TestnetPlaceholder } from '../components/TestnetPlaceholder/TestnetPlaceholder';
import { getTestnetStatusUrl } from '../api/api';
import { useWallet } from 'use-wallet';
import { HistoryTable } from '../components/HistoryTable/HistoryTable';
import { LockedCoinInput } from '../components/Staking/LockedCoinInput/LockedCoinInput';
import { UnclaimedGiftIcon } from '../components/UnclaimedGiftIcon/UnclaimedGiftIcon';

/* Mock data for table */
const historyItems = [
    {
        value: 1200,
        canUnlock: false,
        lockDate: 1642761600,
        unlockDate: 1642761600,
    },
    {
        value: 1200,
        canUnlock: true,
        lockDate: 1642779900,
        unlockDate: 1642779900,
    },
];

export const Lockdrop = (): JSX.Element => {
    const { account } = useWallet();
    const [testnetStatus, setTestnetStatus] = useState(false);

    useEffect(() => {
        async function getStatus() {
            if (!account) {
                return false;
            }

            const response = await fetch(getTestnetStatusUrl(account));
            const data = await response.json();
            setTestnetStatus(data.active);
        }

        getStatus();
    }, [account]);

    return (
        <Container className={'h-100 d-flex justify-content-between flex-column'}>
            <Header />
            <Row className={'h-100 mb-4 main-row'}>
                <SideBar isMainPage={true} />
                <Col className={'content-col'}>
                    <Row className={'h-100 operation-col'}>
                        <Col className={'ps-0 pe-0'}>
                            {!testnetStatus && (
                                <TestnetPlaceholder
                                    headerTitle="Lockdrop"
                                    title="Lockdrop is available only to Testnet users for now"
                                />
                            )}
                            {testnetStatus && (
                                <div className="Lockdrop">
                                    <div className="Lockdrop__Title">Lockdrop</div>
                                    <div className="d-flex">
                                        <div className="Lockdrop__Locked">
                                            <div className="Lockdrop__Locked__Title">Locked</div>
                                            <div className="Lockdrop__Locked__Range">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="16"
                                                    value="8"
                                                    readOnly
                                                />
                                            </div>
                                            <div className="Lockdrop__Locked__Period">
                                                <span>Lock for </span>
                                                <span className="active">8 weeks</span>
                                            </div>
                                            <LockedCoinInput
                                                token="ZUN LP"
                                                icon="/zun-token.svg"
                                                value={0}
                                            />
                                            <button>Lock</button>
                                        </div>
                                        <div className="Lockdrop__Unclaimed">
                                            <div className="Lockdrop__Unclaimed__Title">
                                                Unclaimed Rewards
                                            </div>
                                            <div className="Lockdrop__Unclaimed__ZUN">
                                                ZUN 1.300,54
                                            </div>
                                            <div className="Lockdrop__Unclaimed__USD">
                                                $4.504,60
                                            </div>
                                            <button>Claim</button>
                                            <UnclaimedGiftIcon className="Lockdrop__Unclaimed__ICON" />
                                        </div>
                                    </div>
                                    <div className="DepositStory">
                                        <div className="DepositStory__Title">Deposit story</div>
                                        <HistoryTable data={historyItems} />
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
