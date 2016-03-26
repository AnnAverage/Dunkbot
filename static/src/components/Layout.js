// @flow

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
import Content from './Content';
import Footer from './Footer';
import StatsPanel from './StatsPanel';
import Parallax from '../libs/parallax';
import ReactTooltip from 'react-tooltip';
import Browser from 'detect-browser';
import Constants from '../Constants';
import '../style/style.styl';

const PARALLAX_REF = 'PARALLAX_REF';

type State = {
  count: number,
  uniqueUsers: number,
  uniqueGuilds: number,
  uniqueChannels: number,
  secretCount: number,
  showStats: boolean,
  statsHasBeenShown: boolean,
  changeCount: boolean
};

let changeCountTimeout: number;

const Layout = React.createClass({
  getInitialState(): State {
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
    AirhornStatsStore.on('change', this.updateStats);
  },

  componentDidMount() {
    new Parallax(this.refs[PARALLAX_REF]);
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

    clearTimeout(changeCountTimeout);
    changeCountTimeout = setTimeout(
      this.finishChangeCountAnimation,
      Constants.Animation.COUNT_CHANGE_TIME);
  },

  finishChangeCountAnimation() {
    this.setState({
      changeCount: false
    });
  },

  render() {
    const smallIslands = [];
    for (let i = 0; i < Constants.SMALL_ISLAND_COUNT; i++) {
      const type = i % Constants.UNIQUE_SMALL_ISLAND_COUNT;
      smallIslands.push(<IslandSmall number={i} type={type} key={i} />);
    }

    const clouds = [];
    for (let i = 0; i < Constants.CLOUD_COUNT; i++) {
      const type = i % Constants.UNIQUE_CLOUD_COUNT;
      clouds.push(<Cloud number={i} type={type} key={i} />);
    }

    let toolTip;
    if (!this.state.showStats) {
      toolTip = <ReactTooltip effect="solid" type="light" class="tool-tip" offset={{top: -8}} />;
    }

    return (
      <div className={`container ${Browser.name}`}>
        <Content />
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

        <div id="parallax" ref={PARALLAX_REF}>
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
        {toolTip}
      </div>
    );
  }
});

export default Layout;
