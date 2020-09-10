import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {Grid, Header} from 'semantic-ui-react';

import setTitle from '../../utils/set-title';


export default class MutAnnotViewerLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    children: PropTypes.node.isRequired
  }

  get geneName() {
    const {match: {location: {pathname}}} = this.props;
    if (pathname.endsWith('SARS2S/') || pathname.endsWith('SARS2S')) {
      return "Spike";
    }
    return null;
  }

  render() {
    const {geneName} = this;
    const {children} = this.props;
    let title = 'Mutation annotation viewer';
    if (geneName) {
      title += ` - ${geneName} gene`;
    }

    setTitle(title);

    return <Grid stackable>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>{title}</Header>
          {children}
        </Grid.Column>
      </Grid.Row>
    </Grid>;

  }

}
