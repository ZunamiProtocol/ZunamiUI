import React, {useState} from 'react';
import './ThemeSwitcher.scss';

export const ThemeSwitcher = (): JSX.Element => {
    const [theme, setTheme] = useState(document.body.classList.contains('dark') ? 'dark' : 'light');

    return (
        <div
            className={'ThemeSwitcher'}
        >
            <span className={'ThemeSwitcher__title'}>Interface settings</span>
            <div
                className={'ThemeSwitcher__button'}
                onClick={async (e) => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    const logo = document.querySelector('nav .Logo');
                    const logoName = `/logo${theme !== 'dark' ? '-dark' : ''}.svg`;

                    document.body.classList.toggle('dark');

                    if (logo) {
                        logo.setAttribute('src', logoName);
                    }
                }}
            >
                <img src={`${theme === 'light' ? 'theme-dark' : 'theme-light'}.svg`} alt=""/>
                <span>{theme === 'light' ? 'Dark' : 'Light'} mode</span>
            </div>
        </div>
    );
};
