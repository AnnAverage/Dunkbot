import React from 'react';
import numeral from 'numeral';
import * as StatsActions from '../actions/StatsActions';
import Constants from '../Constants';

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

export default StatsPanel;
