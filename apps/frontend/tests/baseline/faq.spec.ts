import { gateSpec } from './compare';

gateSpec({
  log: 'FAQ_ACCEPTANCE.md',
  keys: /^faq-(?:vi|en)$/,
});
