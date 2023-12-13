import { defineConfig } from '@strapi/pack-up';
import preserveDirectives from 'rollup-plugin-preserve-directives';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  preserveModules: true,
  plugins: [preserveDirectives()],
});
