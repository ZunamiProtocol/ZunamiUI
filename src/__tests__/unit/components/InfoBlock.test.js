import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { InfoBlock } from '../../../components/InfoBlock/InfoBlock';
import 'chai';

describe('<InfoBlock>', () => {
    it('Should render with default title and desc', () => {
        const { getByTestId } = render(
            <InfoBlock
                data-testid="test-infoblock"
                title="Block title"
                description="Some desc"
                withColor={false}
                isStrategy={false}
            />
        );

        const component = getByTestId('test-infoblock');

        expect(component.children.length).toBe(2);
        expect(component.children[0].children[0].innerHTML).toBe('Block title');
        expect(component.children[1].children[0].innerHTML).toBe('Some desc');
    });

    it('Should render with tooltip and icon', () => {
        const { getByTestId } = render(
            <InfoBlock
                data-testid="test-infoblock"
                title="Block title"
                description="Some desc"
                hint={<div>Some tooltip text</div>}
                withColor={false}
                isStrategy={false}
            />
        );

        const component = getByTestId('test-infoblock');

        expect(component.children[0].children.length).toBe(2);
        expect(component.children[0].children[1].children[0].tagName).toBe('IMG');
    });
});
