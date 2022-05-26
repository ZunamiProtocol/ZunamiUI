import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { InfoBlock } from '../../../src/components/InfoBlock/InfoBlock';

describe('<InfoBlock>', () => {
    it('Should render with default title and desc', () => {
        const { getByTestId } = render(
            <InfoBlock
                id="test-infoblock"
                title="Block title"
                description="Some desc"
                withColor={false}
                isStrategy={false}
            />
        );

        getByTestId('test-infoblock').children.length.should.equal(2);
        getByTestId('test-infoblock').children[0].children[0].innerHTML.should.equal('Block title');
        getByTestId('test-infoblock').children[1].children[0].innerHTML.should.equal('Some desc');
    });

    it('Should render with tooltip and icon', () => {
        const { getByTestId } = render(
            <InfoBlock
                id="test-infoblock"
                title="Block title"
                description="Some desc"
                hint={<div>Some tooltip text</div>}
                withColor={false}
                isStrategy={false}
            />
        );

        getByTestId('test-infoblock').children[0].length.should.equal(2);
        getByTestId('test-infoblock').children[0].children[1].children[0].tagName.should.equal(
            'img'
        );
    });
});
