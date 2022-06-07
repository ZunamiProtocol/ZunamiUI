import { render } from '@testing-library/react';
import { DirectAction } from '../../../components/Form/DirectAction/DirectAction';

describe('<DirectAction>', () => {
    it('Should render with default state', () => {
        const { getByTestId } = render(<DirectAction data-testid="test-d-action" />);
        const component = getByTestId('test-d-action');
        expect(component.classList.contains('disabled')).toBe(false);
        expect(component.children[0].checked).toBe(false);
    });

    it('Should render with checked state', () => {
        const { getByTestId } = render(<DirectAction data-testid="test-d-action" checked />);
        const component = getByTestId('test-d-action');
        expect(component.classList.contains('disabled')).toBe(false);
        expect(component.children[0].checked).toBe(true);
    });

    it('Should render with checked disabled', () => {
        const { getByTestId } = render(<DirectAction data-testid="test-d-action" disabled />);
        const component = getByTestId('test-d-action');
        expect(component.classList.contains('disabled')).toBe(true);
    });
});
