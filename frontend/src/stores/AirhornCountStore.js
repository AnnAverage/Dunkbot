import EventEmitter from 'events';
import Constants from '../Constants';

class AirhornCountStore extends EventEmitter {
  constructor() {
    super();
    this.count = 0;
  }

  getCount() {
    return this.count;
  }
}

export default new AirhornCountStore();