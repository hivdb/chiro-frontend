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
  isolateAggs: PropTypes.array,
  loaded: PropTypes.bool.isRequired
};

SearchDRDBStatHeader.defaultProps = {
  loaded: false
};

export default function SearchDRDBStatHeader({
  isolateAggs,
  loaded
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
                   isolateAggs={isolateAggs} />
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
    </Grid.Row>
  );

}
