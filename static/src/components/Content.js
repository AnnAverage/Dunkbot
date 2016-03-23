import React from 'react';
import OAuthStore from '../stores/OAuthStore';
import * as OAuthActions from '../actions/OAuthActions';
import Constants from '../Constants';

const Content = React.createClass({
  componentWillMount() {
    OAuthStore.on('change', this.playVideo);
  },

  playVideo() {
    if (OAuthStore.shouldPlayVideo()) {
      if (this.refs.video && this.refs.audio) {
        this.refs.video.currentTime = 0;
        this.refs.audio.currentTime = 0;
        this.refs.video.play();
        this.refs.audio.play();
      }

      OAuthActions.playedVideo();
    }
  },

  isMobile() {
    return window.matchMedia(`(max-width: ${Constants.MediaQuery.PHONE}px)`).matches;
  },

  render() {
    let center;
    if (this.isMobile()) {
      center = <img className="video-airhorn" src={Constants.Image.ISLAND_AIRHORN} />;
    }
    else {
      center = (
        <video preload className="video-airhorn" ref="video" src={Constants.Video.AIRHORN} type="video/mp4">
          <audio preload src={Constants.Audio.AIRHORN} type="audio/wav" ref="audio" />
        </video>
      );
    }

    return (
      <div className="content">
        <h1 className="title">!airhorn</h1>
        <p className="message">
          The only bot for <a href={Constants.DISCORD_URL}>Discord</a> you'll ever need
        </p>
        {center}
        <a className="add-btn" onClick={OAuthActions.start}>Add to Discord</a>
      </div>
    );
  }
});

export default Content;
