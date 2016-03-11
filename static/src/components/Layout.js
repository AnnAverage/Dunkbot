import React from 'react';
import AirhornCountStore from '../stores/AirhornCountStore';
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
import Constants from '../Constants';

import '../style/style.styl';

const Footer = ({count}) => (
  <div className="footer">
    <div className="airhorn-count">
      <img src={Constants.Image.AIRHORN_COUNTER} />
      <div className="count-text">
        <div className="count">{count}</div>
        <div className="and-counting">and counting</div>
      </div>
    </div>
    <div className="main-text">
      Some text will go  here about how you can do something on&nbsp;
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
      <source src={Constants.Video.AIRHORN_MP4} type="video/mp4" />
    </video>
    <a className="add-btn" onClick={addBtnClick}>Add to Discord</a>
  </div>
);

const Layout = React.createClass({

  getInitialState() {
    return {
      count: 0
    };
  },

  componentWillMount() {
    this.smallIslandTypes = [];
    for (let i=0; i<Constants.SMALL_ISLAND_COUNT; i++) {
      this.smallIslandTypes.push(Math.floor((Math.random() * 6) + 1));
    }

    AirhornCountStore.on('change', this.updateCount);
  },

  componentDidMount() {
    let scene = document.getElementById('scene');
    console.log(Parallax);
    new Parallax(scene);
  },

  playVideo() {
    document.getElementById('video-airhorn').play();
    setTimeout(this.startOAuth, 1500);
  },

  startOAuth() {
    console.log('starting OAuth flow');
    //window.location = '/login';
  },

  updateCount() {
    this.setState({
      count: AddCountStore.getCount()
    });

    console.log(this.state.count);
  },

  render() {
    let smallIslands = [];
    for (let i=1; i<=Constants.SMALL_ISLAND_COUNT; i++) {
      let type = this.smallIslandTypes[i - 1];
      smallIslands.push(<IslandSmall number={i} key={i} type={type} />)
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

        <div id="parallax" style={{display: 'absolute', width: '100%', height: '100%', top: 0, left: 0}}>
          <Cloud type={1} number="1" left="-304" top="-256" />
          <Cloud type={2} number="2" left="-400" top="400" />
          <Cloud type={3} number="3" left="1056" top="-56" />
          <Cloud type={4} number="4" left="784" top="504" />
          <Cloud type={3} number="5" left="-790" top="-20" />
          <Cloud type={1} number="6" left="-690" top="-440" />
          <Cloud type={2} number="7" left="1520" top="360" />
          <Cloud type={4} number="8" left="-820" top="765" />
        </div>

        <Footer count={this.state.count} /> 
      </div>
    );
  }
});

export default Layout;