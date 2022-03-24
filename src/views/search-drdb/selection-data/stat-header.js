import React from 'react';
import {Grid} from 'semantic-ui-react';

import StatHeader from '../../../components/stat-header';
import ArticleCard from '../article-card';
import AntibodyCard from '../antibody-card';
import MutationCard from '../mutation-card';
import LocationParams from '../hooks/location-params';

import SearchBox from './search-box';
import TableOfContent from './table-of-content';

import style from '../style.module.scss';


export default function GenotypeRxStatHeader() {

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
                    label: 'Monoclonal antibodies',
                    value: rxDropdown
                  },
                  {
                    label: (
                      'Mutations'
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
                  <ArticleCard formOnly={false} />
                  <AntibodyCard formOnly={false} />
                  <MutationCard formOnly={false} />
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
