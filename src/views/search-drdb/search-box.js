import React from 'react';
import {Dropdown} from 'semantic-ui-react';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


function useArticleOptions({loaded, articleLookup, articleValue}) {
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
            !articleValue || articleValue in articleLookup ?
              [] :
              [{
                key: articleValue,
                text: articleValue,
                value: articleValue
              }]
          ),
          ...Object.values(articleLookup).map(
            ({refName}) => ({
              key: refName,
              text: refName,
              value: refName
            })
          )
        ];
      }
    },
    [loaded, articleLookup, articleValue]
  );

}


function useAntibodyOptions({loaded, antibodyLookup, antibodyValue}) {
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
              !(antibodyValue[0] in antibodyLookup)
            )
          ) ?
            [{
              key: antibodyValue.join(','),
              text: antibodyValue.join(' + '),
              value: antibodyValue.join(',')
            }] : []
          ),
          ...Object.values(antibodyLookup).map(
            ({abName, abbreviationName: abbr}) => ({
              key: abName,
              text: abbr ? `${abName} (${abbr})` : abName,
              value: abName
            })
          )
        ];
      }
    },
    [loaded, antibodyLookup, antibodyValue]
  );
}


export default function SearchBox({
  loaded,
  articleValue,
  antibodyValue,
  articleLookup,
  antibodyLookup,
  onChange,
  children
}) {
  const articleOptions = useArticleOptions({
    loaded, articleValue, articleLookup
  });
  const antibodyOptions = useAntibodyOptions({
    loaded, antibodyValue, antibodyLookup
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
