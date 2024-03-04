module.exports = {
    'collectCoverage': true,
    'collectCoverageFrom': ['src/**/*', '!src/tests/**/*'],
    'coverageDirectory': 'coverage',
    'roots': [
        '<rootDir>/src/tests'
    ],
    'transform': {
        '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
    },
    'testRegex': '.*(test|spec)\\.(t|j)sx?$',
    'moduleFileExtensions': [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ]
}