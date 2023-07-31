import './StakingSummary.scss';

interface StakingSummaryProps {
    logo: string;
    selected: boolean;
    baseApy: string | number;
    tvl: string;
    deposit: string;
    onSelect?: Function;
}

function logoNameToSvg(name: string, selected: boolean) {
    let icon = null;

    switch (name) {
        case 'UZD':
            icon = (
                <svg
                    width="105"
                    height="23"
                    viewBox="0 0 105 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="staking-icon"
                >
                    <path
                        d="M49.96 10.256C49.96 9.54133 50.248 8.976 50.824 8.56C51.4 8.144 52.1093 7.936 52.952 7.936C53.7307 7.936 54.4133 8.096 55 8.416C55.5973 8.72533 56.2107 9.232 56.84 9.936L55.72 10.736C54.92 9.70133 54.008 9.184 52.984 9.184C52.536 9.184 52.168 9.28 51.88 9.472C51.592 9.65333 51.448 9.90933 51.448 10.24C51.448 10.4213 51.4853 10.5707 51.56 10.688C51.6347 10.8053 51.768 10.9013 51.96 10.976C52.1627 11.04 52.3173 11.088 52.424 11.12C52.5413 11.1413 52.7547 11.1733 53.064 11.216L53.72 11.312C54.7547 11.4613 55.5387 11.7013 56.072 12.032C56.616 12.352 56.888 12.8853 56.888 13.632C56.888 14.4107 56.5627 15.04 55.912 15.52C55.272 15.9893 54.4453 16.224 53.432 16.224C52.4187 16.224 51.576 15.9893 50.904 15.52C50.232 15.04 49.7147 14.4533 49.352 13.76L50.696 13.04C50.9413 13.6373 51.3093 14.1067 51.8 14.448C52.2907 14.7787 52.8507 14.944 53.48 14.944C54.0453 14.944 54.504 14.832 54.856 14.608C55.2187 14.3733 55.4 14.064 55.4 13.68C55.4 13.5947 55.3893 13.5147 55.368 13.44C55.3467 13.3653 55.3093 13.3013 55.256 13.248C55.2027 13.184 55.1547 13.1307 55.112 13.088C55.0693 13.0453 55 13.008 54.904 12.976C54.808 12.9333 54.728 12.9013 54.664 12.88C54.6107 12.8587 54.52 12.8373 54.392 12.816C54.264 12.784 54.1733 12.7627 54.12 12.752C54.0667 12.7413 53.9653 12.7307 53.816 12.72C53.6773 12.6987 53.5867 12.6827 53.544 12.672L52.888 12.576C51.9387 12.4373 51.2133 12.192 50.712 11.84C50.2107 11.488 49.96 10.96 49.96 10.256ZM57.6615 8.16H59.8375V5.44H61.3415V8.16H63.6455V9.472H61.3415V14.24C61.3415 14.5387 61.4802 14.688 61.7575 14.688H63.1975V16H61.1495C60.7655 16 60.4508 15.8773 60.2055 15.632C59.9602 15.376 59.8375 15.0507 59.8375 14.656V9.472H57.6615V8.16ZM64.9578 10.224C65.2671 9.56267 65.7364 9.01867 66.3658 8.592C67.0058 8.15467 67.7791 7.936 68.6858 7.936C69.7418 7.936 70.5844 8.21867 71.2138 8.784C71.8431 9.34933 72.1578 10.1067 72.1578 11.056V16H70.6858V14.768H70.4618C70.2698 15.184 69.9444 15.5307 69.4858 15.808C69.0271 16.0853 68.4298 16.224 67.6938 16.224C66.8191 16.224 66.1151 16.0053 65.5818 15.568C65.0591 15.1307 64.7978 14.56 64.7978 13.856C64.7978 12.4587 65.7951 11.664 67.7898 11.472L70.6858 11.2V10.992C70.6858 10.4587 70.5044 10.0427 70.1418 9.744C69.7898 9.43467 69.2938 9.28 68.6538 9.28C67.4698 9.28 66.6698 9.792 66.2538 10.816L64.9578 10.224ZM66.3178 13.792C66.3178 14.1653 66.4618 14.4587 66.7498 14.672C67.0378 14.8747 67.4378 14.976 67.9498 14.976C68.8351 14.976 69.5124 14.7467 69.9818 14.288C70.4511 13.8187 70.6858 13.2267 70.6858 12.512V12.384L67.9498 12.64C66.8618 12.736 66.3178 13.12 66.3178 13.792ZM82.1155 8.16L78.5155 11.184L82.0515 16H80.2435L77.4275 12.112L75.8115 13.456V16H74.3075V4.8H75.8115V11.472H76.0035L79.9075 8.16H82.1155ZM83.3518 6.608C83.1171 6.37333 82.9998 6.09067 82.9998 5.76C82.9998 5.42933 83.1171 5.152 83.3518 4.928C83.5864 4.69333 83.8744 4.576 84.2158 4.576C84.5571 4.576 84.8451 4.69333 85.0798 4.928C85.3144 5.152 85.4318 5.42933 85.4318 5.76C85.4318 6.09067 85.3144 6.37333 85.0798 6.608C84.8451 6.832 84.5571 6.944 84.2158 6.944C83.8744 6.944 83.5864 6.832 83.3518 6.608ZM84.9678 8.16V16H83.4638V8.16H84.9678ZM87.2138 8.16H88.6858V9.488H88.9098C89.4004 8.51733 90.2804 8.032 91.5498 8.032C92.4244 8.032 93.1498 8.31467 93.7258 8.88C94.3124 9.44533 94.6058 10.2453 94.6058 11.28V16H93.1018V11.408C93.1018 10.736 92.9258 10.224 92.5738 9.872C92.2324 9.52 91.7364 9.344 91.0858 9.344C90.3498 9.344 89.7684 9.568 89.3418 10.016C88.9258 10.464 88.7178 11.0933 88.7178 11.904V16H87.2138V8.16ZM102.825 8.16H104.297V15.76C104.297 16.8267 103.945 17.7013 103.241 18.384C102.537 19.0773 101.604 19.424 100.441 19.424C98.7023 19.424 97.3423 18.6987 96.361 17.248L97.705 16.464C98.2703 17.5413 99.1503 18.08 100.345 18.08C101.092 18.08 101.684 17.8773 102.121 17.472C102.569 17.0667 102.793 16.4693 102.793 15.68V14.576H102.601C102.014 15.5467 101.118 16.032 99.913 16.032C98.8677 16.032 97.993 15.6533 97.289 14.896C96.585 14.1387 96.233 13.168 96.233 11.984C96.233 10.8 96.585 9.82933 97.289 9.072C97.993 8.31467 98.8677 7.936 99.913 7.936C101.118 7.936 102.014 8.42133 102.601 9.392H102.825V8.16ZM98.441 13.984C98.9103 14.4533 99.529 14.688 100.297 14.688C101.065 14.688 101.673 14.448 102.121 13.968C102.569 13.488 102.793 12.8267 102.793 11.984C102.793 11.1413 102.569 10.48 102.121 10C101.673 9.52 101.065 9.28 100.297 9.28C99.529 9.28 98.9103 9.52 98.441 10C97.9717 10.4693 97.737 11.1307 97.737 11.984C97.737 12.8373 97.9717 13.504 98.441 13.984Z"
                        fill="black"
                        className="staking-text"
                    />
                    <path
                        d="M42.5043 11.5L42.5051 11.0195C42.5073 7.35292 42.5094 4.45673 41.1221 2.59485C40.6286 1.93942 39.9863 1.40111 39.2435 1.02153C38.1645 0.438055 37.1089 0.293418 36.1773 0.165731L36.1022 0.155845C35.2507 0.0457763 34.3926 -0.0064311 33.5339 0.000631479H8.9712C8.11243 -0.0064311 7.25438 0.0457777 6.4029 0.155843L6.32781 0.16573C5.39614 0.293416 4.34053 0.438053 3.2616 1.02152C2.51874 1.40111 1.87626 1.93941 1.38308 2.59485C-0.00443804 4.45673 -0.0024005 7.35292 0.000224995 11.0195L0.000443168 11.5L0.000224995 11.9805C-0.0024005 15.6471 -0.00443828 18.5433 1.38316 20.4051C1.87626 21.0606 2.51873 21.5989 3.26159 21.9785C4.34053 22.5619 5.39614 22.7066 6.32781 22.8343L6.40289 22.8442C7.25438 22.9542 8.11243 23.0064 8.9712 22.9994H33.5339C34.3926 23.0064 35.2507 22.9542 36.1022 22.8442L36.1773 22.8343C37.1089 22.7066 38.1645 22.5619 39.2435 21.9785C39.9863 21.5989 40.6286 21.0606 41.1221 20.4051C42.5094 18.5433 42.5073 15.6471 42.5051 11.9805L42.5043 11.5Z"
                        fill={`url(#paint1_linear_${selected ? 'active' : 'inactive'})`}
                    />
                    <path
                        d="M13.7507 7.28784V11.8235C13.7507 13.4932 12.2142 14.8471 10.3203 14.8471C9.05694 14.8471 8.03306 13.7189 8.03306 12.3272V7.28784H6.00001V12.3143C5.9982 13.4485 6.44943 14.5372 7.255 15.3424C8.06058 16.1476 9.15495 16.6037 10.2988 16.611C11.1434 16.6165 11.9798 16.4456 12.7534 16.1095C13.1874 15.9173 13.5388 15.5791 13.7455 15.1546V16.3553H13.7507V16.3592H15.7837V7.28784H13.7507Z"
                        fill="white"
                    />
                    <path
                        d="M33.967 4.26562V4.26598H33.9643V8.49802C33.7198 8.07839 33.3453 7.74822 32.8964 7.55667C32.1552 7.22161 31.3513 7.04457 30.5368 7.03699C27.5199 7.03699 25.074 9.17991 25.074 11.8238C25.074 14.4673 27.0077 16.6106 29.3936 16.6106C29.9609 16.6106 30.5227 16.4998 31.0468 16.2846C31.5709 16.0694 32.0471 15.7539 32.4482 15.3561C32.8493 14.9584 33.1675 14.4862 33.3846 13.9665C33.6016 13.4469 33.7133 12.8899 33.7133 12.3274H31.6803C31.6803 13.7189 30.6566 14.847 29.3936 14.847C28.1305 14.847 27.1067 13.4933 27.1067 11.8238C27.1067 10.1543 28.6429 8.80062 30.5368 8.80062C32.4313 8.80062 33.9672 10.1543 33.9672 11.8238V16.3588H36V4.26562H33.967Z"
                        fill="white"
                    />
                    <path
                        d="M16.6557 8.26501V9.06779H22.1722L16.6557 14.506V16.324H25.035V14.506H24.531V14.5059H19.7003L20.0018 14.162C20.0216 14.1414 20.0411 14.1206 20.06 14.0991L20.6051 13.4814L25.035 8.98384V7.29077H16.6557V8.26501Z"
                        fill="white"
                    />
                    <defs>
                        <linearGradient
                            id="paint0_linear_0_1"
                            x1="6"
                            y1="21"
                            x2="30.7908"
                            y2="-5.6943"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop />
                            <stop offset="1" stopColor="#FF6102" />
                        </linearGradient>
                    </defs>
                </svg>
            );
            break;
        case 'USD':
            icon = (
                <svg
                    width="116"
                    height="23"
                    viewBox="0 0 116 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="staking-icon"
                >
                    <path
                        d="M50.744 15.056C49.9867 14.2773 49.608 13.2853 49.608 12.08C49.608 10.8747 49.9867 9.88267 50.744 9.104C51.512 8.32533 52.4773 7.936 53.64 7.936C54.8027 7.936 55.7627 8.32533 56.52 9.104C57.288 9.88267 57.672 10.8747 57.672 12.08C57.672 13.2853 57.288 14.2773 56.52 15.056C55.7627 15.8347 54.8027 16.224 53.64 16.224C52.4773 16.224 51.512 15.8347 50.744 15.056ZM51.8 10.064C51.3413 10.5547 51.112 11.2267 51.112 12.08C51.112 12.9333 51.3413 13.6107 51.8 14.112C52.2693 14.6027 52.8827 14.848 53.64 14.848C54.3973 14.848 55.0053 14.6027 55.464 14.112C55.9333 13.6107 56.168 12.9333 56.168 12.08C56.168 11.2267 55.9333 10.5547 55.464 10.064C55.0053 9.56267 54.3973 9.312 53.64 9.312C52.8827 9.312 52.2693 9.56267 51.8 10.064ZM59.4013 8.16H60.8733V9.184H61.0973C61.5559 8.416 62.2706 8.032 63.2413 8.032C64.2226 8.032 64.9479 8.46933 65.4173 9.344H65.6413C66.0679 8.46933 66.8253 8.032 67.9133 8.032C68.6386 8.032 69.2626 8.272 69.7853 8.752C70.3079 9.232 70.5693 9.86133 70.5693 10.64V16H69.0653V10.736C69.0653 10.288 68.9159 9.94133 68.6173 9.696C68.3186 9.44 67.9293 9.312 67.4493 9.312C66.9373 9.312 66.5213 9.46667 66.2013 9.776C65.8919 10.0853 65.7373 10.528 65.7373 11.104V16H64.2333V10.736C64.2333 10.288 64.0946 9.94133 63.8173 9.696C63.5399 9.44 63.1666 9.312 62.6973 9.312C62.1746 9.312 61.7426 9.46667 61.4013 9.776C61.0706 10.0853 60.9053 10.528 60.9053 11.104V16H59.4013V8.16ZM72.7138 8.16H74.1858V9.488H74.4098C74.9004 8.51733 75.7804 8.032 77.0498 8.032C77.9244 8.032 78.6498 8.31467 79.2258 8.88C79.8124 9.44533 80.1058 10.2453 80.1058 11.28V16H78.6018V11.408C78.6018 10.736 78.4258 10.224 78.0738 9.872C77.7324 9.52 77.2364 9.344 76.5858 9.344C75.8498 9.344 75.2684 9.568 74.8418 10.016C74.4258 10.464 74.2178 11.0933 74.2178 11.904V16H72.7138V8.16ZM82.133 6.608C81.8983 6.37333 81.781 6.09067 81.781 5.76C81.781 5.42933 81.8983 5.152 82.133 4.928C82.3677 4.69333 82.6557 4.576 82.997 4.576C83.3383 4.576 83.6263 4.69333 83.861 4.928C84.0957 5.152 84.213 5.42933 84.213 5.76C84.213 6.09067 84.0957 6.37333 83.861 6.608C83.6263 6.832 83.3383 6.944 82.997 6.944C82.6557 6.944 82.3677 6.832 82.133 6.608ZM83.749 8.16V16H82.245V8.16H83.749ZM85.995 19.2V8.16H87.467V9.392H87.691C88.2777 8.42133 89.1737 7.936 90.379 7.936C91.4243 7.936 92.299 8.32533 93.003 9.104C93.707 9.88267 94.059 10.8747 94.059 12.08C94.059 13.2853 93.707 14.2773 93.003 15.056C92.299 15.8347 91.4243 16.224 90.379 16.224C89.1737 16.224 88.2777 15.7387 87.691 14.768H87.499V19.2H85.995ZM88.171 14.128C88.619 14.6293 89.227 14.88 89.995 14.88C90.763 14.88 91.3817 14.6347 91.851 14.144C92.3203 13.6427 92.555 12.9547 92.555 12.08C92.555 11.2053 92.3203 10.5227 91.851 10.032C91.3817 9.53067 90.763 9.28 89.995 9.28C89.227 9.28 88.619 9.53067 88.171 10.032C87.723 10.5333 87.499 11.216 87.499 12.08C87.499 12.944 87.723 13.6267 88.171 14.128ZM96.4159 15.056C95.6585 14.2773 95.2799 13.2853 95.2799 12.08C95.2799 10.8747 95.6585 9.88267 96.4159 9.104C97.1839 8.32533 98.1492 7.936 99.3119 7.936C100.475 7.936 101.435 8.32533 102.192 9.104C102.96 9.88267 103.344 10.8747 103.344 12.08C103.344 13.2853 102.96 14.2773 102.192 15.056C101.435 15.8347 100.475 16.224 99.3119 16.224C98.1492 16.224 97.1839 15.8347 96.4159 15.056ZM97.4719 10.064C97.0132 10.5547 96.7839 11.2267 96.7839 12.08C96.7839 12.9333 97.0132 13.6107 97.4719 14.112C97.9412 14.6027 98.5545 14.848 99.3119 14.848C100.069 14.848 100.677 14.6027 101.136 14.112C101.605 13.6107 101.84 12.9333 101.84 12.08C101.84 11.2267 101.605 10.5547 101.136 10.064C100.677 9.56267 100.069 9.312 99.3119 9.312C98.5545 9.312 97.9412 9.56267 97.4719 10.064ZM105.697 15.056C104.94 14.2773 104.561 13.2853 104.561 12.08C104.561 10.8747 104.94 9.88267 105.697 9.104C106.465 8.32533 107.43 7.936 108.593 7.936C109.756 7.936 110.716 8.32533 111.473 9.104C112.241 9.88267 112.625 10.8747 112.625 12.08C112.625 13.2853 112.241 14.2773 111.473 15.056C110.716 15.8347 109.756 16.224 108.593 16.224C107.43 16.224 106.465 15.8347 105.697 15.056ZM106.753 10.064C106.294 10.5547 106.065 11.2267 106.065 12.08C106.065 12.9333 106.294 13.6107 106.753 14.112C107.222 14.6027 107.836 14.848 108.593 14.848C109.35 14.848 109.958 14.6027 110.417 14.112C110.886 13.6107 111.121 12.9333 111.121 12.08C111.121 11.2267 110.886 10.5547 110.417 10.064C109.958 9.56267 109.35 9.312 108.593 9.312C107.836 9.312 107.222 9.56267 106.753 10.064ZM115.858 4.8V16H114.354V4.8H115.858Z"
                        fill="black"
                        className="staking-text"
                    />
                    <path
                        d="M43.2179 11.5L43.2186 11.0195C43.2207 7.35292 43.2229 4.45673 41.8468 2.59485C41.3572 1.93942 40.7202 1.40111 39.9833 1.02153C38.9131 0.438055 37.866 0.293418 36.9418 0.165731L36.8674 0.155845C36.0227 0.0457763 35.1716 -0.0064311 34.3198 0.000631479H8.89881C8.04697 -0.0064311 7.19585 0.0457777 6.35123 0.155843L6.27676 0.16573C5.3526 0.293416 4.30551 0.438053 3.23528 1.02152C2.49841 1.40111 1.86112 1.93941 1.37192 2.59485C-0.0044024 4.45673 -0.00238113 7.35292 0.00022318 11.0195L0.000439593 11.5L0.00022318 11.9805C-0.00238113 15.6471 -0.0044024 18.5433 1.372 20.4051C1.86112 21.0606 2.49841 21.5989 3.23528 21.9785C4.30551 22.5619 5.3526 22.7066 6.27675 22.8343L6.35123 22.8442C7.19585 22.9542 8.04697 23.0064 8.89881 22.9994H34.3198C35.1716 23.0064 36.0227 22.9542 36.8674 22.8442L36.9418 22.8343C37.866 22.7066 38.9131 22.5619 39.9833 21.9785C40.7202 21.5989 41.3572 21.0606 41.8468 20.4051C43.2229 18.5433 43.2207 15.6471 43.2186 11.9805L43.2179 11.5Z"
                        fill="url(#usd)"
                    />
                    <path
                        d="M23.8213 12.1853C23.0249 11.6814 21.9431 11.6142 20.7194 11.3692C19.526 11.1307 18.516 10.9307 18.516 10.3901C18.516 9.84952 19.5026 9.41084 20.7194 9.41084C21.9361 9.41084 22.9224 9.84952 22.9224 10.3901H24.8808C24.8808 8.90309 23.0177 7.69727 20.7194 7.69727C18.4208 7.69727 16.5577 8.90309 16.5577 10.3901C16.5577 11.0794 16.9585 11.7088 17.6171 12.1853C18.3791 12.7362 19.5101 12.8411 20.7194 13.083C21.9431 13.3278 23.1672 13.5764 23.1672 14.1843C23.1672 14.7925 22.0712 15.2862 20.7194 15.2862C19.3673 15.2862 18.2712 14.7925 18.2712 14.1843C18.2712 14.1431 18.2765 14.1026 18.2863 14.0621H16.3175C16.3142 14.1026 16.3129 14.1431 16.3129 14.1843C16.3129 15.7391 18.2856 16.9998 20.7194 16.9998C23.153 16.9998 25.1256 15.7391 25.1256 14.1843C25.1256 13.4027 24.6269 12.6951 23.8213 12.1853Z"
                        fill="white"
                    />
                    <path
                        d="M13.534 12.3464C13.534 13.9694 12.0405 15.2855 10.1995 15.2855C8.97149 15.2855 7.97621 14.1888 7.97621 12.836V7.9375H6.00001V12.8235C5.99826 13.9259 6.43687 14.9842 7.21991 15.7669C8.00299 16.5495 9.06675 16.9929 10.1786 17.0001C10.9996 17.0054 11.8126 16.8393 12.5646 16.5126C12.9803 16.3115 13.3278 16.019 13.529 15.5844V16.7514H13.534V16.7553H15.5102V7.9375H13.534V12.3464Z"
                        fill="white"
                    />
                    <path
                        d="M34.1421 5V5.00035H34.1396V9.11409C33.9019 8.70618 33.5378 8.38525 33.1016 8.19905C32.381 7.87336 31.5997 7.70126 30.8079 7.69389C27.8753 7.69389 25.4977 9.77691 25.4977 12.3469C25.4977 14.9165 27.3774 16.9999 29.6965 16.9999C30.2481 16.9999 30.7941 16.8922 31.3036 16.683C31.8132 16.4738 32.2761 16.1671 32.6658 15.7805C33.0558 15.3939 33.3648 14.9349 33.5758 14.4297C33.7869 13.9246 33.8954 13.3832 33.8954 12.8364H31.9193C31.9193 14.189 30.9241 15.2856 29.6965 15.2856C28.4688 15.2856 27.4737 13.9697 27.4737 12.3469C27.4737 10.7241 28.9669 9.40821 30.8079 9.40821C32.6496 9.40821 34.1425 10.7241 34.1425 12.3469V16.7551H36.1182V5H34.1421Z"
                        fill="white"
                    />
                    <defs>
                        <linearGradient
                            id="usd"
                            x1="5.39062"
                            y1="20.4844"
                            x2="21.2031"
                            y2="2.54988e-06"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#FE9604" />
                            <stop offset="1" stopColor="#FE9F04" />
                        </linearGradient>
                    </defs>
                </svg>
            );
            break;
        case 'ZETH':
            icon = (
                <svg
                    width="105"
                    height="23"
                    viewBox="0 0 105 23"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="staking-icon"
                >
                    <path
                        d="M49.96 10.256C49.96 9.54133 50.248 8.976 50.824 8.56C51.4 8.144 52.1093 7.936 52.952 7.936C53.7307 7.936 54.4133 8.096 55 8.416C55.5973 8.72533 56.2107 9.232 56.84 9.936L55.72 10.736C54.92 9.70133 54.008 9.184 52.984 9.184C52.536 9.184 52.168 9.28 51.88 9.472C51.592 9.65333 51.448 9.90933 51.448 10.24C51.448 10.4213 51.4853 10.5707 51.56 10.688C51.6347 10.8053 51.768 10.9013 51.96 10.976C52.1627 11.04 52.3173 11.088 52.424 11.12C52.5413 11.1413 52.7547 11.1733 53.064 11.216L53.72 11.312C54.7547 11.4613 55.5387 11.7013 56.072 12.032C56.616 12.352 56.888 12.8853 56.888 13.632C56.888 14.4107 56.5627 15.04 55.912 15.52C55.272 15.9893 54.4453 16.224 53.432 16.224C52.4187 16.224 51.576 15.9893 50.904 15.52C50.232 15.04 49.7147 14.4533 49.352 13.76L50.696 13.04C50.9413 13.6373 51.3093 14.1067 51.8 14.448C52.2907 14.7787 52.8507 14.944 53.48 14.944C54.0453 14.944 54.504 14.832 54.856 14.608C55.2187 14.3733 55.4 14.064 55.4 13.68C55.4 13.5947 55.3893 13.5147 55.368 13.44C55.3467 13.3653 55.3093 13.3013 55.256 13.248C55.2027 13.184 55.1547 13.1307 55.112 13.088C55.0693 13.0453 55 13.008 54.904 12.976C54.808 12.9333 54.728 12.9013 54.664 12.88C54.6107 12.8587 54.52 12.8373 54.392 12.816C54.264 12.784 54.1733 12.7627 54.12 12.752C54.0667 12.7413 53.9653 12.7307 53.816 12.72C53.6773 12.6987 53.5867 12.6827 53.544 12.672L52.888 12.576C51.9387 12.4373 51.2133 12.192 50.712 11.84C50.2107 11.488 49.96 10.96 49.96 10.256ZM57.6615 8.16H59.8375V5.44H61.3415V8.16H63.6455V9.472H61.3415V14.24C61.3415 14.5387 61.4802 14.688 61.7575 14.688H63.1975V16H61.1495C60.7655 16 60.4508 15.8773 60.2055 15.632C59.9602 15.376 59.8375 15.0507 59.8375 14.656V9.472H57.6615V8.16ZM64.9578 10.224C65.2671 9.56267 65.7364 9.01867 66.3658 8.592C67.0058 8.15467 67.7791 7.936 68.6858 7.936C69.7418 7.936 70.5844 8.21867 71.2138 8.784C71.8431 9.34933 72.1578 10.1067 72.1578 11.056V16H70.6858V14.768H70.4618C70.2698 15.184 69.9444 15.5307 69.4858 15.808C69.0271 16.0853 68.4298 16.224 67.6938 16.224C66.8191 16.224 66.1151 16.0053 65.5818 15.568C65.0591 15.1307 64.7978 14.56 64.7978 13.856C64.7978 12.4587 65.7951 11.664 67.7898 11.472L70.6858 11.2V10.992C70.6858 10.4587 70.5044 10.0427 70.1418 9.744C69.7898 9.43467 69.2938 9.28 68.6538 9.28C67.4698 9.28 66.6698 9.792 66.2538 10.816L64.9578 10.224ZM66.3178 13.792C66.3178 14.1653 66.4618 14.4587 66.7498 14.672C67.0378 14.8747 67.4378 14.976 67.9498 14.976C68.8351 14.976 69.5124 14.7467 69.9818 14.288C70.4511 13.8187 70.6858 13.2267 70.6858 12.512V12.384L67.9498 12.64C66.8618 12.736 66.3178 13.12 66.3178 13.792ZM82.1155 8.16L78.5155 11.184L82.0515 16H80.2435L77.4275 12.112L75.8115 13.456V16H74.3075V4.8H75.8115V11.472H76.0035L79.9075 8.16H82.1155ZM83.3518 6.608C83.1171 6.37333 82.9998 6.09067 82.9998 5.76C82.9998 5.42933 83.1171 5.152 83.3518 4.928C83.5864 4.69333 83.8744 4.576 84.2158 4.576C84.5571 4.576 84.8451 4.69333 85.0798 4.928C85.3144 5.152 85.4318 5.42933 85.4318 5.76C85.4318 6.09067 85.3144 6.37333 85.0798 6.608C84.8451 6.832 84.5571 6.944 84.2158 6.944C83.8744 6.944 83.5864 6.832 83.3518 6.608ZM84.9678 8.16V16H83.4638V8.16H84.9678ZM87.2138 8.16H88.6858V9.488H88.9098C89.4004 8.51733 90.2804 8.032 91.5498 8.032C92.4244 8.032 93.1498 8.31467 93.7258 8.88C94.3124 9.44533 94.6058 10.2453 94.6058 11.28V16H93.1018V11.408C93.1018 10.736 92.9258 10.224 92.5738 9.872C92.2324 9.52 91.7364 9.344 91.0858 9.344C90.3498 9.344 89.7684 9.568 89.3418 10.016C88.9258 10.464 88.7178 11.0933 88.7178 11.904V16H87.2138V8.16ZM102.825 8.16H104.297V15.76C104.297 16.8267 103.945 17.7013 103.241 18.384C102.537 19.0773 101.604 19.424 100.441 19.424C98.7023 19.424 97.3423 18.6987 96.361 17.248L97.705 16.464C98.2703 17.5413 99.1503 18.08 100.345 18.08C101.092 18.08 101.684 17.8773 102.121 17.472C102.569 17.0667 102.793 16.4693 102.793 15.68V14.576H102.601C102.014 15.5467 101.118 16.032 99.913 16.032C98.8677 16.032 97.993 15.6533 97.289 14.896C96.585 14.1387 96.233 13.168 96.233 11.984C96.233 10.8 96.585 9.82933 97.289 9.072C97.993 8.31467 98.8677 7.936 99.913 7.936C101.118 7.936 102.014 8.42133 102.601 9.392H102.825V8.16ZM98.441 13.984C98.9103 14.4533 99.529 14.688 100.297 14.688C101.065 14.688 101.673 14.448 102.121 13.968C102.569 13.488 102.793 12.8267 102.793 11.984C102.793 11.1413 102.569 10.48 102.121 10C101.673 9.52 101.065 9.28 100.297 9.28C99.529 9.28 98.9103 9.52 98.441 10C97.9717 10.4693 97.737 11.1307 97.737 11.984C97.737 12.8373 97.9717 13.504 98.441 13.984Z"
                        fill="black"
                        className="staking-text"
                    />
                    <path
                        d="M42.5043 11.5L42.5051 11.0195C42.5073 7.35292 42.5094 4.45673 41.1221 2.59485C40.6286 1.93942 39.9863 1.40111 39.2435 1.02153C38.1645 0.438055 37.1089 0.293418 36.1773 0.165731L36.1022 0.155845C35.2507 0.0457763 34.3926 -0.0064311 33.5339 0.000631479H8.9712C8.11243 -0.0064311 7.25438 0.0457777 6.4029 0.155843L6.32781 0.16573C5.39614 0.293416 4.34053 0.438053 3.2616 1.02152C2.51874 1.40111 1.87626 1.93941 1.38308 2.59485C-0.00443804 4.45673 -0.0024005 7.35292 0.000224995 11.0195L0.000443168 11.5L0.000224995 11.9805C-0.0024005 15.6471 -0.00443828 18.5433 1.38316 20.4051C1.87626 21.0606 2.51873 21.5989 3.26159 21.9785C4.34053 22.5619 5.39614 22.7066 6.32781 22.8343L6.40289 22.8442C7.25438 22.9542 8.11243 23.0064 8.9712 22.9994H33.5339C34.3926 23.0064 35.2507 22.9542 36.1022 22.8442L36.1773 22.8343C37.1089 22.7066 38.1645 22.5619 39.2435 21.9785C39.9863 21.5989 40.6286 21.0606 41.1221 20.4051C42.5094 18.5433 42.5073 15.6471 42.5051 11.9805L42.5043 11.5Z"
                        fill={`url(#paint1_linear_${selected ? 'active' : 'inactive'})`}
                    />
                    <path
                        d="M6 6.54921V7.1973H12.0398L7.62409 11.5877V13.0553H15.9553V11.5877H15.552V11.5875H10.0611L10.3025 11.3099C10.3183 11.2933 10.3339 11.2765 10.3491 11.2591L10.7854 10.7605L14.3313 7.12951V5.7627H6V6.54921Z"
                        fill="url(#paint1_linear_0_2)"
                    />
                    <path
                        d="M26.8359 14.5501V13.1584L26.8609 9.43691H28.8096V7.94259H26.8709L26.8905 5.01686H26.8359V5.00732H24.8784V7.94259H24.3895V7.94347H24.3891V9.41163H24.3895V9.43691H24.8784V14.5501C24.8784 15.9015 26.1933 16.9971 27.8147 16.9971H29.0382V15.2843H27.8147C27.2745 15.2843 26.8359 14.9553 26.8359 14.5501Z"
                        fill="white"
                    />
                    <path
                        d="M35.2468 7.76292C34.3818 7.76003 33.5297 7.91429 32.8409 8.25877C32.5564 8.38495 32.1055 8.76188 31.8839 9.17458V5H29.8611V17H31.8839V12.1659C32.069 10.6705 33.495 9.50673 35.2261 9.50673C36.4644 9.50673 37.4681 10.6221 37.4681 11.998V16.9803H39.4611V12.0111C39.4611 9.67831 37.5797 7.77081 35.2468 7.76292Z"
                        fill="white"
                    />
                    <path
                        d="M18.7352 7.70068C15.8291 7.70068 13.4734 9.78242 13.4734 12.3503C13.4734 14.9183 15.8291 17 18.7352 17C20.8495 17 22.6722 15.8977 23.508 14.3081H21.1973C20.5924 14.9091 19.7133 15.287 18.7352 15.287C17.1957 15.287 15.9023 14.3512 15.5348 13.0846H23.931C23.974 12.8457 23.9961 12.6003 23.9961 12.3503C23.9961 12.1003 23.974 11.8551 23.931 11.6163C23.5329 9.39673 21.3579 7.70068 18.7352 7.70068ZM18.7352 9.41369C20.2649 9.41369 21.5518 10.3388 21.9278 11.5942H15.6093C15.6093 11.4424 15.6895 11.2222 15.7807 11.0365C16.3235 10.0744 17.4421 9.41369 18.7352 9.41369Z"
                        fill="white"
                    />
                    <defs>
                        <linearGradient
                            id="paint1_linear_active"
                            x1="6"
                            y1="21"
                            x2="30.7908"
                            y2="-5.6943"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop />
                            <stop offset="1" stopColor="#FF6102" />
                        </linearGradient>
                        <linearGradient
                            id="paint1_linear_inactive"
                            x1="5.39062"
                            y1="20.4844"
                            x2="21.2031"
                            y2="-1.14914e-06"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#575757" />
                            <stop offset="1" stopColor="#878787" />
                        </linearGradient>
                        <linearGradient
                            id="paint0_linear_0_3"
                            x1="5.39062"
                            y1="20.4844"
                            x2="21.2031"
                            y2="-1.14914e-06"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#575757" />
                            <stop offset="1" stopColor="#878787" />
                        </linearGradient>
                        <linearGradient
                            id="paint1_linear_0_2"
                            x1="6.46252"
                            y1="6.36983"
                            x2="15.2139"
                            y2="12.2604"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="white" />
                            <stop offset="0.48479" stopColor="#FDFDFD" stopOpacity="0.99393" />
                            <stop offset="0.65189" stopColor="#FCFCFC" stopOpacity="0.98669" />
                            <stop offset="0.87254" stopColor="#595959" stopOpacity="0.41453" />
                            <stop offset="1" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
            );
            break;
    }

    return icon;
}

