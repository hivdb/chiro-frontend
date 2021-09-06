import React from 'react';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';

import {H2} from 'sierra-frontend/dist/components/heading-tags';
import BackToTop from '../../components/back-to-top';
import setTitle from '../../utils/set-title';

import DRDBStatHeader from './stat-header';
import AbSuscResults from './pivot-tables/ab-susc-results';
import VPSuscResults from './pivot-tables/vp-susc-results';
import CPSuscResults from './pivot-tables/cp-susc-results';

import AbSuscSummary from './summary/ab-susc-summary';

import {useLastUpdate} from './hooks';
import LocationParams from './hooks/location-params';

import style from './style.module.scss';


export default function SearchDRDBLayout() {

  setTitle('Search SARS-CoV-2 resistance database');
  /* loading || redirectIfNeeded(props); */

  const {
    params: {formOnly},
    filterFlag
  } = LocationParams.useMe();
  const lastUpdate = useLastUpdate();

  const displayAbTables = (
    !formOnly &&
    !filterFlag.vaccine &&
    !filterFlag.infectedVariant
  );
  const displayCPTables = (
    !formOnly &&
    !filterFlag.antibody &&
    !filterFlag.vaccine
  );
  const displayVPTables = (
    !formOnly &&
    !filterFlag.antibody &&
    !filterFlag.infectedVariant
  );

  return <Grid stackable className={style['search']}>
    <Grid.Row>
      <Grid.Column width={16}>
        <Header as ="h1" dividing className={style['header-title']}>
          Search SARS-CoV-2 resistance database
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
    <DRDBStatHeader />
    {displayAbTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="mab-susc-results">
            MAb Susceptibility Data
          </Header>
          <AbSuscSummary />
          <AbSuscResults />
        </Grid.Column>
      </Grid.Row> : null}
    {displayVPTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="vp-susc-results">
            Vaccinee Plasma Susceptibility Data
          </Header>
          <VPSuscResults />
        </Grid.Column>
      </Grid.Row> : null}
    {displayCPTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="cp-susc-results">
            Convalescent Plasma Susceptibility Data
          </Header>
          <CPSuscResults />
        </Grid.Column>
      </Grid.Row> : null}
    <BackToTop />
  </Grid>;
}
