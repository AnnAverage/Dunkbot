import EventEmitter from 'events';
import Constants from '../Constants';

class AirhornCountStore extends EventEmitter {
  constructor() {
    super();
    this.count = 0;
    
    //this.ws = new WebSocket('...');
    //this.ws.onmessage = this.recievedMessage.bind(this);
  }

  recievedMessage(event) {
    // this.count = ...
    this.emit('change');
  }

  getCount() {
    return this.count;
  }
}

export default new AirhornCountStore();