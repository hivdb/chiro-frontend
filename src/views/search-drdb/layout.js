import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';

import {H1, H2} from 'sierra-frontend/dist/components/heading-tags';
import StatHeader from '../../components/stat-header';
import ArticleInfo from '../../components/article-info';
import BackToTop from '../../components/back-to-top';
import setTitle from '../../utils/set-title';

import SearchBox from './search-box';
import AbSuscResults from './tables/ab-susc-results';
import VPSuscResults from './tables/vp-susc-results';
import CPSuscResults from './tables/cp-susc-results';

import AbSuscSummary from './summary/ab-susc-summary';

import style from './style.module.scss';



export default function SearchDRDBLayout({
  refName,
  mutationText,
  abNames,
  vaccineName,
  convPlasmaValue,
  varName,
  loaded,
  formOnly,
  onChange,
  articles,
  articleLookup,
  antibodies,
  antibodyLookup,
  vaccines,
  infectedVariants,
  variants,
  isolateAggs,
  isolateLookup,
  abSuscResults,
  cpSuscResults,
  vpSuscResults,
  article
}) {

  setTitle('Search susceptibility data');
  /* loading || redirectIfNeeded(props); */

  const displayAbTables = (
    loaded &&
    !formOnly &&
    !vaccineName &&
    !convPlasmaValue
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
    !convPlasmaValue
  );

  return <Grid stackable className={style['search']}>
    <Grid.Row>
      <SearchBox
       loaded={loaded}
       formOnly={formOnly}
       articleValue={refName}
       articles={articles}
       antibodyValue={abNames}
       antibodies={antibodies}
       vaccineValue={vaccineName}
       vaccines={vaccines}
       infectedVariants={infectedVariants}
       convPlasmaValue={convPlasmaValue}
       variantValue={varName}
       variants={variants}
       isolateAggs={isolateAggs}
       mutationText={mutationText}
       onChange={onChange}>
        {({
          articleDropdown,
          rxDropdown,
          variantDropdown
        }) => (
          <StatHeader>
            {[
              {
                className: style['search-box'],
                width: 4,
                cells: [
                  {label: 'Reference', value: articleDropdown},
                  {label: 'Plasma / Monoclonal antibody', value: rxDropdown},
                  {label: 'Variant', value: variantDropdown}
                ]
              },
              {
                width: 12,
                className: style['search-summary'],
                description: formOnly ? <>
                  <Header as={H1} disableAnchor>
                    Resistance Database Search
                  </Header>
                  <p>
                    Select an option from left drop down
                    lists to start searching.
                  </p>
                </> : <>
                  {article ? <ArticleInfo {...article} /> : null}
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
    </Grid.Row>
    {loaded ? null : <FixedLoader />}
    {displayAbTables ?
      <Grid.Row centered>
        <Grid.Column width={16}>
          <Header as={H2} id="mab-susc-results">
            MAb Susceptibility Data
          </Header>
          <AbSuscSummary
           loaded={loaded}
           antibodyLookup={antibodyLookup}
           isolateAggs={isolateAggs}
           articleValue={refName}
           variantValue={varName}
           mutationText={mutationText} />
          <AbSuscResults
           loaded={loaded}
           cacheKey={JSON.stringify({refName, mutationText, abNames})}
           articleLookup={articleLookup}
           antibodyLookup={antibodyLookup}
           isolateLookup={isolateLookup}
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
           cacheKey={JSON.stringify({refName, mutationText, vaccineName})}
           articleLookup={articleLookup}
           isolateLookup={isolateLookup}
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
           cacheKey={JSON.stringify({refName, mutationText})}
           articleLookup={articleLookup}
           isolateLookup={isolateLookup}
           cpSuscResults={cpSuscResults} />
        </Grid.Column>
      </Grid.Row> : null}
    <BackToTop />
  </Grid>;
  

}


SearchDRDBLayout.propTypes = {
  refName: PropTypes.string,
  mutationText: PropTypes.string,
  abNames: PropTypes.array,
  vaccineName: PropTypes.string,
  convPlasmaValue: PropTypes.string,
  varName: PropTypes.string,
  loaded: PropTypes.bool.isRequired,
  formOnly: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
  articles: PropTypes.array,
  articleLookup: PropTypes.object,
  antibodies: PropTypes.array,
  antibodyLookup: PropTypes.object,
  vaccines: PropTypes.array,
  infectedVariants: PropTypes.array,
  variants: PropTypes.array,
  isolateAggs: PropTypes.array,
  isolateLookup: PropTypes.object,
  abSuscResults: PropTypes.array,
  cpSuscResults: PropTypes.array,
  vpSuscResults: PropTypes.array,
  article: PropTypes.object
};

SearchDRDBLayout.defaultProps = {
  formOnly: false,
  loaded: false
};
