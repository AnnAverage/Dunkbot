// @flow

import React from 'react';
import numeral from 'numeral';
import * as StatsActions from '../actions/StatsActions';
import Constants from '../Constants';

const Footer = React.createClass({
  render() {
    let {count, changeCount, showStatsPanel, statsHasBeenShown} = this.props;

    let statsBtnClasses: string = 'crossfade';

    if (statsHasBeenShown) {
      if (showStatsPanel) {
        statsBtnClasses += ' two';
      }
      else {
        statsBtnClasses += ' two-reverse';
      }
    }

    let toolTip: string = 'Click for more Stats';
    if (showStatsPanel) {
      toolTip = '';
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
            <div className="stats-btn">
              <img ref="statsBtn"
                src={Constants.Image.ICON_ABOUT}
                className={statsBtnClasses}
                data-tip={toolTip} />
            </div>
          </div>
        </div>
        <div className="main-text">
          <span className="normal-text">
            Open sourced by the team at Discord. Contribute yourself on&nbsp;
          </span>
          <a href={Constants.GITHUB_URL}>GitHub</a>
          <a href={Constants.GITHUB_URL} className="arrow">&nbsp;➔</a>
        </div>
        <div className="social">
          <a href={`https://twitter.com/share?text=${Constants.Social.MESSAGE_TWITTER}`}>
            <img src={Constants.Image.ICON_TWITTER} />
          </a>
          <a href={`http://www.facebook.com/sharer.php?u=${Constants.AIRHORN_URL}`}>
            <img src={Constants.Image.ICON_FACEBOOK} />
          </a>
        </div>
      </div>
    );
  }
});

export default Footer;
//<a href="https://twitter.com/share" class="twitter-share-button">Tweet</a>
//<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
