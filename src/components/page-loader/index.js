import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import {loadPage} from '../../utils/cms';
import PromiseComponent from '../../utils/promise-component';


export default class PageLoader extends React.Component {

  static propTypes = {
    pageName: PropTypes.string.isRequired,
    component: PropTypes.func,
    children: PropTypes.func,
    childProps: PropTypes.object.isRequired
  }

  static getDerivedStateFromProps(props, state = {}) {
    const {pageName, childProps} = props;
    if (
      pageName !== state.pageName ||
      !isEqual(childProps, state.childProps)
    ) {
      state.pageName = pageName;
      state.promise = loadPage(`page-${pageName}`, childProps);
      return state;
    }
    return null;
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  errorRender = () => {
    return "Page not found.";
  };

  render() {
    const {component, children} = this.props;
    const {promise} = this.state;
    const props = {promise, error: this.errorRender};
    if (component) {
      props.component = component;
    }
    else {
      props.then = children;
    }

    return <PromiseComponent {...props} />;
  }
}
