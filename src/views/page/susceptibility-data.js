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
            infectedVariantDropdown,
            vaccineDropdown,
            mabDropdown,
            variantDropdown,
            mutationDropdown
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
                Convelescent plasma
              </label>
              {infectedVariantDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Vaccinee plasma
              </label>
              {vaccineDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Monoclonal antibodies
              </label>
              {mabDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Variants
              </label>
              {variantDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Mutations
              </label>
              {mutationDropdown}
            </div>
          </div>}
        </SearchBox>
      </ComboProvider>
    </CMSPage>
  );
}
