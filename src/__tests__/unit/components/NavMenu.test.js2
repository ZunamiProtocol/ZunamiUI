import { render } from '@testing-library/react';
import { NavMenu } from '../../../components/Header/NavMenu/NavMenu';

beforeEach(() => {
    //     jest.mock('react-router-dom', () => ({
    //         ...jest.requireActual('react-router-dom'),
    //         useHistory: () => ({
    //             push: jest.fn(),
    //             location: {
    //                 pathname: '/',
    //             },
    //         }),
    //     }));
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { assign: jest.fn() },
    });

    Object.defineProperty(window, 'history', {
        location: {
            pathname: '/',
        },
    });
});

describe('<NavMenu>', () => {
    it('Should render with default text', () => {
        const { getByTestId } = render(<NavMenu data-testid="test-nav-menu" />);
        const component = getByTestId('test-nav-menu');
        expect(component.children[1].innerHTML).toBe('Please, wait...');
    });
});
