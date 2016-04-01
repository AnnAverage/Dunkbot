// @flow

import React from 'react';
import numeral from 'numeral';
import * as StatsActions from '../actions/StatsActions';
import * as ShareActions from '../actions/ShareActions';
import ShareStore from '../stores/ShareStore';
import Constants from '../Constants';

const messages = [
  ['"Airhorn Solutions saved my business ', {text: 'and', className: 'dark'}, ' my marriage" - R. Nelly'],
  [`"At first I didn't know what to expect,`, {text: ` but then I did!`, className: 'dark'}, `" - Ann Chovi`],
  [
    `“Knowing airhorns are now in Discord fills me with `,
    {text: `determination`, className: 'dark'},
    `.” - T. Fox`
  ],
  [
    `“Airhorn Solutions literally solved `,
    {text: `every single one`, className: 'dark'},
    ` of my problems.” - Noh Won`
  ],
  [`“The key is to make it. The key is to `, {text: `never give up`, className: 'dark'}, `.” - H. Khalidius`]
];

const FooterMessage = ({text}) => {
  let texts = [];
  for (let i = 0; i < text.length; i++) {
    let classes: string;
    let words: string;
    if (typeof text[i] === 'string') {
      texts.push(<span className="normal-text" key={`mess-${i}`}>{text[i]}</span>);
    }
    else {
      classes = text[i].className;
      words = text[i].text;
      texts.push(<span className={text[i].className} key={`mess-${i}`}>{text[i].text}</span>);
    }
  }

  return (
    <div className="main-text">
      {texts}
    </div>
  );
};

const MESSAGE_INDEX = Math.floor(Math.random() * messages.length);

const Footer = React.createClass({
  render() {
    const {count, changeCount, showStatsPanel, statsHasBeenShown} = this.props;

    let statsBtnClasses = 'crossfade';

    if (statsHasBeenShown) {
      if (showStatsPanel) {
        statsBtnClasses += ' two';
      }
      else {
        statsBtnClasses += ' two-reverse';
      }
    }

    let statsBtn2Classes = 'crossfade';

    if (statsHasBeenShown) {
      if (showStatsPanel) {
        statsBtn2Classes += ' three';
      }
      else {
        statsBtn2Classes += ' three-reverse';
      }
    }

    let toolTip = 'Click for more Stats';
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
              <img
                src={Constants.Image.ICON_CLOSE}
                className={statsBtn2Classes}
                onClick={StatsActions.hideStatsPanel} />
              <img
                src={Constants.Image.ICON_ABOUT}
                className={statsBtnClasses}
                data-tip={toolTip} />
            </div>
          </div>
        </div>
        <FooterMessage text={messages[MESSAGE_INDEX]} />
        <div className="social">
          <img src={Constants.Image.ICON_TWITTER} onClick={ShareActions.withTwitter} />
          <img src={Constants.Image.ICON_FACEBOOK} onClick={ShareActions.withFacebook} />
        </div>
      </div>
    );
  }
});

export default Footer;
