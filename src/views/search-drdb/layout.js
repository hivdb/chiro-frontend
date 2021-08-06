import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';

import {H2} from 'sierra-frontend/dist/components/heading-tags';
import BackToTop from '../../components/back-to-top';
import setTitle from '../../utils/set-title';

import DRDBStatHeader from './stat-header';
import AbSuscResults from './tables/ab-susc-results';
import VPSuscResults from './tables/vp-susc-results';
import CPSuscResults from './tables/cp-susc-results';

import AbSuscSummary from './summary/ab-susc-summary';

import LocationParams from './hooks/location-params';

import style from './style.module.scss';


SearchDRDBLayout.propTypes = {
  loaded: PropTypes.bool.isRequired,
  abSuscResults: PropTypes.array,
  cpSuscResults: PropTypes.array,
  vpSuscResults: PropTypes.array
};

SearchDRDBLayout.defaultProps = {
  loaded: false
};

export default function SearchDRDBLayout({
  loaded,
  abSuscResults,
  cpSuscResults,
  vpSuscResults
}) {

  setTitle('Search susceptibility data');
  /* loading || redirectIfNeeded(props); */

  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      abNames,
      vaccineName,
      infectedVarName
    }
  } = LocationParams.useMe();

  const displayAbTables = (
    loaded &&
    !formOnly &&
    !vaccineName &&
    !infectedVarName
  );
  const displayCPTables = (
    loaded &&
    !formOnly &&
    (!abNames || abNames.length === 0) &&
    !vaccineName
  );
  const displayVPTables = (
    loaded &&
    !formOnly &&
    (!abNames || abNames.length === 0) &&
    !infectedVarName
  );

  return <Grid stackable className={style['search']}>
    <DRDBStatHeader />
    {loaded ? null : <FixedLoader />}
    {displayAbTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="mab-susc-results">
            MAb Susceptibility Data
          </Header>
          <AbSuscSummary loaded={loaded} />
          <AbSuscResults
           loaded={loaded}
           cacheKey={JSON.stringify({refName, isoAggkey, abNames})}
           abSuscResults={abSuscResults} />
        </Grid.Column>
      </Grid.Row> : null}
    {displayVPTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="vp-susc-results">
            Vaccinee Plasma Susceptibility Data
          </Header>
          <VPSuscResults
           loaded={loaded}
           cacheKey={JSON.stringify({refName, isoAggkey, vaccineName})}
           vpSuscResults={vpSuscResults} />
        </Grid.Column>
      </Grid.Row> : null}
    {displayCPTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="cp-susc-results">
            Convalescent Plasma Susceptibility Data
          </Header>
          <CPSuscResults
           loaded={loaded}
           cacheKey={JSON.stringify({refName, isoAggkey})}
           cpSuscResults={cpSuscResults} />
        </Grid.Column>
      </Grid.Row> : null}
    <BackToTop />
  </Grid>;
  

}
