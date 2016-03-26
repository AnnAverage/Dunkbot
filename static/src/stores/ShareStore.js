// @flow

import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import Constants from '../Constants';

// @FlowIgnore
class ShareStore extends EventEmitter {
  shareWithFacebook() {
    this.open(`http://www.facebook.com/sharer.php?u=${Constants.AIRHORN_URL}`);
  }

  shareWithTwitter() {
    this.open(`https://twitter.com/share?text=${Constants.Social.MESSAGE_TWITTER}`);
  }

  open(url: string) {
    window.open(url, '', 'height=500px width=500px');
  }

  handle({type}) {
    switch (type) {
      case Constants.Event.SHARE_WITH_FACEBOOK: {
        this.shareWithFacebook();
        break;
      }
      case Constants.Event.SHARE_WITH_TWITTER: {
        this.shareWithTwitter();
        break;
      }
    }
  }
}

const shareStore = new ShareStore();

dispatcher.register(shareStore.handle.bind(shareStore));

export default shareStore;
