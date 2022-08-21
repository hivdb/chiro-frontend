import React from 'react';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';

import Markdown from 'icosa/components/markdown';
import {H2} from 'icosa/components/heading-tags';
import BackToTop from '../../../components/back-to-top';
import setTitle from '../../../utils/set-title';

import GenotypeRxStatHeader from './stat-header';
import InVivoMutationsTable from '../tables/invivo-mutations-table';
import InVitroMutationsTable from '../tables/invitro-mutations-table';

import {useConfig, useLastUpdate} from '../hooks';
import LocationParams from '../hooks/location-params';

import style from '../style.module.scss';


export default function SelectionDataLayout() {

  setTitle('SARS-CoV-2 in vivo & in vitro selection data');
  /* loading || redirectIfNeeded(props); */

  const {
    params: {formOnly}
  } = LocationParams.useMe();
  const lastUpdate = useLastUpdate();

  const {config, isPending} = useConfig();

  // eslint-disable-next-line no-console
  console.debug('render <GenotypeRxLayout />');

  return <Grid stackable className={style['search']}>
    <Grid.Row>
      <Grid.Column width={16}>
        <Header as ="h1" dividing className={style['header-title']}>
          SARS-CoV-2 in vivo & in vitro selection data
          <Header.Subheader>
            <span className={style['contribute-options']}>
              <a href="https://git.io/JEQMz" target="_blank" rel="noreferrer">
                Suggest new study
              </a>
              <span className={style['bullet']}> ⦁ </span>
              <a href="https://git.io/JEQM8" target="_blank" rel="noreferrer">
                report error
              </a>
            </span>
            <span className={style['last-update']}>
              Last updated at {new Date(lastUpdate).toLocaleString('en-US')}
            </span>
          </Header.Subheader>
        </Header>
      </Grid.Column>
    </Grid.Row>
    <GenotypeRxStatHeader />
    {formOnly ?
      null : <>
        <Grid.Row centered>
          <Grid.Column width={16}>
            <H2 id="invivo-mutations">
              In vivo Selection Data
            </H2>
            <InVivoMutationsTable />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered>
          <Grid.Column width={16}>
            <H2 id="invitro-mutations">
              In vitro Selection Data
            </H2>
            <InVitroMutationsTable />
          </Grid.Column>
        </Grid.Row>
        {isPending ?
          null :
          <Grid.Row centered>
            <Grid.Column width={16}>
              <Markdown escapeHtml={false}>
                {config.messages['selection-data-footnote']}
              </Markdown>
            </Grid.Column>
          </Grid.Row>}
      </>}
    <BackToTop />
  </Grid>;
}
