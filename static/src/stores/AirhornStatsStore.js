import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import Constants from '../Constants';

class AirhornStatsStore extends EventEmitter {
  constructor() {
    super();
    this._count = 0;
    this._uniqueUsers = 0;
    this._uniqueGuilds = 0;
    this._uniqueChannels = 0;
    this._secretCount = 0;
    this._shouldShowStatsPanel = false;

    let eventSource = new EventSource("/events");
    eventSource.onmessage = this.recievedMessage.bind(this);
  }

  fakeData() {
    setInterval(() => {
      let count = Math.random();
      let uniqueUsers = Math.random();
      let uniqueGuilds = Math.random();
      let uniqueChannels = Math.random();
      let secretCount = Math.random();

      this.recievedMessage({
        data: JSON.stringify({
          total: count > 0.001 ? this._count+1 : this._count,
          unique_users: uniqueUsers > 0.8 || this._uniqueUsers <= this._uniqueChannels ? Number.parseInt(this._uniqueUsers) + 1 : this._uniqueUsers,
          unique_guilds: uniqueGuilds > 0.95 || this._uniqueGuilds == 0 ? Number.parseInt(this._uniqueGuilds) + 1 : this._uniqueGuilds,
          unique_channels: uniqueChannels > 0.9 || this._uniqueChannels == 0 || this._uniqueChannels <= this._uniqueGuilds ? Number.parseInt(this._uniqueChannels) + 1 : this._uniqueChannels,
          secret_count: secretCount > 0.95 ? Number.parseInt(this._secretCount) + 1 : this._secretCount
        })
      });
    }, 1000);
  }

  recievedMessage(event) {
    let data = JSON.parse(event.data);
    this._count = data.total || 0;
    this._uniqueUsers = data.unique_users || 0;
    this._uniqueGuilds = data.unique_guilds || 0;
    this._uniqueChannels = data.unique_channels || 0;
    this._secretCount = data.secret_count || 0;
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

  getUniqueGuilds() {
    return this._uniqueGuilds;
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