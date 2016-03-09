import React from 'react';
import Constants from '../Constants';

export default React.createClass({
  render() {
    return (
      <div className="content">
        <h1 className="title">!airhorn</h1>
        <p className="message">The only bot for <a href="https://discordapp.com">Discord</a> you'll ever want</p>
        <img src={Constants.Image.ISLAND_AIRHORN} />
        <a className="add-btn" href="/login">Add to Discord</a>
      </div>
    );
  }
})