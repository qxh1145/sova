import { gateSpec } from './compare';

gateSpec({
  log: 'UTILITY_ACCEPTANCE.md',
  keys: /^(?:thank-you-vi|profile-(?:vi|en)|sample-vi|login-vi|payment-(?:vi|en))$/,
});
