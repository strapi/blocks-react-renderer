/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};

// eslint-disable-next-line import/no-default-export
export default config;
