import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {Grid, Header} from 'semantic-ui-react';

import {usePage} from '../../utils/cms';
import setTitle from '../../utils/set-title';

import Markdown from 'icosa/components/markdown';

import style from './style.module.scss';


MutAnnotViewerLayout.propTypes = {
  match: matchShape.isRequired,
  children: PropTypes.node,
  presets: PropTypes.arrayOf(
    PropTypes.shape({
      display: PropTypes.string.isRequired,
      asyncPageName: PropTypes.string.isRequired
    }).isRequired
  )
};

export default function MutAnnotViewerLayout({
  match,
  children,
  presets
}) {

  const preset = React.useMemo(
    () => {
      const {location: {pathname}} = match;
      const split = pathname.replace(/\/$/, '').split('/');
      const geneName = split[split.length - 1];
      return presets.find(({name}) => name === geneName);
    },
    [match, presets]
  );

  let title = 'Mutation annotation viewer';
  if (preset) {
    title += ` - ${preset.display}`;
  }

  setTitle(title);
  const skip = !preset?.asyncPageName;

  const [payload, isPending] = usePage(preset?.asyncPageName, skip);

  return <Grid stackable className={style['full-width-viewer']}>
    <Grid.Row>
      <Grid.Column width={16}>
        <Header as="h1" dividing>{title}</Header>
        {isPending ? null : <Markdown>{payload.content}</Markdown>}
        {children}
      </Grid.Column>
    </Grid.Row>
  </Grid>;
}
