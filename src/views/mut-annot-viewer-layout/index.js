import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {Grid, Header} from 'semantic-ui-react';

import {loadPage} from '../../utils/cms';
import setTitle from '../../utils/set-title';
import PromiseComponent from '../../utils/promise-component';

import Markdown from '../../components/markdown';

import style from './style.module.scss';


export default class MutAnnotViewerLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    children: PropTypes.node,
    presets: PropTypes.arrayOf(
      PropTypes.shape({
        display: PropTypes.string.isRequired,
        asyncPageName: PropTypes.string.isRequired
      }).isRequired
    )
  }

  get preset() {
    const {presets} = this.props;
    const {match: {location: {pathname}}} = this.props;
    const split = pathname.replace(/\/$/, '').split('/');
    const geneName = split[split.length - 1];
    return presets.find(({name}) => name === geneName);
  }

  renderContent = ({content}) => {
    if (content) {
      return <Markdown>{content}</Markdown>;
    }
    return null;
  }

  render() {
    const {preset} = this;
    const {children} = this.props;
    let title = 'Mutation annotation viewer';
    if (preset) {
      title += ` - ${preset.display}`;
    }

    setTitle(title);

    return <Grid stackable className={style['full-width-viewer']}>
      <Grid.Row>
        <Grid.Column width={16}>
          <Header as="h1" dividing>{title}</Header>
          {preset ? <PromiseComponent
           promise={loadPage(preset.asyncPageName)}
           then={this.renderContent} /> : null}
          {children}
        </Grid.Column>
      </Grid.Row>
    </Grid>;

  }

}
