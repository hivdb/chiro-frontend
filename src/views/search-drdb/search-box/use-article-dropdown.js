import React from 'react';
import {Dropdown} from 'semantic-ui-react';

import Articles from '../hooks/articles';
import {NumExpStats} from '../hooks/susc-summary';
import DMSMutations from '../hooks/dms-mutations';
import LocationParams from '../hooks/location-params';

import useOnChangeWithLoading from './use-on-change-with-loading';
import Desc from './desc';
import style from './style.module.scss';

const EMPTY = 'empty';
const ANY = 'any';
const EMPTY_TEXT = 'Select item';


export default function useArticleDropdown() {
  const {
    params: {
      formOnly,
      // abNames: paramAbNames,
      refName: paramRefName
    },
    onChange
  } = LocationParams.useMe();
  const {
    articles,
    articleLookup,
    isPending: isRefLookupPending
  } = Articles.useMe();
  const [
    numExpLookup,
    isNumExpLookupPending
  ] = NumExpStats.useRef();
  const [
    numDMSMuts,
    isDMSMutsPending
  ] = DMSMutations.useSummaryByArticle();
  const isPending = (
    isRefLookupPending ||
    isNumExpLookupPending ||
    isDMSMutsPending
  );
  const totalNumExpLookup = React.useMemo(
    () => {
      if (isPending) {
        return {};
      }
      const lookup = {...numExpLookup};
      for (const {refName, count} of [
        ...numDMSMuts
      ]) {
        lookup[refName] = lookup[refName] || 0;
        lookup[refName] += count;
        lookup[ANY] += count;
      }
      return lookup;
    },
    [isPending, numExpLookup, numDMSMuts]
  );
  const articleOptions = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: paramRefName,
            text: paramRefName,
            value: paramRefName
          }
        ];
      }
      else {
        const approx = false; // paramAbNames && paramAbNames.length > 1;
        return [
          ...(formOnly ? [{
            key: 'empty',
            text: EMPTY_TEXT,
            value: EMPTY
          }] : []),
          {
            key: 'any',
            text: 'Any',
            value: ANY,
            description: (
              <Desc
               approx={approx}
               n={totalNumExpLookup[ANY]} />
            )
          },
          ...(
            (!paramRefName || paramRefName in articleLookup) ?
              [] :
              [{
                key: paramRefName,
                text: paramRefName,
                value: paramRefName
              }]
          ),
          ...articles
            .map(
              ({refName, displayName}) => ({
                key: refName,
                text: displayName,
                value: refName,
                description: (
                  <Desc
                   approx={approx}
                   n={totalNumExpLookup[refName] || 0} />
                ),
                'data-is-empty': (
                  paramRefName !== refName &&
                  !totalNumExpLookup[refName]
                )
              })
            )
            .filter(a => !a['data-is-empty'])
        ];
      }
    },
    [
      isPending,
      articles,
      articleLookup,
      paramRefName,
      // paramAbNames,
      formOnly,
      totalNumExpLookup
    ]
  );

  const handleChange = React.useCallback(
    (evt, {value}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        onChange('article', value === ANY ? undefined : value);
      }
    },
    [onChange]
  );

  const containerRef = React.useRef();

  const handleChangeWithLoading = useOnChangeWithLoading(
    handleChange,
    containerRef
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <div
     ref={containerRef}
     data-loading={isPending ? '' : undefined}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={articleOptions}
       onChange={handleChangeWithLoading}
       value={paramRefName || defaultValue} />
    </div>
  );
}
