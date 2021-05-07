import React from 'react';
import {Dropdown} from 'semantic-ui-react';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


function useArticleOptions({loaded, articleValue, articles}) {
  return React.useMemo(
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
          {
            key: 'empty',
            text: EMPTY_TEXT,
            value: EMPTY
          },
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
            ({refName, displayName}) => ({
              key: refName,
              text: displayName,
              value: refName
            })
          )
        ];
      }
    },
    [loaded, articles, articleValue]
  );

}


function useAntibodyOptions({loaded, antibodies, antibodyValue}) {
  return React.useMemo(
    () => {
      if (!loaded) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          ...(
            antibodyValue && antibodyValue.length > 0 ?
              [{
                key: antibodyValue.join(','),
                text: antibodyValue.join(' + '),
                value: antibodyValue.join(',')
              }] : []
          )
        ];
      }
      else {
        return [
          {
            key: 'empty',
            text: EMPTY_TEXT,
            value: EMPTY
          },
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          ...((
            antibodyValue && antibodyValue.length > 0 &&
            (
              antibodyValue.length > 1 ||
              !antibodies.some(({abName}) => abName === antibodyValue[0])
            )
          ) ?
            [{
              key: antibodyValue.join(','),
              text: antibodyValue.join(' + '),
              value: antibodyValue.join(',')
            }] : []
          ),
          ...antibodies.map(
            ({abName, abbreviationName: abbr}) => ({
              key: abName,
              text: abbr ? `${abName} (${abbr})` : abName,
              value: abName
            })
          )
        ];
      }
    },
    [loaded, antibodies, antibodyValue]
  );
}


export default function SearchBox({
  loaded,
  articleValue,
  antibodyValue,
  articles,
  antibodies,
  onChange,
  children
}) {
  const articleOptions = useArticleOptions({
    loaded, articleValue, articles
  });
  const antibodyOptions = useAntibodyOptions({
    loaded, antibodyValue, antibodies
  });

  const handleChange = action => (
    (evt, {value}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else if (value === ANY) {
        onChange(action, undefined);
      }
      else {
        onChange(action, value);
      }
    }
  );

  return children({
    articleDropdown: (
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={articleOptions}
       onChange={handleChange('article')}
       value={articleValue || ANY} />
    ),
    antibodyDropdown: (
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={antibodyOptions}
       onChange={handleChange('antibodies')}
       value={
         antibodyValue && antibodyValue.length > 0 ?
           antibodyValue.join(',') : ANY
       } />
    )
  });

}
