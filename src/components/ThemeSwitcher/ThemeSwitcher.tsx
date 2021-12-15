import React, {useState} from 'react';
import './ThemeSwitcher.scss';
import { getTheme, setTheme as saveTheme } from '../../functions/theme';

export const ThemeSwitcher = (): JSX.Element => {
    const [theme, setTheme] = useState(getTheme);

    return (
        <div
            className={'ThemeSwitcher'}
        >
            <span className={'ThemeSwitcher__title'}>Interface settings</span>
            <div
                className={'ThemeSwitcher__button'}
                onClick={async (e) => {
                    const value = theme === 'dark' ? 'default' : 'dark';

                    setTheme(value);
                    saveTheme(value);

                    const logo = document.querySelector('nav .Logo');
                    const logoName = `/logo${theme !== 'dark' ? '-dark' : ''}.svg`;

                    document.body.classList.toggle('dark');

                    if (logo) {
                        logo.setAttribute('src', logoName);
                    }
                }}
            >
                <img src={`${theme === 'default' ? 'theme-dark' : 'theme-light'}.svg`} alt='' />
                <span>{theme === 'default' ? 'Dark' : 'Light'} mode</span>
            </div>
        </div>
    );
};
