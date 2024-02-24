import { useEffect, useState } from 'react';
import { log } from '../utils/logger';

const usePausedContract = (): boolean => {
    const [paused, setPaused] = useState(false);

    return paused;
};

export default usePausedContract;
