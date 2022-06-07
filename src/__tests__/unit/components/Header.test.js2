import { render } from '@testing-library/react';
import { Header } from '../../../components/Header/Header';
import reactRouterDom from 'react-router-dom';

beforeEach(() => {
    jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useHistory: () => ({
            push: jest.fn(),
            location: {
                pathname: '/',
            },
        }),
    }));

    Object.defineProperty(window, 'location', {
        writable: true,
        value: { assign: jest.fn() },
    });

    Object.defineProperty(window, 'history', {
        location: {
            pathname: '/',
        },
    });

    // jest.mock('react-router-dom');

    // const pushMock = jest.fn();
    // reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock });
});

describe('<Header>', () => {
    it('Should render with default state', () => {
        delete window.location;
        window.location = new URL('https://www.example.com');
        const { getByTestId } = render(<Header data-testid="test-header" />);
        const component = getByTestId('test-header');
        const header = component.children[1];
        expect(header.children[3].classList.contains('WalletStatus')).toBe(true);
    });
});
