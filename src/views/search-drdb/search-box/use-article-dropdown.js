import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';

import Articles from '../hooks/articles';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';

import style from './style.module.scss';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


export default function useArticleDropdown() {
  const {
    params: {
      formOnly,
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
  const isPending = isRefLookupPending || isNumExpLookupPending;
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
            description: pluralize(
              'result',
              numExpLookup[ANY],
              true
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
                description: pluralize(
                  'result',
                  numExpLookup[refName] || 0,
                  true
                ),
                'data-is-empty': !numExpLookup[refName]
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
      formOnly,
      numExpLookup
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
