import EventEmitter from 'events';
import dispatcher from '../dispatcher';
import Constants from '../Constants';

class ResponsiveStore extends EventEmitter {
  constructor() {
    super();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.emit('change');
  }

  isMobile() {
    return window.matchMedia(`(max-width: ${Constants.MediaQuery.PHONE}px)`).matches;
  }

  handle() {
  }
}

const responsiveStore = new ResponsiveStore();

dispatcher.register(responsiveStore.handle.bind(responsiveStore));

export default responsiveStore;
