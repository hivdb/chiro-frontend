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
          infectedVariantDropdown,
          vaccineDropdown,
          mabDropdown,
          variantDropdown,
          mutationDropdown
        }) => (
          <StatHeader>
            {[
              {
                className: style['search-box'],
                width: 4,
                cells: [
                  {label: 'References', value: articleDropdown},
                  {
                    label: 'Convalescent plasma',
                    value: infectedVariantDropdown
                  },
                  {
                    label: 'Vaccinee plasma',
                    value: vaccineDropdown
                  },
                  {
                    label: 'Monoclonal antibodies',
                    value: mabDropdown
                  },
                  {
                    label: (
                      'Variants'
                    ),
                    value: variantDropdown
                  },
                  {
                    label: (
                      'Mutations'
                    ),
                    value: mutationDropdown
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
                </>
              }
            ]}
          </StatHeader>
        )}
      </SearchBox>
      <PercentBars>
        {formOnly ? null : <TableOfContent />}
      </PercentBars>
    </Grid.Row>
  );

}
