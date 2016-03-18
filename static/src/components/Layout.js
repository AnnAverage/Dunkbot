/* @flow */

import React from 'react';
import AirhornStatsStore from '../stores/AirhornStatsStore';
import Cloud from './Cloud';
import IslandPond from './islands/IslandPond';
import IslandTree from './islands/IslandTree';
import IslandTrees from './islands/IslandTrees';
import IslandTent from './islands/IslandTent';
import IslandDoubleTree from './islands/IslandDoubleTree';
import IslandForest from './islands/IslandForest';
import IslandLog from './islands/IslandLog';
import IslandShrooms from './islands/IslandShrooms';
import IslandSmall from './islands/IslandSmall';
import Parallax from '../libs/Parallax';
import numeral from 'numeral';
import * as StatsActions from '../actions/StatsActions';
import Constants from '../Constants';

import '../style/style.styl';

const Footer = ({count, changeCount, showStatsPanel, statsHasBeenShown}) => {
  let statsBtnClasses = 'crossfade';
  if (statsHasBeenShown) {
    if (showStatsPanel) {
      statsBtnClasses += ' two';
    }
    else {
      statsBtnClasses += ' two-reverse';
    }
  }

  return (
    <div className="footer">
      <div className="airhorn-count">
        <div className="stats-toggler" onClick={StatsActions.toggleStatsPanel}>
          <div className="airhorn-count-content">
            <img src={Constants.Image.AIRHORN_COUNTER} />
            <div className="count-text">
              <div className={`count ${changeCount ? 'count-big' : ''}`}>
                {numeral(count).format('0,0')}
              </div>
              <div className="and-counting">and counting</div>
            </div>
          </div>
          <div className='stats-btn'>
        </div>
          <img src={Constants.Image.ICON_ABOUT} className={statsBtnClasses} />
        </div>
      </div>
      <div className="main-text">
        <span className="normal-text">
          Open sourced by the team at Discord. Contribute yourself on&nbsp;
        </span>
        <a href={Constants.GITHUB_URL}>GitHub</a>
        <a href={Constants.GITHUB_URL} className="arrow">&nbsp;➔</a>
      </div>
    </div>
  );
};

const Content = ({addBtnClick}) => (
  <div className="content">
    <h1 className="title">!airhorn</h1>
    <p className="message">
      The only bot for <a href={Constants.DISCORD_URL}>Discord</a> you'll ever want
    </p>
    <video preload className="video-airhorn" id="video-airhorn">
      <source src={Constants.Video.AIRHORN} type="video/mp4" />
    </video>
    <audio preload src={Constants.Audio.AIRHORN} type="audio/wav" id="audio-airhorn" />
    <a className="add-btn" onClick={addBtnClick}>Add to Discord</a>
  </div>
);

const StatsRow = ({icon, label, value}) => {
  return (
    <div className="stats-row">
      <img src={icon} />
      <div className="label-value">
        <div className="value">{numeral(value).format('0,0')}</div>
        <div className="label">{label}</div>
      </div>
    </div>
  );
};

const StatsPanel = ({count, uniqueUsers, uniqueGuilds, uniqueChannels, secretCount, show, hasBeenShown}) => {
  if (!hasBeenShown) {
    return <noscript />;
  }

  let classes = 'stats-panel';
  if (show) {
    classes += 'crossfade one';
  }
  else {
    classes += 'crossfade two';
  }

  return (
    <div className={`stats-panel crossfade ${show ? 'one' : 'one-reverse'}`}>
      <img src={Constants.Image.ICON_CLOSE} className="icon-close" onClick={StatsActions.hideStatsPanel} />
      <StatsRow icon={Constants.Image.ICON_PLAYS} label="Plays" value={count} />
      <StatsRow icon={Constants.Image.ICON_USERS} label="Unique Users" value={uniqueUsers} />
      <StatsRow icon={Constants.Image.ICON_SERVERS} label="Unique Servers" value={uniqueGuilds} />
      <StatsRow icon={Constants.Image.ICON_CHANNELS} label="Unique Channels" value={uniqueChannels} />
      <StatsRow icon={Constants.Image.ICON_SECERT} label="Secret Plays" value={secretCount} />
    </div>
  );
};

const Layout = React.createClass({
  getInitialState() {
    return {
      count: 0,
      uniqueUsers: 0,
      uniqueGuilds: 0,
      uniqueChannels: 0,
      secretCount: 0,
      showStats: false,
      statsHasBeenShown: false,
      changeCount: false
    };
  },

  componentWillMount() {
    this.smallIslandTypes = [];
    this.cloudTypes = [];

    for (let i = 0; i < Constants.SMALL_ISLAND_COUNT; i++) {
      this.smallIslandTypes.push(i % Constants.UNIQUE_SMALL_ISLAND_COUNT);
    }

    for (let i = 0; i < Constants.CLOUD_COUNT; i++) {
      this.cloudTypes.push(i % Constants.UNIQUE_CLOUD_COUNT);
    }

    AirhornStatsStore.on('change', this.updateStats);
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
    window.location = '/login';
  },

  updateStats() {
    this.setState({
      count: AirhornStatsStore.getCount(),
      uniqueUsers: AirhornStatsStore.getUniqueUsers(),
      uniqueGuilds: AirhornStatsStore.getUniqueGuilds(),
      uniqueChannels: AirhornStatsStore.getUniqueChannels(),
      secretCount: AirhornStatsStore.getSecretCount(),
      showStats: AirhornStatsStore.shouldShowStatsPanel(),
      statsHasBeenShown: this.state.statsHasBeenShown || AirhornStatsStore.shouldShowStatsPanel(),
      changeCount: this.state.count != AirhornStatsStore.getCount()
    });

    clearTimeout(this.changeCountTimeout);
    this.changeCountTimeout = setTimeout(
      this.finishChangeCountAnimation,
      Constants.Animation.COUNT_CHANGE_TIME);
  },

  finishChangeCountAnimation() {
    this.setState({
      changeCount: false
    });
  },

  render() {
    let smallIslands = [];
    for (let i = 1; i <= Constants.SMALL_ISLAND_COUNT; i++) {
      let type = this.smallIslandTypes[i - 1];
      smallIslands.push(<IslandSmall number={i} key={i} type={type} />);
    }

    let clouds = [];
    for (let i = 1; i <= Constants.CLOUD_COUNT; i++) {
      let type = this.cloudTypes[i - 1];
      clouds.push(<Cloud type={type} number={i} key={i} />);
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
        <StatsPanel
          show={this.state.showStats}
          count={this.state.count}
          uniqueUsers={this.state.uniqueUsers}
          uniqueGuilds={this.state.uniqueGuilds}
          uniqueChannels={this.state.uniqueChannels}
          secretCount={this.state.secretCount}
          hasBeenShown={this.state.statsHasBeenShown} />
        <Footer
          count={this.state.count}
          changeCount={this.state.changeCount}
          showStatsPanel={this.state.showStats}
          statsHasBeenShown={this.state.statsHasBeenShown} />
      </div>
    );
  }
});

export default Layout;
