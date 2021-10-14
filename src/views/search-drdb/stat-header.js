import React from 'react';
import {Grid} from 'semantic-ui-react';

import StatHeader from '../../components/stat-header';
import ArticleCard from './article-card';
import VaccineCard from './vaccine-card';
import AntibodyCard from './antibody-card';
import VariantCard from './variant-card';
import MutationCard from './mutation-card';
import PercentBars from './percent-bars';
import LocationParams from './hooks/location-params';

import SearchBox from './search-box';
import TableOfContent from './table-of-content';

import style from './style.module.scss';


export default function SearchDRDBStatHeader() {

  const {
    params: {
      formOnly
    }
  } = LocationParams.useMe();

  return (
    <Grid.Row>
      <SearchBox>
        {({
          articleDropdown,
          rxDropdown,
          virusDropdown
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
                    value: virusDropdown
                  }
                ]
              },
              {
                width: 12,
                className: style['search-summary'],
                description: <>
                  {formOnly ? <>
                    <p>
                      Select a condition to start searching.
                    </p>
                  </> : null}
                  <ArticleCard />
                  <VaccineCard />
                  <AntibodyCard />
                  <VariantCard />
                  <MutationCard />
                  <PercentBars />
                  {formOnly ? null : <TableOfContent />}
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
    </Grid.Row>
  );

}
