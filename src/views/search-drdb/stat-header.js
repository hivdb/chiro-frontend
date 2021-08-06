import React from 'react';
import PropTypes from 'prop-types';
import {Grid, Header} from 'semantic-ui-react';

import {H1} from 'sierra-frontend/dist/components/heading-tags';
import StatHeader from '../../components/stat-header';
import ArticleCard from './article-card';
import PercentBars from './percent-bars';
import LocationParams from './hooks/location-params';

import SearchBox from './search-box';

import style from './style.module.scss';


SearchDRDBStatHeader.propTypes = {
  articles: PropTypes.array,
  infectedVariants: PropTypes.array,
  isolateAggs: PropTypes.array,
  loaded: PropTypes.bool.isRequired,
  vaccines: PropTypes.array,
  variants: PropTypes.array,
  isolates: PropTypes.array
};

SearchDRDBStatHeader.defaultProps = {
  loaded: false
};

export default function SearchDRDBStatHeader({
  articles,
  infectedVariants,
  isolateAggs,
  loaded,
  vaccines,
  variants,
  isolates
}) {

  const {
    params: {
      formOnly,
      refName
    }
  } = LocationParams.useMe();

  return (
    <Grid.Row>
      <SearchBox
       loaded={loaded}
       articles={articles}
       vaccines={vaccines}
       infectedVariants={infectedVariants}
       variants={variants}
       isolateAggs={isolateAggs}>
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
                  {refName ? <ArticleCard refName={refName} /> : null}
                  <PercentBars
                   loaded={loaded}
                   variants={variants}
                   isolateAggs={isolateAggs}
                   isolates={isolates} />
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
    </Grid.Row>
  );

}
