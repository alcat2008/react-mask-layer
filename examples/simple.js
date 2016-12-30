/* eslint no-console:0, react/no-multi-comp:0 */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import assign from 'object-assign';

import MaskLayer from 'react-mask-layer';
import 'react-mask-layer/assets/index.less';

import './style/simple.less';

class App extends Component {
  constructor(props) {
    super(props);
    // initial state
    this.state = {
      maskerVisible: false,
    };
  }

  _maskCancel = e => {
    console.log('cancel target: ', e.target, ' type: ', e.type);
    this.setState({ maskerVisible: false });
  };

  _showOverlay = e => {
    console.log('show target: ', e.target, ' type: ', e.type);
    e.preventDefault();
    this.setState({ maskerVisible: true });
  };

  render() {
    return (
      <div className="App">
        <div onClick={this._showOverlay} className="button">show mask layer</div>
        <MaskLayer visible={this.state.maskerVisible} onCancel={this._maskCancel}>
          <div className="content">I'm content!!!</div>
        </MaskLayer>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('__react-content'));
