/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import KeyCode from './_util/KeyCode';
import Animate from 'rc-animate';
import LazyRenderBox from './LazyRenderBox';
import getScrollBarSize from './_util/getScrollBarSize';
import assign from 'object-assign';

let uuid = 0;
let openCount = 0;

/* eslint react/no-is-mounted:0 */

function noop() {
}

function getScroll(w, top) {
  let ret = w[`page${top ? 'Y' : 'X'}Offset`];
  const method = `scroll${top ? 'Top' : 'Left'}`;
  if (typeof ret !== 'number') {
    const d = w.document;
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      ret = d.body[method];
    }
  }
  return ret;
}

function setTransformOrigin(node, value) {
  const style = node.style;
  ['Webkit', 'Moz', 'Ms', 'ms'].forEach((prefix) => {
    style[`${prefix}TransformOrigin`] = value;
  });
  style[`transformOrigin`] = value;
}

function offset(el) {
  const rect = el.getBoundingClientRect();
  const pos = {
    left: rect.left,
    top: rect.top,
  };
  const doc = el.ownerDocument;
  const w = doc.defaultView || doc.parentWindow;
  pos.left += getScroll(w);
  pos.top += getScroll(w, true);
  return pos;
}

const Layer = React.createClass({
  getDefaultProps() {
    return {
      afterClose: noop,
      className: '',
      mask: true,
      visible: false,
      keyboard: true,
      maskClosable: true,
      prefixCls: 'rc-layer',
      onClose: noop,
    };
  },

  componentWillMount() {
    this.titleId = `rcLayerTitle${uuid++}`;
  },

  componentDidMount() {
    this.componentDidUpdate({});
  },

  componentDidUpdate(prevProps) {
    const props = this.props;
    const mousePosition = this.props.mousePosition;
    if (props.visible) {
      // first show
      if (!prevProps.visible) {
        this.lastOutSideFocusNode = document.activeElement;
        this.addScrollingEffect();
        this.refs.wrap.focus();
        const layerNode = ReactDOM.findDOMNode(this.refs.layer);
        if (mousePosition) {
          const elOffset = offset(layerNode);
          setTransformOrigin(layerNode,
            `${mousePosition.x - elOffset.left}px ${mousePosition.y - elOffset.top}px`);
        } else {
          setTransformOrigin(layerNode, '');
        }
      }
    } else if (prevProps.visible) {
      if (props.mask && this.lastOutSideFocusNode) {
        try {
          this.lastOutSideFocusNode.focus();
        } catch (e) {
          this.lastOutSideFocusNode = null;
        }
        this.lastOutSideFocusNode = null;
      }
    }
  },

  onAnimateLeave() {
    if (this.refs.wrap) {
      this.refs.wrap.style.display = 'none';
    }
    this.removeScrollingEffect();
    this.props.afterClose();
  },

  onMaskClick(e) {
    if (e.target === e.currentTarget && this.props.maskClosable) {
      this.close(e);
    }
  },

  onKeyDown(e) {
    const props = this.props;
    if (props.keyboard && e.keyCode === KeyCode.ESC) {
      this.close(e);
    }
    // keep focus inside layer
    if (props.visible) {
      if (e.keyCode === KeyCode.TAB) {
        const activeElement = document.activeElement;
        const layerRoot = this.refs.wrap;
        const sentinel = this.refs.sentinel;
        if (e.shiftKey) {
          if (activeElement === layerRoot) {
            sentinel.focus();
          }
        } else if (activeElement === this.refs.sentinel) {
          layerRoot.focus();
        }
      }
    }
  },

  getLayerElement() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const dest: any = {};
    if (props.width !== undefined) {
      dest.width = props.width;
    }
    if (props.height !== undefined) {
      dest.height = props.height;
    }

    const style = assign({}, props.style, dest);
    const transitionName = this.getTransitionName();
    const layerElement = (
      <LazyRenderBox
        role="document"
        ref="layer"
        style={style}
        className={`${prefixCls} ${props.className || ''}`}
        visible={props.visible}
      >
        {props.children}
        <div tabIndex={0} ref="sentinel" style={{ width: 0, height: 0, overflow: 'hidden' }}>
          sentinel
        </div>
      </LazyRenderBox>
    );
    return (
      <Animate
        key="layer"
        showProp="visible"
        onLeave={this.onAnimateLeave}
        transitionName={transitionName}
        component=""
        transitionAppear
      >
        {layerElement}
      </Animate>
    );
  },

  getZIndexStyle() {
    const style: any = {};
    const props = this.props;
    if (props.zIndex !== undefined) {
      style.zIndex = props.zIndex;
    }
    return style;
  },

  getWrapStyle(): any {
    return assign({}, this.getZIndexStyle(), this.props.wrapStyle);
  },

  getMaskStyle() {
    return assign({}, this.getZIndexStyle(), this.props.maskStyle);
  },

  getMaskElement() {
    const props = this.props;
    let maskElement;
    if (props.mask) {
      const maskTransition = this.getMaskTransitionName();
      maskElement = (
        <LazyRenderBox
          style={this.getMaskStyle()}
          key="mask"
          className={`${props.prefixCls}-mask`}
          hiddenClassName={`${props.prefixCls}-mask-hidden`}
          visible={props.visible}
        />
      );
      if (maskTransition) {
        maskElement = (
          <Animate
            key="mask"
            showProp="visible"
            transitionAppear
            component=""
            transitionName={maskTransition}
          >
            {maskElement}
          </Animate>
        );
      }
    }
    return maskElement;
  },

  getMaskTransitionName() {
    const props = this.props;
    let transitionName = props.maskTransitionName;
    const animation = props.maskAnimation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  },

  getTransitionName() {
    const props = this.props;
    let transitionName = props.transitionName;
    const animation = props.animation;
    if (!transitionName && animation) {
      transitionName = `${props.prefixCls}-${animation}`;
    }
    return transitionName;
  },

  getElement(part) {
    return this.refs[part];
  },

  setScrollbar() {
    if (this.bodyIsOverflowing && this.scrollbarWidth !== undefined) {
      document.body.style.paddingRight = `${this.scrollbarWidth}px`;
    }
  },

  addScrollingEffect() {
    openCount++;
    if (openCount !== 1) {
      return;
    }
    this.checkScrollbar();
    this.setScrollbar();
    document.body.style.overflow = 'hidden';
    // this.adjustLayer();
  },

  removeScrollingEffect() {
    openCount--;
    if (openCount !== 0) {
      return;
    }
    document.body.style.overflow = '';
    this.resetScrollbar();
    // this.resetAdjustments();
  },

  close(e) {
    this.props.onClose(e);
  },

  checkScrollbar() {
    let fullWindowWidth = window.innerWidth;
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      const documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
    if (this.bodyIsOverflowing) {
      this.scrollbarWidth = getScrollBarSize();
    }
  },
  resetScrollbar() {
    document.body.style.paddingRight = '';
  },
  adjustLayer() {
    if (this.refs.wrap && this.scrollbarWidth !== undefined) {
      const maskIsOverflowing =
        this.refs.wrap.scrollHeight > document.documentElement.clientHeight;
      this.refs.wrap.style.paddingLeft =
        `${!this.bodyIsOverflowing && maskIsOverflowing ? this.scrollbarWidth : ''}px`;
      this.refs.wrap.style.paddingRight =
        `${this.bodyIsOverflowing && !maskIsOverflowing ? this.scrollbarWidth : ''}px`;
    }
  },

  resetAdjustments() {
    if (this.refs.wrap) {
      this.refs.wrap.style.paddingLeft = this.refs.wrap.style.paddingLeft = '';
    }
  },

  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    const style = this.getWrapStyle();
    // clear hide display
    // and only set display after async anim, not here for hide
    if (props.visible) {
      style.display = null;
    }
    return (
      <div>
        {this.getMaskElement()}
        <div
          tabIndex={-1}
          onKeyDown={this.onKeyDown}
          className={`${prefixCls}-wrap ${props.wrapClassName || ''}`}
          ref="wrap"
          onClick={this.onMaskClick}
          role="layer"
          aria-labelledby={props.title ? this.titleId : null}
          style={style}
          {...props.wrapProps}
        >
          {this.getLayerElement()}
        </div>
      </div>
    );
  },
});

export default Layer;
