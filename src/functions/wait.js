import { promisify } from 'util';

export default {
  name: 'wait',
  async execute(ms) {
    return promisify(setTimeout)(ms);
  },
};
