import React from 'react';
import ReactGA from 'react-ga';

export default class GAWrapper extends React.Component {

  logPageView() {
    setTimeout(() => {
      ReactGA.set({
        page: window.location.pathname,
        title: document.title
      });
      ReactGA.pageview(window.location.pathname);
    }, 800);
  }

  constructor() {
    super(...arguments);

    this.logPageView();
    this.props.router.addNavigationListener(() => {
      this.logPageView();
      return true;
    });

  }

  render() {
    return null;
  }
}
