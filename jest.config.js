/** @type {import('jest').Config} */
export default {
    testEnvironment: 'jsdom',
    testMatch: ['**/test/**/*.test.[jt]s'],
    transform: {
        '^.+\\.[jt]sx?$': ['@swc/jest', {
            jsc: {
                parser: {
                    syntax: 'typescript',
                    tsx: false,
                    decorators: false,
                },
                target: 'es2020',
            },
        }],
    },
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/test/__mocks__/styleMock.js',
    },
    extensionsToTreatAsEsm: ['.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
};
