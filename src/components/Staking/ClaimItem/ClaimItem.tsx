import './ClaimItem.scss';

interface ClaimItemProps {
    onClaim?: Function;
    zun: number;
    usd: number;
}

export const ClaimItem = (props: ClaimItemProps): JSX.Element => {
    const usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const numberFormatter = new Intl.NumberFormat();

    return (
        <div className="UnclaimedItem d-flex flex-row align-items-center justify-content-between">
            <div className="">
                <div className="UnclaimedItem__ZUN">ZUN {numberFormatter.format(props.zun)}</div>
                <div className="UnclaimedItem__USD">{usdFormatter.format(props.usd)}</div>
            </div>
            <div>
                <button
                    onClick={() => {
                        if (props.onClaim) {
                            props.onClaim();
                        }
                    }}
                >
                    Claim
                </button>
            </div>
        </div>
    );
};