export const StakingSummary: React.FC<StakingSummaryProps & React.HTMLProps<HTMLDivElement>> = ({
    className,
    baseApy,
    deposit,
    tvl,
    selected,
    logo,
    onSelect,
}) => {
    return (
        <div
            className={`StakingSummary ${className} ${selected ? 'StakingSummary__Selected' : ''}`}
            onClick={() => {
                if (onSelect) {
                    onSelect(logo);
                }
            }}
        >
            <div className="d-flex justify-content-between">
                {logoNameToSvg(logo, selected)}
                <button
                    className={`btn-secondary ${selected ? 'disabled' : ''}`}
                    onClick={() => {
                        if (onSelect) {
                            onSelect(logo);
                        }
                    }}
                >
                    {selected ? 'Selected' : 'Select'}
                </button>
            </div>
            <div className="d-flex values">
                <div className="block flex-fill">
                    <div className="title">Base APY</div>
                    <div className="value vela-sans">{`${baseApy}%`}</div>
                </div>
                <div className="block flex-fill">
                    <div className="title">My deposit</div>
                    <div className="value vela-sans">{`${deposit}`}</div>
                </div>
                <div className="block flex-fill">
                    <div className="title">TVL</div>
                    <div className="value vela-sans">{tvl}</div>
                </div>
            </div>
        </div>
    );
};
