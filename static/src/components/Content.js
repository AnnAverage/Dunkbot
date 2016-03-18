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
      this.refs.video.play();
      this.refs.audio.play();
      OAuthActions.playedVideo();
    }
  },

  render() {
    return (
      <div className="content">
        <h1 className="title">!airhorn</h1>
        <p className="message">
          The only bot for <a href={Constants.DISCORD_URL}>Discord</a> you'll ever want
        </p>
        <video preload className="video-airhorn" ref="video">
          <source src={Constants.Video.AIRHORN} type="video/mp4" />
        </video>
        <audio preload src={Constants.Audio.AIRHORN} type="audio/wav" ref="audio" />
        <a className="add-btn" onClick={OAuthActions.start}>Add to Discord</a>
      </div>
    );
  }
});

export default Content;
