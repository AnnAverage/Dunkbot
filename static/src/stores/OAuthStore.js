import EventEmitter from 'events';
import request from 'superagent';
import dispatcher from '../dispatcher';
import * as OAuthActions from '../actions/OAuthActions';
import Constants from '../Constants';

let shouldPlayVideo = false;
let onMessage;

class OAuthStore extends EventEmitter {
  constructor() {
    super();

    request.get('/me').end((err, res) => {
      if (err) {
        return;
      }
      if (res.body.username) {
        OAuthActions.redirectedFromOAuth();
      }
    });
  }

  startOAuth() {
    shouldPlayVideo = false;
    window.removeEventListener('message', onMessage);
    window.open('/login', '', 'height=800, width=500');
    onMessage = this.onMessage.bind(this);
    window.addEventListener('message', onMessage);
    this.emit('change');
  }

  onMessage({data}) {
    if (data == Constants.Message.OAUTH_ADDED) {
      this.endOAuth();
    }
  }

  endOAuth() {
    window.removeEventListener('message', onMessage);
    shouldPlayVideo = true;
    this.emit('change');
  }

  redirectedFromOAuth() {
    if (window.opener) {
      window.opener.postMessage(Constants.Message.OAUTH_ADDED, '*');
      window.close();
    }
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
      case Constants.Event.OAUTH_REDIRECTED_FROM: {
        this.redirectedFromOAuth();
        break;
      }
    }
  }
}

const oAuthStore = new OAuthStore();

dispatcher.register(oAuthStore.handle.bind(oAuthStore));

export default oAuthStore;
