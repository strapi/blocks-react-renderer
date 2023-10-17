/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};

export default config;
