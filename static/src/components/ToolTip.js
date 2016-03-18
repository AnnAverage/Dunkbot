import React from 'react';

const ToolTip = React.createClass({
  render() {
    let style = {visibility: 'hidden'};
    if (this.refs.toolTip && this.props.element) {
      let elemRect = this.props.element.getBoundingClientRect();
      let toolTipRect = this.refs.toolTip.getBoundingClientRect();
      let left = elemRect.left - (toolTipRect.width / 2) + (elemRect.width / 2);

      style = {left};
    }

    return (
      <div ref="toolTip" className="tool-tip" style={style}>
        {this.props.children}
        <div></div>
      </div>
    );
  }
});

export default ToolTip;
