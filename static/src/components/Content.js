import React from 'react';
import OAuthStore from '../stores/OAuthStore';
import ResponsiveStore from '../stores/ResponsiveStore';
import * as OAuthActions from '../actions/OAuthActions';
import Constants from '../Constants';

const Content = React.createClass({
  getInitialState() {
    return {
      isMobile: ResponsiveStore.isMobile(),
      showVideo: false
    };
  },

  componentWillMount() {
    OAuthStore.on('change', this.playVideo);
    ResponsiveStore.on('change', this.setSize);
  },

  playVideo() {
    this.setState({
      showVideo: OAuthStore.shouldPlayVideo()
    });

    if (OAuthStore.shouldPlayVideo()) {
      setTimeout(OAuthActions.playedVideo, Constants.VIDEO_LENGTH);
    }
  },

  setSize() {
    this.setState({
      isMobile: ResponsiveStore.isMobile()
    });
  },

  forcePlayVideo() {
    this.setState({showVideo: true});
    setTimeout(OAuthActions.playedVideo, Constants.VIDEO_LENGTH);
  },

  getCenter() {
    if (this.state.isMobile) {
      return <img className="video-airhorn" src={Constants.Image.ISLAND_AIRHORN_MOBILE} />;
    }
    else {
      if (this.state.showVideo) {
        return (
          <video preload autoPlay className="video-airhorn" ref="video" src={Constants.Video.AIRHORN} type="video/mp4">
            <audio preload autoPlay src={Constants.Audio.AIRHORN} type="audio/wav" ref="audio" />
          </video>
        );
      }
      else {
        return <img className="video-airhorn" src={Constants.Image.ISLAND_AIRHORN} onClick={this.forcePlayVideo} />;
      }
    }
  },

  render() {
    return (
      <div className="content">
        <div className="shadow">
          <h1 className="title">!airhorn</h1>
          <p className="message">
            The only bot for <a href={Constants.DISCORD_URL}>Discord</a> you'll ever need
          </p>
        </div>
        {this.getCenter()}
        <a className="add-btn" onClick={OAuthActions.start}>Add to Discord</a>
      </div>
    );
  }
});

export default Content;
