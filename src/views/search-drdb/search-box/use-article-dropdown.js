import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';

import {useArticleNumExpLookup} from '../hooks';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


export default function useArticleDropdown({
  loaded,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  mutationText,
  articles,
  onChange,
  formOnly
}) {
  const [numExpLookup, isPending] = useArticleNumExpLookup({
    skip: !loaded,
    antibodyValue,
    vaccineValue,
    convPlasmaValue,
    variantValue,
    mutationText
  });
  const articleOptions = React.useMemo(
    () => {
      if (!loaded || isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: articleValue,
            text: articleValue,
            value: articleValue
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
            !articleValue || articles.some(
              ({refName}) => articleValue === refName
            ) ?
              [] :
              [{
                key: articleValue,
                text: articleValue,
                value: articleValue
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
      loaded,
      isPending,
      articles,
      articleValue,
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
    <Dropdown
     search direction="left"
     placeholder={EMPTY_TEXT}
     options={articleOptions}
     onChange={handleChange}
     value={articleValue || defaultValue} />
  );
}
