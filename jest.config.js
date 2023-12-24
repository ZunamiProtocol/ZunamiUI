module.export = {
    roots: ['<rootDir>/src'],
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react',
        '@babel/preset-flow',
        '@babel/preset-typescript',
    ],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-jsx',
        'syntax-dynamic-import',
        'transform-runtime',
    ],
    testMatch: ['<rootDir>/tests/**/>(*.).{js, jsx}'], // finds test
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['/node_modules/', '/public/'],
    setupFilesAfterEnv: [
        '@testing-library/jest-dom/extend-expect',
        '@testing-library/react/cleanup-after-each',
    ],
    moduleDirectories: ['node_modules', 'bower_components', 'shared'],
    moduleNameMapper: {
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'identity-obj-proxy',
        '\\.(css|less)$': 'identity-obj-proxy',
    },
};
