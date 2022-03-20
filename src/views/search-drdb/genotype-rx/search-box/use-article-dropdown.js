import React from 'react';
import {Dropdown} from 'semantic-ui-react';

import Articles from '../../hooks/articles';
import InVivoMutations from '../../hooks/invivo-mutations';
import LocationParams from '../../hooks/location-params';

import Desc from './desc';
import style from './style.module.scss';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
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
    numInVivoMuts,
    isInVivoMutsPending
  ] = InVivoMutations.useSummaryByArticle();
  const isPending = (
    isRefLookupPending ||
    isInVivoMutsPending
  );
  const totalNumExpLookup = React.useMemo(
    () => {
      if (isPending) {
        return {};
      }
      const lookup = {};
      lookup[ANY] = 0;
      for (const {refName, count} of numInVivoMuts) {
        lookup[refName] = lookup[refName] || 0;
        lookup[refName] += count;
        lookup[ANY] += count;
      }
      return lookup;
    },
    [isPending, numInVivoMuts]
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
                'data-is-empty': !totalNumExpLookup[refName]
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

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <div
     data-loaded={!isPending}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={articleOptions}
       onChange={handleChange}
       value={paramRefName || defaultValue} />
    </div>
  );
}
