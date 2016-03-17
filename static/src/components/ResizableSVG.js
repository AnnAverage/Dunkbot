import Constants from '../Constants';

const ResizeableSVG = {
  checkMediaQuery() {
    return window.matchMedia(`(max-width: ${Constants.MediaQuery.PHONE}px)`).matches;
  },

  componentDidMount() {
    window.addEventListener('resize', this.update);
  },

  update() {
    this.forceUpdate();
  },

  getViewBox(width, height) {
    if (this.checkMediaQuery()) {
      return `0 0 ${width * 2} ${height * 2}`;
    }

    else {
      return `0 0 ${width} ${height}`;
    }
  }
};

export default ResizeableSVG;
