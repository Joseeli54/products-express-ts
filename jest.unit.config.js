module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleDirectories: ['node_modules', 'src'],
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: 'test.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    },
    testTimeout: 20000,
    silent: true,
    detectOpenHandles: true
}