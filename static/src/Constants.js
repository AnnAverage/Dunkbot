export default {
  GITHUB_URL: 'https://github.com/hammerandchisel/airhornbot',
  DISCORD_URL: 'https://discordapp.com',
  SMALL_ISLAND_COUNT: 12,
  CLOUD_COUNT: 8,

  Image: {
    AIRHORN_COUNTER: require('./images/airhorn-counter.svg'),
    ISLAND_AIRHORN: require('./images/island-airhorn.svg'),
    ISLAND_SMALL_1: require('./images/island-small-01.png'),
    ISLAND_SMALL_2: require('./images/island-small-02.png'),
    ISLAND_SMALL_3: require('./images/island-small-03.png'),
    ISLAND_SMALL_4: require('./images/island-small-04.png'),
    ISLAND_SMALL_5: require('./images/island-small-05.png'),
    ISLAND_SMALL_6: require('./images/island-small-06.png'),
  },

  Video: {
    AIRHORN: require('./videos/airhorn.mp4')
  },

  Audio: {
    AIRHORN: require('../../audio/airhorn1.wav')
  },

  Animation: {
    COUNT_CHANGE_TIME: 200
  },

  Event: {
    STATS_PANEL_SHOW: 'EVENT_STATS_PANEL_SHOW',
    STATS_PANEL_HIDE: 'EVENT_STATS_PANEL_HIDE'
  },

  MediaQuery: {
    PHONE: 690
  }
};