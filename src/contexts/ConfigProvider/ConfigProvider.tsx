import React, { createContext, useState } from 'react';

interface ConfigContext {
    isForceEnabledForMobile?: any;
    forceEnable: () => void;
}

export const Context = createContext<ConfigContext>({
    isForceEnabledForMobile: false,
    forceEnable: () => {},
});

const ConfigProvider: React.FC = ({ children }) => {
    const [isForceEnabledForMobile, setForceEnabledForMobile] = useState<boolean>(false);
    const forceEnable = () => {
        setForceEnabledForMobile(true);
    };
    const contextValue = {
        isForceEnabledForMobile,
        forceEnable,
    };
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ConfigProvider;
