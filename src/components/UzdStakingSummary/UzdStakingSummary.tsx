import './UzdStakingSummary.scss';
import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '../../utils/formatbalance';

interface UzdStakingSummaryProps {
    logo: string;
    selected: boolean;
    baseApy: string;
    deposit: string;
    onSelect?: Function;
}

function logoNameToSvg(name: string) {
    let icon = null;

    switch (name) {
        case 'UZD':
            icon = (
                <svg
                    width="65"
                    height="38"
                    viewBox="0 0 65 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="staking-icon uzd"
                >
                    <path
                        d="M37.8389 23.1282L37.0116 21.5199C36.9257 21.3531 36.8084 21.2052 36.6666 21.0849C36.5248 20.9646 36.3613 20.8742 36.1853 20.8188C36.0095 20.7626 35.8246 20.7426 35.6412 20.7598C35.4579 20.777 35.2796 20.8312 35.1167 20.9193L27.4061 25.0881L23.7263 17.9341L29.4878 3.68732C29.5795 3.46236 29.6124 3.21676 29.5832 2.97478C29.5741 2.76492 29.52 2.55969 29.4248 2.37368L28.5977 0.765869C28.5118 0.598988 28.3947 0.451154 28.2529 0.330869C28.1111 0.210585 27.9476 0.120226 27.7716 0.0649883C27.5958 0.00881836 27.4109 -0.0112278 27.2275 0.00596959C27.0441 0.023167 26.866 0.0772689 26.703 0.165207L17.2228 5.29082L15.3094 1.57107C15.2236 1.40421 15.1063 1.25638 14.9646 1.13607C14.8228 1.01576 14.6593 0.925331 14.4834 0.869975C14.3076 0.813551 14.1227 0.793394 13.9393 0.810633C13.7559 0.827871 13.5776 0.882163 13.4148 0.97041L11.8465 1.81816C11.6837 1.90627 11.5395 2.02645 11.4222 2.17182C11.3048 2.31718 11.2166 2.48487 11.1626 2.66527C11.1078 2.84547 11.0881 3.03501 11.1049 3.223C11.1217 3.41099 11.1746 3.59374 11.2604 3.76076L13.1738 7.47985L7.7473 10.4136C7.58454 10.5016 7.44031 10.6217 7.32299 10.767C7.20566 10.9123 7.11755 11.0799 7.06364 11.2603C7.00869 11.4405 6.98903 11.6301 7.00581 11.8182C7.02258 12.0062 7.07546 12.189 7.1614 12.356L7.98853 13.9638C8.07436 14.1307 8.19153 14.2785 8.3333 14.3988C8.47507 14.5191 8.63864 14.6095 8.8146 14.6647C8.99038 14.7209 9.17521 14.741 9.35858 14.7238C9.54195 14.7066 9.72026 14.6525 9.88317 14.5645L15.309 11.6309L18.6742 18.1732L12.6092 33.1705C12.5296 33.3767 12.4948 33.598 12.507 33.8194C12.5199 34.041 12.5796 34.2571 12.6821 34.4526C12.7021 34.4904 12.7174 34.5213 12.7333 34.5529L13.5975 36.2341C13.6833 36.401 13.8004 36.5488 13.9421 36.6691C14.0839 36.7894 14.2474 36.8797 14.4233 36.935C14.5584 36.9781 14.699 37 14.8405 37C15.0675 36.9998 15.2911 36.9431 15.4921 36.8348L25.4925 31.4279L26.6514 33.6811C26.7372 33.848 26.8544 33.9958 26.9962 34.1161C27.138 34.2364 27.3015 34.3268 27.4775 34.382C27.6533 34.4382 27.8381 34.4583 28.0215 34.4411C28.2048 34.4239 28.3831 34.3698 28.5461 34.2818L30.1146 33.4338C30.2772 33.3457 30.4214 33.2256 30.5387 33.0802C30.6559 32.9349 30.7441 32.7673 30.798 32.5869C30.8529 32.4067 30.8724 32.2172 30.8556 32.0292C30.8389 31.8412 30.7861 31.6585 30.7003 31.4914L29.5415 29.2389L37.2526 25.0701C37.4154 24.9821 37.5596 24.8619 37.6769 24.7166C37.7943 24.5713 37.8825 24.4036 37.9365 24.2232C37.9913 24.0431 38.0109 23.8537 37.9942 23.6657C37.9775 23.4778 37.9247 23.2951 37.8389 23.1282ZM19.3581 9.44189L23.0018 7.47208L20.9521 12.5404L19.3581 9.44189ZM23.3572 27.2771L18.9942 29.6357L21.4485 23.5666L23.3572 27.2771Z"
                        fill="url(#paint0_linear_189_288143)"
                    />
                    <path
                        d="M16.8658 17.2396V26.9009C16.8658 30.4575 13.5931 33.3414 9.55897 33.3414C6.86793 33.3414 4.68699 30.9382 4.68699 27.9738V17.2396H0.356457V27.9464C0.352618 30.3622 1.31375 32.6812 3.02968 34.3963C4.7456 36.1114 7.07669 37.083 9.51315 37.0986C11.3122 37.1103 13.0937 36.7463 14.7416 36.0304C15.6661 35.621 16.4146 34.9004 16.8548 33.9964V36.5538H16.8658V36.5621H21.1963V17.2396H16.8658Z"
                        fill="black"
                    />
                    <path
                        d="M59.929 10.8005V10.8013H59.9231V19.8158C59.4025 18.922 58.6047 18.2187 57.6485 17.8107C56.0697 17.097 54.3574 16.7199 52.6224 16.7037C46.1963 16.7037 40.9863 21.2683 40.9863 26.8999C40.9863 32.5306 45.1053 37.0961 50.1874 37.0961C51.3957 37.0962 52.5923 36.8602 53.7087 36.4017C54.825 35.9432 55.8394 35.2712 56.6938 34.424C57.5482 33.5768 58.226 32.571 58.6884 31.4641C59.1507 30.3572 59.3886 29.1708 59.3885 27.9727H55.0582C55.0582 30.9366 52.8776 33.3395 50.1874 33.3395C47.4968 33.3395 45.3162 30.456 45.3162 26.8999C45.3162 23.3438 48.5883 20.4604 52.6224 20.4604C56.6578 20.4604 59.9295 23.3438 59.9295 26.8999V36.5597H64.2593V10.8005H59.929Z"
                        fill="black"
                    />
                    <path
                        d="M23.0523 19.3192V21.0292H34.8028L23.0523 32.613V36.4854H40.9006V32.613H39.8273V32.6126H29.5375L30.1797 31.8802C30.2218 31.8363 30.2634 31.7919 30.3037 31.7462L31.4649 30.4305L40.9006 20.8504V17.244H23.0523V19.3192Z"
                        fill="black"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_189_288143"
                            x1="11.0789"
                            y1="2.02011"
                            x2="28.555"
                            y2="29.1421"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#ABABAB" stopOpacity="0.66" />
                            <stop offset="0.927083" stopColor="#D9D9D9" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            );
            break;
        case 'ZETH':
            icon = (
                <svg
                    width="73"
                    height="27"
                    viewBox="0 0 73 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="staking-icon zeth"
                >
                    <path
                        d="M45.1507 20.9928V17.9336L45.2056 9.75337H49.4891V6.46867H45.2277L45.2708 0.0375696H45.1507V0.0166016H40.8479V6.46867H39.7733V6.47059H39.7724V9.69779H39.7733V9.75337H40.8479V20.9928C40.8479 23.9633 43.7381 26.3715 47.3023 26.3715H49.9917V22.6065H47.3023C46.1149 22.6065 45.1507 21.8835 45.1507 20.9928Z"
                        fill="black"
                    />
                    <path
                        d="M63.6393 6.07323C61.7379 6.06687 59.8648 6.40595 58.3508 7.16318C57.7255 7.44052 56.7343 8.26905 56.2473 9.17622V0H51.8008V26.3774H56.2473V15.7514C56.654 12.4643 59.7887 9.90633 63.5937 9.90633C66.3157 9.90633 68.522 12.3581 68.522 15.3825V26.3342H72.9027V15.4113C72.9027 10.2835 68.7672 6.09056 63.6393 6.07323Z"
                        fill="black"
                    />
                    <path
                        d="M0 3.42264V4.84588H13.2636L3.56656 14.4873V17.7103H21.8623V14.4873H20.9765V14.4869H8.91841L9.44838 13.8773C9.48316 13.8408 9.51751 13.8039 9.55079 13.7658L10.509 12.6707L18.2957 4.69701V1.69543H0V3.42264Z"
                        fill="url(#paint0_linear_189_264645)"
                    />
                    <path
                        d="M27.3448 5.93653C20.9569 5.93653 15.7787 10.5124 15.7787 16.157C15.7787 21.8017 20.9569 26.3775 27.3448 26.3775C31.9922 26.3775 35.9987 23.9546 37.836 20.4603H32.7568C31.4271 21.7815 29.4947 22.6121 27.3448 22.6121C23.9607 22.6121 21.1177 20.5551 20.31 17.771H38.7657C38.8604 17.246 38.909 16.7065 38.909 16.157C38.909 15.6075 38.8604 15.0685 38.7657 14.5434C37.8907 9.66464 33.1098 5.93653 27.3448 5.93653ZM27.3448 9.70192C30.7072 9.70192 33.536 11.7355 34.3626 14.4949H20.4737C20.4737 14.1612 20.65 13.6771 20.8504 13.2691C22.0437 11.1543 24.5023 9.70192 27.3448 9.70192Z"
                        fill="black"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_189_264645"
                            x1="2.50516"
                            y1="1.49896"
                            x2="19.1036"
                            y2="17.6599"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FF5500" />
                            <stop offset="0.66495" stopColor="#FF5500" stopOpacity="0.99" />
                            <stop offset="0.68657" stopColor="#FF5500" stopOpacity="0.88545" />
                            <stop offset="0.74777" stopColor="#FF5500" stopOpacity="0.60929" />
                            <stop offset="0.80287" stopColor="#FF5500" stopOpacity="0.39034" />
                            <stop offset="0.84992" stopColor="#FF5500" stopOpacity="0.23248" />
                            <stop offset="0.88707" stopColor="#FF5500" stopOpacity="0.13567" />
                            <stop offset="0.90972" stopColor="#FF5500" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
            );
            break;
    }

    return icon;
}

