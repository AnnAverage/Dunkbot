import '../style/style.styl';

import React from 'react';
import Constants from '../Constants';
import Content from './Content';
import Footer from './Footer';
import IslandPond from './IslandPond';
import IslandTree from './IslandTree';
import IslandTent from './IslandTent';

export default React.createClass({
  render() {


    return (
      <div className="container">
        <div className="content"><Content /></div>
        <IslandPond />
        <IslandTree position="left" />
        <IslandTree position="right" />
        <IslandTent />
        <div className="footer"><Footer/></div> 
      </div>
    );
  }
});