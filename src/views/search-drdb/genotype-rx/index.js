import React from 'react';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';

import {H2} from 'sierra-frontend/dist/components/heading-tags';
import BackToTop from '../../../components/back-to-top';
import setTitle from '../../../utils/set-title';

import GenotypeRxStatHeader from './stat-header';
import InVivoMutationsTable from '../tables/invivo-mutations-table';

import {useLastUpdate} from '../hooks';
import LocationParams from '../hooks/location-params';

import style from '../style.module.scss';


export default function GenotypeRxLayout() {

  setTitle('Search SARS-CoV-2 resistance database');
  /* loading || redirectIfNeeded(props); */

  const {
    params: {formOnly}
  } = LocationParams.useMe();
  const lastUpdate = useLastUpdate();

  return <Grid stackable className={style['search']}>
    <Grid.Row>
      <Grid.Column width={16}>
        <Header as ="h1" dividing className={style['header-title']}>
          SARS-CoV-2 genotype treatments
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
      null : <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="invivo-mutations">
            In vivo Selection Data
          </Header>
          <InVivoMutationsTable />
        </Grid.Column>
      </Grid.Row>}
    <BackToTop />
  </Grid>;
}
