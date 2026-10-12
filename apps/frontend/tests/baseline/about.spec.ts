import { gateSpec } from './compare';

gateSpec({
  log: 'ABOUT_ACCEPTANCE.md',
  keys: /^about-(?:vi|en)$/,
});
