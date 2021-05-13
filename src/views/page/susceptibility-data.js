import React from 'react';
import {useRouter} from 'found';

import {
  useArticles,
  useAntibodies,
  useVaccines,
  useCPCount,
  useVariants,
  useIsolates
} from '../search-drdb/hooks';
import SearchBox from '../search-drdb/search-box';

import CMSPage from './cms';
import style from './style.module.scss';


export default function SusceptibilityData(props) {
  const {location} = props;
  const {router} = useRouter();
  const {
    articles,
    isPending: isRefNameListPending
  } = useArticles();
  const {
    antibodies,
    isPending: isAbLookupPending
  } = useAntibodies();
  const {
    vaccines,
    isPending: isVaccPending
  } = useVaccines();
  const {
    cpSuscResultCount,
    isPending: isCPPending
  } = useCPCount();
  const {
    variants,
    isPending: isVariantPending
  } = useVariants();
  const {
    isolates,
    isPending: isIsolatePending
  } = useIsolates();

  const searchboxLoaded = (
    !isRefNameListPending &&
    !isAbLookupPending &&
    !isVaccPending &&
    !isCPPending &&
    !isVariantPending &&
    !isIsolatePending
  );

  const onChange = React.useCallback(
    (action, value) => {
      let query = action;
      if (typeof action === 'string') {
        query = {};
        query[action] = value;
      }
      router.push({
        pathname: '/search-drdb/',
        query
      });
    },
    [router]
  );

  return (
    <CMSPage
     key="susceptibility-data"
     pageName="susceptibility-data"
     location={location}>
      <SearchBox
       loaded={searchboxLoaded}
       formOnly
       articleValue={null}
       articles={articles || []}
       antibodyValue={null}
       antibodies={antibodies || []}
       vaccineValue={null}
       vaccines={vaccines || []}
       cpSuscResultCount={cpSuscResultCount}
       variantValue={null}
       variants={variants || []}
       isolates={isolates || []}
       mutations={[]}
       mutationText={null}
       mutationMatch="all"
       onChange={onChange}>
        {({
          articleDropdown,
          rxDropdown,
          variantDropdown,
          mutationsInput
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
    </CMSPage>
  );
}
