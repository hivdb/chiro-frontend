import React from 'react';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';

import {H2} from 'sierra-frontend/dist/components/heading-tags';
import BackToTop from '../../components/back-to-top';
import setTitle from '../../utils/set-title';

import DRDBStatHeader from './stat-header';
import AbSuscResults from './tables/ab-susc-results';
import VPSuscResults from './tables/vp-susc-results';
import CPSuscResults from './tables/cp-susc-results';
import InVitroMutationsTable from './tables/invitro-mutations-table';
import InVivoMutationsTable from './tables/invivo-mutations-table';
import DMSMutationsTable from './tables/dms-mutations-table';

import {useLastUpdate} from './hooks';
import IsolateAggs from './hooks/isolate-aggs';
import LocationParams from './hooks/location-params';

import style from './style.module.scss';


export default function SearchDRDBLayout() {

  setTitle('Search SARS-CoV-2 resistance database');
  /* loading || redirectIfNeeded(props); */

  const {
    params: {varName, isoAggkey, formOnly},
    filterFlag
  } = LocationParams.useMe();
  const lastUpdate = useLastUpdate();
  const {isolateAggLookup, isPending} = IsolateAggs.useMe();
  const isIndivMut = Boolean(
    !isPending &&
    (
      !isoAggkey || (
        isoAggkey in isolateAggLookup &&
        isolateAggLookup[isoAggkey].isoType === 'indiv-mut'
      )
    )
  );

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
    {!varName && isIndivMut ? <>
      {displayAbTables || displayCPTables ?
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as={H2} id="invitro-mutations">
              In vitro Selection Data
            </Header>
            <InVitroMutationsTable />
          </Grid.Column>
        </Grid.Row> : null}
      {displayAbTables || displayCPTables ?
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as={H2} id="dms-mutations">
              In vivo Selection Data
            </Header>
            <InVivoMutationsTable />
          </Grid.Column>
        </Grid.Row> : null}
      {displayAbTables ?
        <Grid.Row centered>
          <Grid.Column width={16}>
            <Header as={H2} id="dms-mutations">
              Deep Mutational Scanning (DMS) Data
            </Header>
            <DMSMutationsTable />
          </Grid.Column>
        </Grid.Row> : null}
    </> : null}
    <BackToTop />
  </Grid>;
}
