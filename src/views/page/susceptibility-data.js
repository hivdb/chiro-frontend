import React from 'react';

import {
  useProviders,
  useIsolateAggs
} from '../search-drdb/hooks';
import SearchBox from '../search-drdb/search-box';

import CMSPage from './cms';
import style from './style.module.scss';


export default function SusceptibilityData() {
  const ComboProvider = useProviders('searchBoxOnly');
  const {
    isolateAggs,
    isPending: isIsolateAggPending
  } = useIsolateAggs();

  const searchboxLoaded = (
    !isIsolateAggPending
  );

  return (
    <CMSPage
     key="susceptibility-data"
     pageName="susceptibility-data">
      <ComboProvider>
        <SearchBox
         loaded={searchboxLoaded}
         isolateAggs={isolateAggs || []}>
          {({
            articleDropdown,
            rxDropdown,
            variantDropdown
          }) => <div
           className={style['search-container']}
           data-loaded={searchboxLoaded}>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>Reference</label>
              {articleDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>
                Plasma / Monoclonal antibody
              </label>
              {rxDropdown}
            </div>
            <div
             className={style['search-item']}
             data-type-item-container>
              <label className={style['search-label']}>Variant</label>
              {variantDropdown}
            </div>
          </div>}
        </SearchBox>
      </ComboProvider>
    </CMSPage>
  );
}
