import { is1024, is1440, is1920 } from '../../../functions/screen';

describe('SCreen', () => {
    it('Check screen sizes', () => {
        expect(is1024()).toEqual(false);
        expect(is1440()).toEqual(false);
        expect(is1920()).toEqual(false);
    });
});
