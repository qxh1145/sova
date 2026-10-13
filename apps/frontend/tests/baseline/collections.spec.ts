import { gateSpec } from './compare';

gateSpec({
  log: 'COLLECTIONS_ACCEPTANCE.md',
  keys: (r) => r.family === 'projects' || r.family === 'blog' || r.family === 'post-detail',
});
