import { ReactElement, useMemo, useRef, useState } from 'react';
import './ZunPoolSummary.scss';
import { OverlayTrigger, Popover } from 'react-bootstrap';

interface ZunPoolSummaryProps {
    logo: string;
    selected: boolean;
    baseApy?: string | number;
    tvl?: string;
    deposit?: string;
    onSelect?: Function;
    comingSoon?: boolean;
    depositTooltipContent?: ReactElement;
}

function logoNameToSvg(name: string, selected: boolean) {
    let icon = null;

    switch (name) {
        case 'USD':
            icon = (
                <div className="d-flex gap-2 align-items-center">
                    <svg
                        width="79"
                        height="61"
                        viewBox="0 0 79 61"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="staking-icon usd"
                    >
                        <path
                            d="M70.7818 18.5262C70.3175 17.66 69.2637 17.3481 68.4284 17.8291L61.6292 21.7442L58.3778 15.3037L63.4176 2.79469C63.7 2.09407 63.526 1.285 62.9833 0.774709C62.4406 0.264737 61.6471 0.163762 61.0014 0.52291L53.1283 4.90534L51.1381 0.962963C50.6949 0.0854044 49.6485 -0.255109 48.8022 0.205174C47.9552 0.664497 47.6279 1.74847 48.071 2.62634L50.0786 6.60295L44.9121 9.47878C44.0701 9.94766 43.7541 11.0353 44.2062 11.9081C44.6586 12.7807 45.7072 13.1081 46.5501 12.6399L51.6836 9.78234L54.5575 15.4751L48.9011 29.5148C48.6171 30.2197 48.7951 31.0339 49.3446 31.5432C49.6694 31.8446 50.0821 32 50.4985 32C50.7862 32 51.0757 31.9258 51.3387 31.7743L60.2078 26.6673L61.4787 29.1848C61.7879 29.7972 62.3902 30.1474 63.0137 30.1474C63.2839 30.1474 63.5586 30.0816 63.8146 29.9426C64.6616 29.4833 64.9889 28.3993 64.5457 27.5214L63.2346 24.9244L70.1094 20.9657C70.945 20.4844 71.2462 19.3923 70.7818 18.5262ZM54.7334 8.0847L58.345 6.0743L56.2915 11.1711L54.7334 8.0847ZM54.017 26.1275L56.6438 19.6077L58.6024 23.4872L54.017 26.1275Z"
                            fill="url(#paint0_linear_968_4794)"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17.4586 25.9453C7.81648 25.9453 0 33.7618 0 43.4039C0 53.046 7.81649 60.8625 17.4586 60.8625H60.5916C70.2337 60.8625 78.0502 53.046 78.0502 43.4039C78.0502 33.7618 70.2337 25.9453 60.5916 25.9453H17.4586ZM39.9536 42.9764C41.4056 43.2233 42.688 43.4413 43.6959 44.0791C45.0384 44.9285 45.8695 46.1077 45.8695 47.4101C45.8695 50.0011 42.5822 52.1019 38.5268 52.1019C34.4712 52.1019 31.1839 50.0011 31.1839 47.4101C31.1839 47.3416 31.186 47.274 31.1916 47.2065H34.4723C34.4561 47.274 34.4473 47.3416 34.4473 47.4101C34.4473 48.4238 36.2738 49.2463 38.5268 49.2463C40.7795 49.2463 42.606 48.4238 42.606 47.4101C42.606 46.3972 40.5662 45.9828 38.5268 45.5749C38.137 45.4969 37.752 45.4274 37.3754 45.3595C35.8055 45.0764 34.3813 44.8195 33.3573 44.0791C32.2597 43.2849 31.5918 42.2362 31.5918 41.0875C31.5918 38.6095 34.6965 36.6001 38.5268 36.6001C42.3569 36.6001 45.4615 38.6095 45.4615 41.0875H42.1981C42.1981 40.1866 40.5544 39.4556 38.5268 39.4556C36.4991 39.4556 34.8551 40.1866 34.8551 41.0875C34.8551 41.9852 36.5266 42.3193 38.5062 42.715L38.5268 42.7191C39.0172 42.8173 39.4939 42.8983 39.9536 42.9764ZM26.9325 44.3498C26.9325 47.0545 24.4437 49.2476 21.3759 49.2476C19.3295 49.2476 17.671 47.4199 17.671 45.1657V37.0028H14.3778V45.1448C14.3749 46.982 15.1058 48.7455 16.4106 50.0497C17.7156 51.354 19.4882 52.0928 21.3411 52.1047C22.7092 52.1136 24.0639 51.8368 25.3171 51.2924C26.0099 50.9574 26.5889 50.4698 26.9241 49.7456V51.6904H26.9325V51.6968H30.2256V37.0028H26.9325L26.9325 44.3498ZM60.8929 32.1078V32.1072H64.1859V51.6961H60.8935V44.3502C60.8935 41.6459 58.4057 39.4531 55.3367 39.4531C52.2689 39.4531 49.7805 41.6459 49.7805 44.3502C49.7805 47.0545 51.4388 49.2472 53.4847 49.2472C55.5304 49.2472 57.1888 47.4199 57.1888 45.166H60.4818C60.4818 46.0771 60.3009 46.9793 59.9493 47.8211C59.5976 48.6628 59.0827 49.4277 58.4327 50.0719C57.7834 50.7162 57.0119 51.2272 56.1629 51.5759C55.3138 51.9246 54.404 52.104 53.4847 52.104C49.6202 52.104 46.4878 48.6321 46.4878 44.3502C46.4878 40.0675 50.4499 36.5964 55.3367 36.5964C56.6562 36.6086 57.9582 36.8954 59.1589 37.4382C59.8858 37.7484 60.4926 38.2832 60.8888 38.963V32.1078H60.8929Z"
                            fill="white"
                        />
                        <path
                            d="M37.3094 13.6251C36.5293 13.62 35.7568 13.7792 35.0422 14.0923C34.6438 14.2701 34.3207 14.5824 34.1296 14.9746V13.8583H33.2468V13.8597H32.2432V22.3106H34.1211V18.0851C34.1211 16.5297 35.5402 15.2684 37.2898 15.2684C38.4565 15.2684 39.4023 16.3194 39.4023 17.6159V22.3106H41.2801V17.6279C41.2819 16.5713 40.8652 15.557 40.1211 14.8069C39.3769 14.0568 38.366 13.6319 37.3094 13.6251Z"
                            fill="white"
                        />
                        <path
                            d="M29.1991 13.8594V18.0848C29.1991 19.6403 27.78 20.9016 26.0306 20.9016C24.8637 20.9016 23.9179 19.8505 23.9179 18.554V13.8594H22.04V18.542C22.0384 19.5986 22.4552 20.6128 23.1993 21.3629C23.9434 22.113 24.9542 22.538 26.0107 22.5448C26.7909 22.5499 27.5634 22.3907 28.278 22.0776C28.6767 21.8995 28.9999 21.5869 29.1911 21.1944V22.3102H31.077V13.8594H29.1991Z"
                            fill="white"
                        />
                        <path
                            d="M13.2852 14.7696V15.5196H18.3953L13.2852 20.6004V22.2988H21.0471V20.6004H20.5803V20.6002H16.0311L16.3104 20.279C16.3287 20.2597 16.3468 20.2402 16.3644 20.2202L16.9436 19.6431L21.0471 15.4411V13.8594H13.2852V14.7696Z"
                            fill="white"
                        />
                        <defs>
                            <linearGradient
                                id="paint0_linear_968_4794"
                                x1="50.0882"
                                y1="2.73504"
                                x2="64.0371"
                                y2="27.6862"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="white" stopOpacity="0.66" />
                                <stop offset="1" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            );
            break;
        case 'ZETH':
            icon = (
                <div className="d-flex gap-2 align-items-center">
                    <svg
                        width="111"
                        height="22"
                        viewBox="0 0 111 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="staking-icon"
                    >
                        <path
                            d="M54.8981 6.7743C54.0352 6.76866 53.1807 6.94473 52.3901 7.29109C51.9495 7.48772 51.5921 7.83324 51.3807 8.26703V7.03227H50.4042V7.03384H49.2939V16.3819H51.3712V11.7079C51.3712 9.98723 52.9411 8.59201 54.8764 8.59201C56.167 8.59201 57.2132 9.75468 57.2132 11.1888V16.3819H59.2904V11.2021C59.2924 10.0333 58.8314 8.91133 58.0083 8.08158C57.1851 7.2518 56.0669 6.78178 54.8981 6.7743Z"
                            fill="black"
                            className="zun"
                        />
                        <path
                            d="M45.926 7.03394V11.708C45.926 13.4287 44.3562 14.8239 42.4211 14.8239C41.1303 14.8239 40.0841 13.6612 40.0841 12.227V7.03394H38.0068V12.2138C38.005 13.3825 38.466 14.5045 39.2891 15.3342C40.1122 16.1639 41.2304 16.634 42.3991 16.6416C43.2621 16.6472 44.1166 16.4711 44.9072 16.1248C45.3481 15.9278 45.7056 15.5819 45.9172 15.1478V16.382H48.0033V7.03394H45.926Z"
                            fill="black"
                            className="zun"
                        />
                        <path
                            d="M28.3232 8.04151V8.87116H33.9759L28.3232 14.4914V16.3702H36.9093V14.4914H36.393V14.4912H31.3608L31.6697 14.1359C31.69 14.1146 31.71 14.093 31.7294 14.0708L32.3702 13.4325L36.9093 8.78438V7.03467H28.3232V8.04151Z"
                            fill="black"
                            className="zun"
                        />
                        <rect
                            x="64.1299"
                            width="46.129"
                            height="21.9355"
                            rx="10.9677"
                            fill="url(#paint0_linear_842_51444)"
                        />
                        <path
                            d="M87.2712 13.8067V12.3038L87.2982 8.28497H89.4026V6.67125H87.309L87.3302 3.51177H87.2712V3.50146H85.1573V6.67125H84.6294V6.6722H84.6289V8.25766H84.6294V8.28497H85.1573V13.8067C85.1573 15.266 86.5772 16.4492 88.3283 16.4492H89.6495V14.5995H88.3283C87.7449 14.5995 87.2712 14.2443 87.2712 13.8067Z"
                            fill="white"
                        />
                        <path
                            d="M96.3532 6.47732C95.419 6.4742 94.4988 6.64078 93.755 7.0128C93.4478 7.14905 92.9609 7.5561 92.7216 8.00177V3.49365H90.5371V16.4524H92.7216V11.232C92.9214 9.61717 94.4614 8.36046 96.3307 8.36046C97.668 8.36046 98.7519 9.56499 98.7519 11.0508V16.4312H100.904V11.065C100.904 8.54575 98.8724 6.48584 96.3532 6.47732Z"
                            fill="white"
                        />
                        <path
                            d="M78.5221 6.41064C75.3838 6.41064 72.8398 8.6587 72.8398 11.4318C72.8398 14.2049 75.3838 16.4529 78.5221 16.4529C80.8052 16.4529 82.7736 15.2626 83.6762 13.5459H81.1809C80.5276 14.195 79.5783 14.6031 78.5221 14.6031C76.8595 14.6031 75.4628 13.5925 75.066 12.2247H84.1329C84.1795 11.9668 84.2033 11.7018 84.2033 11.4318C84.2033 11.1618 84.1795 10.897 84.1329 10.6391C83.7031 8.2422 81.3543 6.41064 78.5221 6.41064ZM78.5221 8.26052C80.174 8.26052 81.5637 9.25956 81.9698 10.6152H75.1464C75.1464 10.4513 75.233 10.2135 75.3315 10.013C75.9177 8.97403 77.1256 8.26052 78.5221 8.26052Z"
                            fill="white"
                        />
                        <path
                            d="M10.9677 21.9355C17.025 21.9355 21.9355 17.025 21.9355 10.9677C21.9355 4.91042 17.025 0 10.9677 0C4.91042 0 0 4.91042 0 10.9677C0 17.025 4.91042 21.9355 10.9677 21.9355Z"
                            fill="url(#paint1_linear_842_51444)"
                        />
                        <path
                            d="M10.9527 18.6477C10.7096 18.6477 10.4665 18.5837 10.2499 18.4556L4.43975 15.0213C4.12017 14.8323 3.89415 14.53 3.80334 14.1701C3.71253 13.8103 3.76797 13.4369 3.95953 13.119L9.76948 3.47868C10.0218 3.06014 10.4641 2.8103 10.9527 2.8103H10.953C11.4417 2.81042 11.8839 3.06033 12.136 3.47887L13.112 5.09816C13.3578 5.5061 13.2264 6.03613 12.8185 6.28202C12.4108 6.52775 11.8807 6.39656 11.6346 5.98854L10.9527 4.85705L5.61565 13.7127L10.9527 16.8674L17.0385 13.2701C17.4486 13.0276 17.9775 13.1637 18.2197 13.5736C18.4621 13.9837 18.3263 14.5125 17.9162 14.7549L11.6558 18.4555C11.4389 18.5837 11.1957 18.6477 10.9527 18.6477Z"
                            fill="white"
                        />
                        <path
                            d="M11.6789 14.4142C11.4737 14.4142 11.27 14.3412 11.1086 14.1989C10.8285 13.9522 10.7389 13.5533 10.8867 13.2105L12.1813 10.2053L10.5455 11.1604C10.1345 11.4006 9.60623 11.2619 9.36581 10.8505C9.1257 10.4392 9.26444 9.91103 9.67575 9.67088L13.5758 7.39359C13.8974 7.20573 14.3034 7.24562 14.5824 7.49255C14.8612 7.73939 14.9502 8.13746 14.8027 8.47955L13.5163 11.4661L15.5685 10.2551C15.9783 10.013 16.5074 10.1493 16.7496 10.5596C16.9916 10.9698 16.8553 11.4986 16.4451 11.7406L12.117 14.2945C11.981 14.3748 11.8295 14.4142 11.6789 14.4142Z"
                            fill="white"
                        />
                        <defs>
                            <linearGradient
                                id="paint0_linear_842_51444"
                                x1="74.1447"
                                y1="18.8709"
                                x2="104.094"
                                y2="3.1685"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#595959" />
                                <stop offset="1" stopColor="#878787" />
                            </linearGradient>
                            <linearGradient
                                id="paint1_linear_842_51444"
                                x1="5.72229"
                                y1="18.7337"
                                x2="17.9806"
                                y2="5.06899"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#F63B00" />
                                <stop offset="1" stopColor="#FFAD00" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <svg
                        width="62"
                        height="16"
                        viewBox="0 0 62 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="staking-text"
                    >
                        <path
                            d="M7.92078 7.57814C7.08073 7.0464 5.93949 6.97556 4.64848 6.71715C3.38969 6.46546 2.32408 6.25441 2.32408 5.68429C2.32408 5.11395 3.36492 4.65121 4.64848 4.65121C5.93205 4.65121 6.97256 5.11395 6.97256 5.68429H9.03854C9.03854 4.11558 7.07311 2.84351 4.64848 2.84351C2.22369 2.84351 0.258268 4.11558 0.258268 5.68429C0.258268 6.4114 0.681046 7.0753 1.37586 7.57814C2.17964 8.15926 3.37285 8.26981 4.64848 8.52506C5.93949 8.78327 7.23083 9.04558 7.23083 9.68676C7.23083 10.3285 6.07454 10.8492 4.64848 10.8492C3.22227 10.8492 2.06598 10.3285 2.06598 9.68676C2.06598 9.64332 2.07148 9.60061 2.08184 9.55793H0.00485681C0.0012959 9.60061 0 9.64332 0 9.68676C0 11.327 2.08103 12.6569 4.64848 12.6569C7.21577 12.6569 9.2968 11.327 9.2968 9.68676C9.2968 8.86233 8.77072 8.11582 7.92078 7.57814Z"
                            fill="black"
                        />
                        <path
                            d="M12.4446 10.0741V6.67697H12.4448V4.66234H14.5115V3.09375H12.4448V0.774331H12.4446V0.00268555H10.3787V3.10151H9.8623V4.65098H10.3787V10.0741C10.3787 11.5004 11.7664 12.6567 13.4777 12.6567H14.7691V10.849H13.4777C12.9076 10.849 12.4446 10.5018 12.4446 10.0741Z"
                            fill="black"
                        />
                        <path
                            d="M23.8042 3.10885H23.804V4.347C23.5888 3.8993 23.219 3.54393 22.7623 3.34521C22.0248 3.02436 21.1954 2.84351 20.3175 2.84351C17.2516 2.84351 14.7656 5.04032 14.7656 7.75022C14.7656 10.4601 16.731 12.6569 19.1558 12.6569C21.5805 12.6569 23.5459 10.6915 23.5459 8.26665H21.4801C21.4801 9.69291 20.4396 10.8492 19.1558 10.8492C17.8721 10.8492 16.8316 9.46154 16.8316 7.75022C16.8316 6.03889 18.3929 4.65121 20.3175 4.65121C22.2393 4.65121 23.7979 6.0335 23.804 7.74021V9.01149H23.8042V12.3987H25.8701V3.10174H23.8042V3.10885Z"
                            fill="black"
                        />
                        <path
                            d="M35.6304 3.09898H32.8285L32.5501 3.33404L29.2159 6.1274V0.00129947H29.2105V0H27.1445V12.3958H29.2105V9.01136H29.2159V8.51516L29.8292 7.99731L33.87 12.3958H36.3248L31.2117 6.82983L35.6304 3.09898Z"
                            fill="black"
                        />
                        <path d="M38.942 3.09888H36.876V12.3957H38.942V3.09888Z" fill="black" />
                        <path d="M38.942 0.516602H36.876V2.58253H38.942V0.516602Z" fill="black" />
                        <path
                            d="M45.7864 2.84354C44.8897 2.84055 44.0427 3.02626 43.2923 3.35755C42.8505 3.55261 42.496 3.902 42.2848 4.33492V3.09402H40.2182V3.10177H40.2129V12.3987H40.2182V12.4014H42.2848V7.57054C42.3896 5.94285 43.908 4.65125 45.7649 4.65125C47.0485 4.65125 48.089 5.80754 48.089 7.2338V12.3987H50.155V7.24742C50.155 4.82912 48.2048 2.85193 45.7864 2.84354Z"
                            fill="black"
                        />
                        <path
                            d="M59.9333 3.09404V4.34594C59.7181 3.89876 59.3485 3.54382 58.8922 3.34527C58.1547 3.02441 57.3251 2.84375 56.4475 2.84375C53.3815 2.84375 50.8955 5.04055 50.8955 7.75027C50.8955 10.4602 52.8609 12.657 55.2857 12.657C57.7104 12.657 59.6758 10.6915 59.6758 8.26689H57.6098C57.6098 9.69296 56.5693 10.8493 55.2857 10.8493C54.0018 10.8493 52.9613 9.4616 52.9613 7.75027C52.9613 6.03913 54.5226 4.65146 56.4475 4.65146C58.3547 4.65146 59.9042 6.01302 59.9333 7.70178V10.543H59.934V10.8493C59.934 12.5606 58.3729 13.9482 56.4482 13.9482H53.2196V15.756H56.4482C59.514 15.756 62 13.5591 62 10.8493V3.09404H59.9333Z"
                            fill="black"
                        />
                    </svg>
                </div>
            );
            break;
        case 'ZUN':
            icon = (
                <div className="d-flex gap-2 align-items-center ps-3 zun-staking-logo">
                    <svg
                        width="16"
                        height="12"
                        viewBox="0 0 16 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="zun-logo"
                    >
                        <path
                            d="M8.56819 12C6.42605 12 4.52269 11.2648 3.04239 9.8604C2.05088 8.91977 1.28621 7.71143 0.769649 6.26901C0.258944 4.84302 0 3.20652 0 1.40498L3.33492 1.40498C3.33492 2.82866 3.52921 4.09304 3.91238 5.16296C4.25318 6.11457 4.73625 6.89139 5.34817 7.47197C6.2631 8.33995 7.437 8.74913 8.83713 8.68811C10.1275 8.63188 11.1231 8.23318 11.7963 7.50307C12.3565 6.89537 12.6651 6.07372 12.6651 5.18951C12.6727 4.6867 12.4834 4.20054 12.1371 3.83317C11.9747 3.66356 11.7787 3.52916 11.5613 3.43844C11.3439 3.34771 11.11 3.30264 10.8742 3.30607C10.5485 3.30849 10.2351 3.4293 9.99333 3.64557C9.76081 3.86157 9.48368 4.30689 9.48368 5.2017L6.14875 5.2017C6.14875 3.12285 6.99931 1.89627 7.71281 1.23336C8.57289 0.443163 9.70152 0.00287752 10.8742 7.37461e-05C11.5601 -0.00362201 12.2395 0.131628 12.8708 0.397527C13.5021 0.663427 14.072 1.05437 14.5455 1.54638C15.4835 2.51718 16 3.81101 16 5.1895C16 6.90124 15.3813 8.51494 14.2579 9.73345C13.3694 10.6972 11.7331 11.8711 8.98353 11.9909C8.84418 11.997 8.70575 12 8.56819 12Z"
                            fill="black"
                        />
                    </svg>
                    <svg
                        width="29"
                        height="11"
                        viewBox="0 0 29 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="zun-text"
                    >
                        <path
                            d="M24.8868 0.812623C24.0787 0.807336 23.2785 0.972224 22.5381 1.29658C22.1255 1.48071 21.7908 1.80429 21.5929 2.21052V1.0542H20.6784V1.05567H19.6387V9.80986H21.584V5.43277C21.584 3.82143 23.0541 2.51485 24.8665 2.51485C26.0751 2.51485 27.0548 3.60365 27.0548 4.94666V9.80986H29V4.95909C29.0019 3.86458 28.5702 2.81389 27.7994 2.03685C27.0285 1.25979 25.9813 0.819624 24.8868 0.812623Z"
                            fill="black"
                        />
                        <path
                            d="M16.4855 1.05879V5.43589C16.4855 7.04724 15.0155 8.35381 13.2033 8.35381C11.9945 8.35381 11.0147 7.26499 11.0147 5.92198V1.05879H9.06946V5.90956C9.06774 7.00406 9.49949 8.0547 10.2703 8.83174C11.0411 9.60877 12.0882 10.049 13.1827 10.056C13.9909 10.0613 14.7911 9.89642 15.5314 9.57207C15.9443 9.38759 16.2791 9.0637 16.4773 8.65713V9.81299H18.4309V1.05879H16.4855Z"
                            fill="black"
                        />
                        <path
                            d="M0 2.00167V2.77861H5.29355L0 8.0418V9.80124H8.0406V8.0418H7.55706V8.04161H2.84455L3.13386 7.70884C3.15284 7.6889 3.1716 7.66872 3.18977 7.64795L3.78982 7.05016L8.0406 2.69734V1.05879H0V2.00167Z"
                            fill="black"
                        />
                    </svg>
                    <svg
                        width="68"
                        height="20"
                        viewBox="0 0 68 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="staking-text"
                    >
                        <rect y="1" width="68" height="19" rx="9.5" fill="#D9D9D9" />
                        <path
                            d="M9.84 8.974C9.84 8.34867 10.092 7.854 10.596 7.49C11.1 7.126 11.7207 6.944 12.458 6.944C13.1393 6.944 13.7367 7.084 14.25 7.364C14.7727 7.63467 15.3093 8.078 15.86 8.694L14.88 9.394C14.18 8.48867 13.382 8.036 12.486 8.036C12.094 8.036 11.772 8.12 11.52 8.288C11.268 8.44667 11.142 8.67067 11.142 8.96C11.142 9.11867 11.1747 9.24933 11.24 9.352C11.3053 9.45467 11.422 9.53867 11.59 9.604C11.7673 9.66 11.9027 9.702 11.996 9.73C12.0987 9.74867 12.2853 9.77667 12.556 9.814L13.13 9.898C14.0353 10.0287 14.7213 10.2387 15.188 10.528C15.664 10.808 15.902 11.2747 15.902 11.928C15.902 12.6093 15.6173 13.16 15.048 13.58C14.488 13.9907 13.7647 14.196 12.878 14.196C11.9913 14.196 11.254 13.9907 10.666 13.58C10.078 13.16 9.62533 12.6467 9.308 12.04L10.484 11.41C10.6987 11.9327 11.0207 12.3433 11.45 12.642C11.8793 12.9313 12.3693 13.076 12.92 13.076C13.4147 13.076 13.816 12.978 14.124 12.782C14.4413 12.5767 14.6 12.306 14.6 11.97C14.6 11.8953 14.5907 11.8253 14.572 11.76C14.5533 11.6947 14.5207 11.6387 14.474 11.592C14.4273 11.536 14.3853 11.4893 14.348 11.452C14.3107 11.4147 14.25 11.382 14.166 11.354C14.082 11.3167 14.012 11.2887 13.956 11.27C13.9093 11.2513 13.83 11.2327 13.718 11.214C13.606 11.186 13.5267 11.1673 13.48 11.158C13.4333 11.1487 13.3447 11.1393 13.214 11.13C13.0927 11.1113 13.0133 11.0973 12.976 11.088L12.402 11.004C11.5713 10.8827 10.9367 10.668 10.498 10.36C10.0593 10.052 9.84 9.59 9.84 8.974ZM16.5788 7.14H18.4828V4.76H19.7988V7.14H21.8148V8.288H19.7988V12.46C19.7988 12.7213 19.9201 12.852 20.1628 12.852H21.4228V14H19.6308C19.2948 14 19.0195 13.8927 18.8048 13.678C18.5901 13.454 18.4828 13.1693 18.4828 12.824V8.288H16.5788V7.14ZM22.963 8.946C23.2337 8.36733 23.6444 7.89133 24.195 7.518C24.755 7.13533 25.4317 6.944 26.225 6.944C27.149 6.944 27.8864 7.19133 28.437 7.686C28.9877 8.18067 29.263 8.84333 29.263 9.674V14H27.975V12.922H27.779C27.611 13.286 27.3264 13.5893 26.925 13.832C26.5237 14.0747 26.001 14.196 25.357 14.196C24.5917 14.196 23.9757 14.0047 23.509 13.622C23.0517 13.2393 22.823 12.74 22.823 12.124C22.823 10.9013 23.6957 10.206 25.441 10.038L27.975 9.8V9.618C27.975 9.15133 27.8164 8.78733 27.499 8.526C27.191 8.25533 26.757 8.12 26.197 8.12C25.161 8.12 24.461 8.568 24.097 9.464L22.963 8.946ZM24.153 12.068C24.153 12.3947 24.279 12.6513 24.531 12.838C24.783 13.0153 25.133 13.104 25.581 13.104C26.3557 13.104 26.9484 12.9033 27.359 12.502C27.7697 12.0913 27.975 11.5733 27.975 10.948V10.836L25.581 11.06C24.629 11.144 24.153 11.48 24.153 12.068ZM37.9761 7.14L34.8261 9.786L37.9201 14H36.3381L33.8741 10.598L32.4601 11.774V14H31.1441V4.2H32.4601V10.038H32.6281L36.0441 7.14H37.9761ZM39.0578 5.782C38.8524 5.57667 38.7498 5.32933 38.7498 5.04C38.7498 4.75067 38.8524 4.508 39.0578 4.312C39.2631 4.10667 39.5151 4.004 39.8138 4.004C40.1124 4.004 40.3644 4.10667 40.5698 4.312C40.7751 4.508 40.8778 4.75067 40.8778 5.04C40.8778 5.32933 40.7751 5.57667 40.5698 5.782C40.3644 5.978 40.1124 6.076 39.8138 6.076C39.5151 6.076 39.2631 5.978 39.0578 5.782ZM40.4718 7.14V14H39.1558V7.14H40.4718ZM42.437 7.14H43.725V8.302H43.921C44.3504 7.45267 45.1204 7.028 46.231 7.028C46.9964 7.028 47.631 7.27533 48.135 7.77C48.6484 8.26467 48.905 8.96467 48.905 9.87V14H47.589V9.982C47.589 9.394 47.435 8.946 47.127 8.638C46.8284 8.33 46.3944 8.176 45.825 8.176C45.181 8.176 44.6724 8.372 44.299 8.764C43.935 9.156 43.753 9.70667 43.753 10.416V14H42.437V7.14ZM56.0969 7.14H57.3849V13.79C57.3849 14.7233 57.0769 15.4887 56.4609 16.086C55.8449 16.6927 55.0282 16.996 54.0109 16.996C52.4895 16.996 51.2995 16.3613 50.4409 15.092L51.6169 14.406C52.1115 15.3487 52.8815 15.82 53.9269 15.82C54.5802 15.82 55.0982 15.6427 55.4809 15.288C55.8729 14.9333 56.0689 14.4107 56.0689 13.72V12.754H55.9009C55.3875 13.6033 54.6035 14.028 53.5489 14.028C52.6342 14.028 51.8689 13.6967 51.2529 13.034C50.6369 12.3713 50.3289 11.522 50.3289 10.486C50.3289 9.45 50.6369 8.60067 51.2529 7.938C51.8689 7.27533 52.6342 6.944 53.5489 6.944C54.6035 6.944 55.3875 7.36867 55.9009 8.218H56.0969V7.14ZM52.2609 12.236C52.6715 12.6467 53.2129 12.852 53.8849 12.852C54.5569 12.852 55.0889 12.642 55.4809 12.222C55.8729 11.802 56.0689 11.2233 56.0689 10.486C56.0689 9.74867 55.8729 9.17 55.4809 8.75C55.0889 8.33 54.5569 8.12 53.8849 8.12C53.2129 8.12 52.6715 8.33 52.2609 8.75C51.8502 9.16067 51.6449 9.73933 51.6449 10.486C51.6449 11.2327 51.8502 11.816 52.2609 12.236Z"
                            fill="black"
                        />
                    </svg>
                </div>
            );
            break;
    }

    return icon;
}

