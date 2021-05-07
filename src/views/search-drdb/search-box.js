import React from 'react';
import {Dropdown} from 'semantic-ui-react';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


function useArticleOptions({loaded, articleValue, articles, formOnly}) {
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
            ({refName, displayName}) => ({
              key: refName,
              text: displayName,
              value: refName
            })
          )
        ];
      }
    },
    [loaded, articles, articleValue, formOnly]
  );

}


function useAntibodyOptions({loaded, antibodies, antibodyValue, formOnly}) {
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
    [loaded, antibodies, antibodyValue, formOnly]
  );
}


function useVaccineOptions({loaded, vaccines, vaccineValue, formOnly}) {
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
            key: vaccineValue,
            text: vaccineValue,
            value: vaccineValue
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
          ...vaccines.map(
            ({vaccineName}) => ({
              key: vaccineName,
              text: vaccineName,
              value: vaccineName
            })
          )
        ];
      }
    },
    [loaded, vaccines, vaccineValue, formOnly]
  );
}


export default function SearchBox({
  loaded,
  formOnly,
  articleValue,
  antibodyValue,
  vaccineValue,
  articles,
  antibodies,
  vaccines,
  onChange,
  children
}) {
  const articleOptions = useArticleOptions({
    loaded, articleValue, articles, formOnly
  });
  const antibodyOptions = useAntibodyOptions({
    loaded, antibodyValue, antibodies, formOnly
  });
  const vaccineOptions = useVaccineOptions({
    loaded, vaccineValue, vaccines, formOnly
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

  const defaultValue = formOnly ? EMPTY : ANY;

  return children({
    articleDropdown: (
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={articleOptions}
       onChange={handleChange('article')}
       value={articleValue || defaultValue} />
    ),
    antibodyDropdown: (
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={antibodyOptions}
       onChange={handleChange('antibodies')}
       value={
         antibodyValue && antibodyValue.length > 0 ?
           antibodyValue.join(',') : defaultValue
       } />
    ),
    vaccineDropdown: (
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={vaccineOptions}
       onChange={handleChange('vaccine')}
       value={vaccineValue || defaultValue} />
    )
  });

}
