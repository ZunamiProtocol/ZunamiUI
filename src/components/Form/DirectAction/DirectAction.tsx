import { useRef, useState } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import './DirectAction.scss';
import { useWallet } from 'use-wallet';

interface DirectActionProps {
    actionName: string;
    hint: string;
    onChange?: Function;
    checked?: boolean;
    disabled: boolean;
}

function getHintByProps(actionName: string, chainId: number) {
    let hint =
        'When using optimized withdrawal funds will be withdrawn within 24 hours and many times cheaper. Optimized withdraw available only in all coins.';

    if (actionName === 'withdraw') {
        if (chainId !== 1) {
            hint = 'When using cross chain withdrawal funds will be withdrawn within 24 hours.';
        }
    } else {
        hint =
            'When using optimized deposit funds will be deposited within 24 hours and many times cheaper';

        if (chainId !== 1) {
            hint =
                'When using deposit funds will be deposited within 24 hours, because users’ funds accumulate in one batch and distribute to the ETH network in Zunami App.';
        }
    }

    return hint;
}

export const DirectAction = (props: DirectActionProps): JSX.Element => {
    const target = useRef(null);
    const [showHint, setShowHint] = useState(false);
    const { chainId } = useWallet();
    const hint = getHintByProps(props.actionName, chainId);

    return (
        <div className={'DirectAction'}>
            {chainId === 1 && (
                <input
                    type="checkbox"
                    checked={props.checked}
                    className={`${props.disabled ? 'disabled' : ''}`}
                    onChange={(e) => {
                        if (props.onChange) {
                            props.onChange(e.currentTarget.checked);
                        }
                    }}
                />
            )}
            {chainId === 1 && <span>Optimized</span>}
            <div ref={target} onClick={() => setShowHint(!showHint)}>
                <OverlayTrigger placement="right" overlay={<Tooltip>{hint}</Tooltip>}>
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7.31725 0.76563C11.1464 0.761233 14.2568 3.86941 14.2524 7.69858C14.248 11.5211 11.1376 14.6161 7.28428 14.592C3.47929 14.5678 0.437059 11.5036 0.42387 7.70077C0.410681 3.876 3.51007 0.770026 7.31725 0.76563ZM5.20483 11.8399C5.20264 11.8531 5.20044 11.8685 5.20044 11.8838C5.22462 12.3301 5.52137 12.6356 5.96759 12.6488C6.09069 12.6532 6.21598 12.64 6.33468 12.6114C7.35242 12.3784 8.18552 11.7937 9.00323 11.1848C9.11533 11.1013 9.13072 10.9782 9.09115 10.8507C9.00982 10.5979 8.76583 10.488 8.50865 10.6045C8.28883 10.7056 8.0822 10.8265 7.86459 10.9298H7.86239C7.73929 10.987 7.60521 10.8705 7.64038 10.7408C7.64038 10.7386 7.64038 10.7386 7.64038 10.7364C8.06462 9.27025 8.49326 7.80409 8.9219 6.34012C9.05818 5.87412 8.81858 5.51362 8.33719 5.46526C8.29103 5.46087 8.24267 5.46306 8.19651 5.46526C7.66456 5.48944 7.16778 5.63452 6.69298 5.87192C6.24895 6.09393 5.84889 6.38409 5.47301 6.70721C5.34112 6.81932 5.28177 6.97319 5.33233 7.13585C5.38069 7.28752 5.53236 7.3183 5.67524 7.34028C5.82471 7.36226 5.95 7.30071 6.0797 7.23916C6.21158 7.17542 6.34347 7.10727 6.47976 7.05892C6.59626 7.01935 6.62923 7.05672 6.60285 7.17542C6.59186 7.22597 6.57648 7.27653 6.56109 7.32709C6.13245 8.7317 5.70161 10.1341 5.27298 11.5387C5.2466 11.6355 5.22682 11.7388 5.20483 11.8399ZM8.15255 3.96393C8.15255 3.95953 8.15255 3.95514 8.15255 3.95074C8.14595 3.41659 7.98549 3.0473 7.56784 2.82749C7.0227 2.53953 6.38744 2.82529 6.23137 3.42099C6.15223 3.72213 6.15883 4.02328 6.23576 4.32662C6.33248 4.7135 6.57208 4.95969 6.96335 5.02563C7.35902 5.09158 7.69973 4.96628 7.93273 4.62557C8.0822 4.40356 8.14155 4.15077 8.15255 3.96393Z"
                            fill="#B4B4B4"
                        />
                    </svg>
                </OverlayTrigger>
            </div>
        </div>
    );
};
