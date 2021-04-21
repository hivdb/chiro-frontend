import React from 'react';
import PropTypes from 'prop-types';
import {/*Link, */matchShape} from 'found';
import {Grid, Header/*, Loader*/} from 'semantic-ui-react';

import {H1, H2} from 'sierra-frontend/dist/components/heading-tags';
import {InlineSearchBox} from '../../components/search-box';
import StatHeader from '../../components/stat-header';
import ArticleInfo from '../../components/article-info';
import BackToTop from '../../components/back-to-top';
import setTitle from '../../utils/set-title';

import AbSuscResults from './tables/ab-susc-results';

import style from './style.module.scss';



export default function SearchDRDBLayout({
  refName,
  mutations,
  abNames,
  match,
  loaded,
  formOnly,
  antibodyLookup,
  variantLookup,
  abSuscResults,
  cpSuscResults,
  vpSuscResults,
  article
}) {

  const handleQueryChange = (actions) => (
    null
    // handleQueryChange(actions, this.props)
  );

  setTitle('Search susceptibility data');
  /* loading || redirectIfNeeded(props); */

  return <Grid stackable className={style['search']}>
    <Grid.Row>
      <InlineSearchBox
       articleValue={refName}
       compoundValue={null}
       virusValue={null}
       compoundTargetValue={null}
       studyTypeValue={null}
       placeholder={'Select item'}
       compoundPlaceholder={'Enter text or select item'}
       onChange={handleQueryChange}
       allowEmpty>
        {({
          articleDropdown
        }) => (
          <StatHeader>
            {[
              {
                className: style['search-box'],
                width: 4,
                cells: [
                  {label: 'Reference', value: articleDropdown}
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
      </InlineSearchBox>
    </Grid.Row>
    <Grid.Row centered>
      <Grid.Column width={16}>
        <Header as={H2} id="mab-susc-results">
          MAb Susceptibility Data
        </Header>
        <AbSuscResults
         loaded={loaded}
         antibodyLookup={antibodyLookup}
         variantLookup={variantLookup}
         abSuscResults={abSuscResults} />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row centered>
      <Grid.Column width={16}>
        <Header as={H2} id="cp-susc-results">
          Convalescent Plasma Susceptibility Data
        </Header>
        <div>pending</div>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row centered>
      <Grid.Column width={16}>
        <Header as={H2} id="vp-susc-results">
          Plasma from Vaccinated Persons Susceptibility Data
        </Header>
        <div>pending</div>
      </Grid.Column>
    </Grid.Row>
    <BackToTop />
  </Grid>;
  

}


SearchDRDBLayout.propTypes = {
  formOnly: PropTypes.bool.isRequired,
  loaded: PropTypes.bool.isRequired,
  match: matchShape.isRequired,
  refName: PropTypes.string,
  mutations: PropTypes.array,
  abNames: PropTypes.array,
  antibodyLookup: PropTypes.object,
  abSuscResults: PropTypes.array,
  cpSuscResults: PropTypes.array,
  vpSuscResults: PropTypes.array,
  article: PropTypes.object
};

SearchDRDBLayout.defaultProps = {
  formOnly: false,
  loaded: false
};
