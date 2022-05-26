module.export = {
    roots: ['<rootDir>/src'],
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-syntax-jsx'],
    testMatch: ['<rootDir>/tests/**/>(*.).{js, jsx}'], // finds test
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['/node_modules/', '/public/'],
    setupFilesAfterEnv: [
        '@testing-library/jest-dom/extend-expect',
        '@testing-library/react/cleanup-after-each',
    ],
    moduleNameMapper: {
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'identity-obj-proxy',
    },
};
