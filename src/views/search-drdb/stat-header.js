import React from 'react';
import {Grid, Header} from 'semantic-ui-react';

import {H1} from 'sierra-frontend/dist/components/heading-tags';
import StatHeader from '../../components/stat-header';
import ArticleCard from './article-card';
import PercentBars from './percent-bars';
import LocationParams from './hooks/location-params';

import SearchBox from './search-box';

import style from './style.module.scss';


export default function SearchDRDBStatHeader() {

  const {
    params: {
      formOnly,
      refName
    }
  } = LocationParams.useMe();

  return (
    <Grid.Row>
      <SearchBox>
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
                  {label: 'References', value: articleDropdown},
                  {
                    label: 'Plasma Abs / mAbs',
                    value: rxDropdown
                  },
                  {
                    label: (
                      'Variants / Mutations'
                    ),
                    value: variantDropdown
                  }
                ]
              },
              {
                width: 12,
                className: style['search-summary'],
                description: <>
                  {formOnly ? <>
                    <Header as={H1} disableAnchor>
                      Resistance Database Search
                    </Header>
                    <p>
                      Select a condition to start searching.
                    </p>
                  </> : <>
                    {refName ? <ArticleCard refName={refName} /> : null}
                  </>}
                  <PercentBars />
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
    </Grid.Row>
  );

}
