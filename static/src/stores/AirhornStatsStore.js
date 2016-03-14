import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import Constants from '../Constants';

class AirhornStatsStore extends EventEmitter {
  constructor() {
    super();
    this._count = 0;
    this._uniqueUsers = 0;
    this._uniqueChannels = 0;
    this._secretCount = 0;
    this._shouldShowStatsPanel = false;
    
    // setInterval(() => {
    //   let count = Math.random();
    //   let uniqueUsers = Math.random();
    //   let uniqueChannels = Math.random();
    //   let secretCount = Math.random();

    //   this.recievedMessage({data: {
    //       total: count > 0.001 ? this._count+1 : this._count,
    //       uniqueUsers: uniqueUsers > 0.8 || this._uniqueUsers <= this._uniqueChannels ? this._uniqueUsers + 1 : this._uniqueUsers,
    //       uniqueChannels: uniqueChannels > 0.95 || this._uniqueChannels == 0 ? this._uniqueChannels + 1 : this._uniqueChannels,
    //       secretCount: secretCount > 0.95 ? this._secretCount + 1 : this._secretCount
    //     }
    //   });
    // }, 1000);

    let eventSource = new EventSource('/events');
    eventSource.onmessage = this.recievedMessage.bind(this);
  }

  recievedMessage(event) {
    this._count = event.data.total;
    this._uniqueUsers = event.data.uniqueUsers;
    this._uniqueChannels = event.data.uniqueChannels;
    this._secretCount = event.data.secretCount;
    this.emit('change');
  }

  showStatsPanel() {
    this._shouldShowStatsPanel = true;
    this.emit('change');
  }

  hideStatsPanel() {
    this._shouldShowStatsPanel = false;
    this.emit('change');
  }

  getCount() {
    return this._count;
  }

  getUniqueUsers() {
    return this._uniqueUsers;
  }

  getUniqueChannels() {
    return this._uniqueChannels;
  }

  getSecretCount() {
    return this._secretCount;
  }

  shouldShowStatsPanel() {
    return this._shouldShowStatsPanel;
  }

  handle({type}) {
    switch(type) {
      case Constants.Event.STATS_PANEL_SHOW: {
        this.showStatsPanel();
        break;
      }
      case Constants.Event.STATS_PANEL_HIDE: {
        this.hideStatsPanel();
        break;
      }
    }
  }
}

const airhornStatsStore = new AirhornStatsStore();

dispatcher.register(airhornStatsStore.handle.bind(airhornStatsStore));

export default airhornStatsStore;