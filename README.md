# react-mask-layer

Animatable mask layer, to hold anything you want.

## Install

[![react-mask-layer](https://nodei.co/npm/react-mask-layer.png)](https://npmjs.org/package/react-mask-layer)

## Usage

```javascript
import MaskLayer from 'react-mask-layer';
import 'react-mask-layer/style/index.less';

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
        <div onClick={this._showOverlay}>show mask layer</div>
        <MaskLayer visible={this.state.maskerVisible} onCancel={this._maskCancel} />
      </div>
    );
  }
}
```

## API

Name               | Type                | Default | Description
------------------ | ------------------- | ------- | ------------------------------------------------------------------------------
prefixCls          | String              | mx-mask | The mask layer dom node's prefixCls
className          | String              |         | additional className for mask layer
wrapClassName      | String              |         | additional className for mask layer wrap
style              | Object              | {}      | Root style for mask layer element.Such as width, height
zIndex             | Number              |         |
bodyStyle          | Object              | {}      | body style for mask layer body element.Such as height
maskStyle          | Object              | {}      | style for mask element
visible            | Boolean             | false   | current mask layer's visible status
animation          | String              |         | part of mask layer animation css class name
maskAnimation      | String              |         | part of mask layer's mask animation css class name
transitionName     | String              |         | mask layer animation css class name
maskTransitionName | String              |         | mask animation css class name
maskClosable       | Boolean             | true    | whether click mask to close
keyboard           | Boolean             | true    | whether support press esc to close
mousePosition      | {x:number,y:number} |         | set pageX and pageY of current mouse(it will cause transform origin to be set)
onClose            | function()          |         | called when click mask


## License

`react-mask-layer` is available under the MIT license. See the LICENSE file for more info.
