import EventEmitter from 'events';
import Constants from '../Constants';

class AirhornStatsStore extends EventEmitter {
  constructor() {
    super();
    this.total = 0;
    this.uniqueUsers = 0;
    this.uniqueChannels = 0;
    this.secretCount = 0;
    
    setInterval(() => {
      this.recievedMessage({data: {
          total: this.total+1,
          uniqueUsers: this.uniqueUsers + 1,
          uniqueChannels: this.uniqueChannels + 1,
          secretCount: this.secretCount + 1
        }
      });
    }, 1000);

    //this.ws = new WebSocket('...');
    //this.ws.onmessage = this.recievedMessage.bind(this);
  }

  recievedMessage(event) {
    this.total = event.data.total;
    this.uniqueUsers = event.data.uniqueUsers;
    this.uniqueChannels = event.data.uniqueChannels;
    this.secretCount = event.data.secretCount;
    this.emit('change');
  }

  getTotal() {
    return this.total;
  }
}

export default new AirhornStatsStore();