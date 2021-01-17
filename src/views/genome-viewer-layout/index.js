import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {Grid, Header} from 'semantic-ui-react';
import setTitle from '../../utils/set-title';


export default class GenomeViewerLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    children: PropTypes.node,
    presets: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired
      }).isRequired
    )
  }

  get preset() {
    const {presets} = this.props;
    const {match: {location: {pathname}}} = this.props;
    const split = pathname.replace(/\/$/, '').split('/');
    const presetName = split[split.length - 1];
    return presets.find(({name}) => name === presetName);
  }

  render() {
    const {preset} = this;
    const {children} = this.props;
    let title = 'Genome Viewer';
    if (preset) {
      title += ` - ${preset.label}`;
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
