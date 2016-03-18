import React from 'react';
import ToolTip from './ToolTip';
import numeral from 'numeral';
import * as StatsActions from '../actions/StatsActions';
import Constants from '../Constants';

const Footer = React.createClass({
  render() {
    let {count, changeCount, showStatsPanel, statsHasBeenShown} = this.props;
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
            <div className={`stats-btn ${showStatsPanel ? '' : 'closed'}`}>
              <ToolTip element={this.refs.statsBtn}>Click for More Stats</ToolTip>
              <img ref="statsBtn" src={Constants.Image.ICON_ABOUT} className={statsBtnClasses} />
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
      </div>
    );
  }
});

export default Footer;
