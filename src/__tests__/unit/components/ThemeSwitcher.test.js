import { render, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '../../../components/ThemeSwitcher/ThemeSwitcher';

describe('<ThemeSwitcher>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(<ThemeSwitcher data-testid="test-theme-switcher" />);
        const component = getByTestId('test-theme-switcher');
        expect(component.children[0].innerHTML).toBe('Dark theme');
    });

    it('Should react to theme change', () => {
        const { getByTestId } = render(<ThemeSwitcher data-testid="test-theme-switcher" />);
        const component = getByTestId('test-theme-switcher');
        expect(component.children[0].innerHTML).toBe('Dark theme');

        fireEvent(
            component,
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
            })
        );

        expect(component.children[0].innerHTML).toBe('Light theme');
    });
});
