import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


export default function useArticleDropdown({
  loaded,
  articleValue,
  articles,
  onChange,
  formOnly
}) {
  const articleOptions = React.useMemo(
    () => {
      if (!loaded) {
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
            value: ANY
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
          ...articles.map(
            ({refName, displayName, suscResultCount}) => ({
              key: refName,
              text: displayName,
              value: refName,
              description: pluralize('result', suscResultCount, true)
            })
          )
        ];
      }
    },
    [loaded, articles, articleValue, formOnly]
  );

  const handleChange = React.useCallback(
    (evt, {value, options}) => {
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
