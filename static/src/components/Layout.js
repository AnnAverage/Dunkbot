import React from 'react';
import AirhornStatsStore from '../stores/AirhornStatsStore';
import Cloud from './Cloud';
import IslandPond from './IslandPond';
import IslandTree from './IslandTree';
import IslandTrees from './IslandTrees';
import IslandTent from './IslandTent';
import IslandDoubleTree from './IslandDoubleTree';
import IslandForest from './IslandForest';
import IslandLog from './IslandLog';
import IslandShrooms from './IslandShrooms';
import IslandSmall from './IslandSmall';
import Parallax from '../Parallax';
import * as StatsActions from '../actions/StatsActions';
import Constants from '../Constants';

import '../style/style.styl';

const Footer = ({count, changeCount}) => (
  <div className="footer">
    <div className="airhorn-count" onClick={StatsActions.showStatsPanel}>
      <img src={Constants.Image.AIRHORN_COUNTER} />
      <div className="count-text">
        <div className={`count ${changeCount ? 'count-big' : ''}`}>{count}</div>
        <div className="and-counting">and counting</div>
      </div>
    </div>
    <div className="main-text">
      Open sourced by the team at Discord. Contribute yourself on&nbsp;
      <a href={Constants.GITHUB_URL}>GitHub</a>
      <a href={Constants.GITHUB_URL} className="arrow">&nbsp;➔</a>
    </div>
  </div>
);

const Content = ({addBtnClick}) => (
  <div className="content">
    <h1 className="title">!airhorn</h1>
    <p className="message">The only bot for <a href={Constants.DISCORD_URL}>Discord</a> you'll ever want</p>
    <video preload className="video-airhorn" id="video-airhorn">
      <source src={Constants.Video.AIRHORN} type="video/mp4" />
    </video>
    <audio preload src={Constants.Audio.AIRHORN} type="audio/wav" id="audio-airhorn" />
    <a className="add-btn" onClick={addBtnClick}>Add to Discord</a>
  </div>
);

const StatsPanel = ({count, uniqueUsers, uniqueChannels, secretCount, show}) => {
  if (show) {
    return (
        <div className="stats-panel">
          <div className="stats-content">
            <div className="close-btn-container">
              <span className="close-btn" onClick={StatsActions.hideStatsPanel}>✖</span>
            </div>
            <div>
              <label>Count: </label>{count}
            </div>
            <div>
              <label>Unique users: </label>{uniqueUsers}
            </div>
            <div>
            <label>Unique channels: </label>{uniqueChannels}
            </div>
          <div>
            <label>Secret count: </label>{secretCount}
          </div>
        </div>
      </div>
    );
  }
  else {
    return <noscript />;
  }
}

const Layout = React.createClass({

  getInitialState() {
    return {
      count: 0,
      uniqueUsers: 0,
      uniqueChannels: 0,
      secretCount: 0,
      changeCount: false,
      showStats: false
    };
  },

  componentWillMount() {
    this.smallIslandTypes = [];
    this.cloudTypes = [];

    for (let i=0; i<Constants.SMALL_ISLAND_COUNT; i++) {
      this.smallIslandTypes.push(Math.floor((Math.random() * 6) + 1));
    }

    for (let i=0; i<Constants.CLOUD_COUNT / 2; i++) {
      this.cloudTypes.push(i);
    }

    for (let i=0; i<Constants.CLOUD_COUNT / 2; i++) {
      this.cloudTypes.push(i);
    }

    AirhornStatsStore.on('change', this.updateStats);

    document.addEventListener('click', this.onDocumentClick);
  },

  onDocumentClick(event) {
    if (!this.refs.statsPanel.contains(event.target)) {
      StatsActions.hideStatsPanel();
    }
  },

  componentDidMount() {
    let scene = document.getElementById('parallax');
    new Parallax(scene);
  },

  playVideo() {
    document.getElementById('video-airhorn').play();
    document.getElementById('audio-airhorn').play();
    setTimeout(this.startOAuth, 1500);
  },

  startOAuth() {
    console.log('starting OAuth flow');
    //window.location = '/login';
  },

  updateStats() {
    this.setState({
      count: AirhornStatsStore.getCount(),
      uniqueUsers: AirhornStatsStore.getUniqueUsers(),
      uniqueChannels: AirhornStatsStore.getUniqueChannels(),
      secretCount: AirhornStatsStore.getSecretCount(),
      showStats: AirhornStatsStore.shouldShowStatsPanel(),
      changeCount: this.state.count != AirhornStatsStore.getCount()
    });

    clearTimeout(this.changeCountTimeout);
    this.changeCountTimeout = setTimeout(this.finishChangeCountAnimation, Constants.Animation.COUNT_CHANGE_TIME);
  },

  finishChangeCountAnimation() {
    this.setState({
      changeCount: false
    });
  },

  render() {
    let smallIslands = [];
    for (let i=1; i<=Constants.SMALL_ISLAND_COUNT; i++) {
      let type = this.smallIslandTypes[i - 1];
      smallIslands.push(<IslandSmall number={i} key={i} type={type} />)
    }

    let clouds = [];
    for (let i=1; i<=Constants.CLOUD_COUNT; i++) {
      let type = this.cloudTypes[i - 1];
      clouds.push(<Cloud type={type} number={i} key={i} />)
    }

    return (
      <div className="container">
        <Content addBtnClick={this.playVideo} />
        <IslandPond />
        <IslandTree />
        <IslandTrees />
        <IslandTent />
        <IslandDoubleTree />
        <IslandForest />
        <IslandForest number="1" />
        <IslandLog />
        <IslandShrooms />
        <IslandShrooms number="1" />


        {smallIslands}

        <div id="parallax">
          {clouds}
        </div>
        <div ref="statsPanel"><StatsPanel
          show={this.state.showStats}
          count={this.state.count}
          uniqueUsers={this.state.uniqueUsers}
          uniqueChannels={this.state.uniqueChannels}
          secretCount={this.state.secretCount} /></div>
        <Footer count={this.state.count} changeCount={this.state.changeCount} /> 
      </div>
    );
  }
});

export default Layout;