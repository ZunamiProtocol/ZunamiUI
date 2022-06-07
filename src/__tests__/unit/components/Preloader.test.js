import { render } from '@testing-library/react';
import { Preloader } from '../../../components/Preloader/Preloader';

describe('<Preloader>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(<Preloader data-testid="test-preloader" />);
        const component = getByTestId('test-preloader');
        expect(component.children[1].innerHTML).toBe('Please, wait...');
    });

    it('Should render without text', () => {
        const { getByTestId } = render(<Preloader data-testid="test-preloader" onlyIcon />);
        const component = getByTestId('test-preloader');
        expect(component.children.length).toBe(1);
    });
});
