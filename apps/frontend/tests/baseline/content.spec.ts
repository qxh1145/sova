import { gateSpec } from './compare';

gateSpec({
  log: 'CONTENT_ACCEPTANCE.md',
  keys: /^content-(?:terms-|warranty-|refund-)?(?:vi|en)$/,
});
