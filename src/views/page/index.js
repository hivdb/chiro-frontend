import React from 'react';
import PropTypes from 'prop-types';

import CMSPage from './cms';


export default class Page extends React.Component {

  static propTypes = {
    match: PropTypes.shape({
      location: PropTypes.object.isRequired,
      params: PropTypes.shape({
        pageName: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }

  render() {
    const {params: {pageName}, location} = this.props.match;
    return <CMSPage {...{pageName, location}} />;
  }
}
