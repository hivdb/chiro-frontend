import React from 'react';

import {
  useProviders
} from '../search-drdb/hooks';
import SearchBox from '../search-drdb/search-box';

import CMSPage from './cms';
import style from './style.module.scss';


export default function SusceptibilityData() {
  const ComboProvider = useProviders('searchBoxOnly', /*providerProps = */{
    locationParams: {
      redirectTo: '/search-drdb/',
      defaultQuery: {
        host: 'human',
        dosage: ['2', '3']
      }
    }
  });

  return (
    <CMSPage
     key="susceptibility-data"
     pageName="susceptibility-data">
      <ComboProvider>
        <SearchBox>
          {({
            articleDropdown,
            rxDropdown,
            virusDropdown
          }) => <div className={style['search-container']}>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>References</label>
              {articleDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Plasma Abs / mAbs
              </label>
              {rxDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Variants / Mutations
              </label>
              {virusDropdown}
            </div>
          </div>}
        </SearchBox>
      </ComboProvider>
    </CMSPage>
  );
}
