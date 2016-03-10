import React from 'react';
import Cloud from './Cloud';
import IslandPond from './IslandPond';
import IslandTree from './IslandTree';
import IslandTrees from './IslandTrees';
import IslandTent from './IslandTent';
import Constants from '../Constants';

import '../style/style.styl';

const Footer = () => (
  <div className="footer">
    <div className="text">
      Some text will go  here about how you can do something on <a href={Constants.gitHubUrl}>GitHub</a>
      <a href={Constants.gitHubUrl} className="arrow"> ➔</a>
    </div>
  </div>
);

const Content = () => (
  <div className="content">
    <h1 className="title">!airhorn</h1>
    <p className="message">The only bot for <a href="https://discordapp.com">Discord</a> you'll ever want</p>
    <img src={Constants.Image.ISLAND_AIRHORN} />
    <a className="add-btn" href="/login">Add to Discord</a>
  </div>
);

const IslandSmall = ({number}) => (
  <img className={`island small-island small-${number}`} src={Constants.Image.ISLAND_SMALL} />
);

const Layout = React.createClass({
  render() {
    return (
      <div className="container">
        <Content />
        <IslandPond />
        <IslandTree />
        <IslandTrees />
        <IslandTent />

        <IslandSmall number="1" />
        <IslandSmall number="2" />
        <IslandSmall number="3" />
        <IslandSmall number="4" />
        <IslandSmall number="5" />
        <IslandSmall number="6" />

        <IslandSmall number="7" />
        <IslandSmall number="8" />
        <IslandSmall number="9" />

        <IslandSmall number="10" />
        <IslandSmall number="11" />
        <IslandSmall number="12" />
        <IslandSmall number="13" />

        <Cloud type={1} number="1" />
        <Cloud type={2} number="2" />
        <Cloud type={3} number="3" />
        <Cloud type={4} number="4" />
        <Cloud type={3} number="5" />
        <Cloud type={1} number="6" />
        <Cloud type={2} number="7" />
        <Cloud type={4} number="8" />

        <Cloud type={1} number="1" small />
        <Cloud type={2} number="2" small />
        <Cloud type={3} number="3" small />
        <Cloud type={4} number="4" small />
        <Cloud type={2} number="5" small />
        <Cloud type={3} number="6" small />
        <Cloud type={4} number="7" small />
        <Cloud type={1} number="8" small />
        <Cloud type={3} number="9" small />

        <Footer/> 
      </div>
    );
  }
});

export default Layout;