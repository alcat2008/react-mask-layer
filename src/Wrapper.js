/* eslint-disable */

import React, { ReactElement } from 'react';
import Dialog from './Layer';
import getContainerRenderMixin from './_util/getContainerRenderMixin';

const Wrapper = React.createClass({
  mixins: [
    getContainerRenderMixin({
      isVisible(instance) {
        return instance.props.visible;
      },
      autoDestroy: false,
      getComponent(instance, extra) {
        return (
          <Dialog
            {...instance.props}
            {...extra}
            key="dialog"
          />
        );
      },
    }),
  ],

  getDefaultProps() {
    return {
      visible: false,
    };
  },

  shouldComponentUpdate({ visible }) {
    return !!(this.props.visible || visible);
  },

  componentWillUnmount() {
    if (this.props.visible) {
      this.renderComponent({
        afterClose: this.removeContainer,
        onClose() {
        },
        visible: false,
      });
    } else {
      this.removeContainer();
    }
  },

  getElement(part) {
    return this._component.getElement(part);
  },

  render() {
    return null;
  },
});

export default Wrapper;
