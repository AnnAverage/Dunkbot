import React from 'react';
import Constants from '../Constants';

export default React.createClass({
  render() {
    let gitHubUrl = Constants.gitHubUrl;

    return(
      <div className="text">
        Some text will go  here about how you can do something on <a href={gitHubUrl}>GitHub</a>
        <a href={gitHubUrl} className="arrow"> ➔</a>
      </div>
    );
  }
});