import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import * as OAuthActions from '../actions/OAuthActions';
import Constants from '../Constants';

let shouldPlayVideo = false;

class OAuthStore extends EventEmitter {
  startOAuth() {
    shouldPlayVideo = false;
    let win = window.open('/login');
    win.addEventListener('beforeunload', OAuthActions.end);
    this.emit('change');
  }

  endOAuth() {
    shouldPlayVideo = true;
    this.emit('change');
  }

  playedVideo() {
    shouldPlayVideo = false;
  }

  shouldPlayVideo() {
    return shouldPlayVideo;
  }

  handle({type}) {
    switch (type) {
      case Constants.Event.OAUTH_START: {
        this.startOAuth();
        break;
      }
      case Constants.Event.OAUTH_END: {
        this.endOAuth();
        break;
      }
      case Constants.Event.OAUTH_PLAYED_VIDEO: {
        this.playedVideo();
        break;
      }
    }
  }
}

const oAuthStore = new OAuthStore();

dispatcher.register(oAuthStore.handle.bind(oAuthStore));

export default oAuthStore;