export const ZunPoolSummary: React.FC<ZunPoolSummaryProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    baseApy,
    deposit,
    tvl,
    selected,
    logo,
    onSelect,
    comingSoon,
    depositTooltipContent,
}) => {
    let label = useMemo(() => {
        if (comingSoon) {
            return 'soon';
        }

        return selected ? 'Selected' : 'Select';
    }, [comingSoon, selected]);

    const [depositPopoverVisible, setDepositPopoverVisible] = useState(false);
    const depositPopover = (
        <Popover
            onMouseEnter={() => setDepositPopoverVisible(true)}
            onMouseLeave={() => setDepositPopoverVisible(false)}
            className="notifications-popover"
        >
            <Popover.Body>{depositTooltipContent}</Popover.Body>
        </Popover>
    );

    return (
        <div
            className={`ZunPoolSummary ${className} ${selected ? 'ZunPoolSummary__Selected' : ''} ${
                comingSoon ? 'disabled' : ''
            } `}
            onClick={() => {
                if (onSelect) {
                    // @ts-ignore
                    onSelect(logo);
                }
            }}
        >
            <div className="d-flex justify-content-between flex-column gap-2">
                {logoNameToSvg(logo, selected)}
                <button
                    className={`btn-secondary ${selected || comingSoon ? 'disabled' : ''}`}
                    onClick={() => {
                        if (onSelect) {
                            // @ts-ignore
                            onSelect(logo);
                        }
                    }}
                >
                    {label}
                </button>
            </div>
            <div className="d-flex values">
                {tvl && (
                    <div className="block flex-fill">
                        <div className="title">TVL</div>
                        <div className="value vela-sans">{tvl}</div>
                    </div>
                )}
                <div className="block flex-fill">
                    <div className="title">APY</div>
                    <div className="value vela-sans">{`${baseApy}%`}</div>
                </div>
            </div>
        </div>
    );
};