export const UzdStakingSummary: React.FC<
    UzdStakingSummaryProps & React.HTMLProps<HTMLDivElement>
> = ({ className, baseApy, deposit, selected, logo, onSelect }) => {
    return (
        <div
            className={`UzdStakingSummary d-flex  ${className} ${
                selected ? 'UzdStakingSummary__Selected' : ''
            }`}
            onClick={() => {
                if (onSelect) {
                    // @ts-ignore
                    onSelect(logo);
                }
            }}
        >
            <div className="d-flex justify-content-center align-items-center flex-column me-4">
                {logoNameToSvg(logo)}
                <button
                    className={`btn-secondary mt-2 ${selected ? 'disabled' : ''}`}
                    onClick={() => {
                        if (onSelect) {
                            // @ts-ignore
                            onSelect(logo);
                        }
                    }}
                >
                    {selected ? 'Selected' : 'Select'}
                </button>
            </div>
            <div className="d-flex values w-100">
                <div className="block flex-fill d-flex flex-column col-7 gap-1">
                    <div className="title">{`${logo === 'UZD' ? 'UZD' : 'zETH'} Balance`}</div>
                    <div className="value vela-sans">
                        {logo === 'UZD' ? `$${deposit}` : deposit}
                    </div>
                </div>
                <div className="block flex-fill d-flex flex-column col-5 gap-1">
                    <div className="title">APY</div>
                    <div className="value vela-sans">{`${baseApy}%`}</div>
                </div>
            </div>
        </div>
    );
};
