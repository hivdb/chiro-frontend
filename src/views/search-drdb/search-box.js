import React from 'react';
import uniq from 'lodash/uniq';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';
import MutationsInput from 'sierra-frontend/dist/components/mutations-input';
import CheckboxInput from 'sierra-frontend/dist/components/checkbox-input';

import useConfig from './hooks/use-config';

import style from './style.module.scss';

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


function antibodySearch(options, query) {
  const re = new RegExp(escapeRegExp(query), 'i');
  return options.filter(({text, value, synonyms}) => (
    re.test(text) ||
    re.test(value) ||
    (synonyms && synonyms.some(syn => re.test(syn)))
  ));
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
            ({abName, abbreviationName: abbr, synonyms}) => ({
              key: abName,
              text: abbr ? `${abName} (${abbr})` : abName,
              value: abName,
              synonyms
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


function useVariantOptions({loaded, variants, variantValue, formOnly}) {
  const displayVariants = uniq(
    variants
      .map(({displayName}) => displayName)
      .filter(n => n)
  ).sort();
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
            key: variantValue,
            text: variantValue,
            value: variantValue
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
          ...displayVariants.map(
            (name) => ({
              key: name,
              text: name,
              value: name
            })
          )
        ];
      }
    },
    [loaded, displayVariants, variantValue, formOnly]
  );
}


export default function SearchBox({
  loaded,
  formOnly,
  articleValue,
  antibodyValue,
  vaccineValue,
  variantValue,
  articles,
  antibodies,
  vaccines,
  variants,
  mutationText,
  mutationMatch,
  onChange,
  children
}) {
  const {config, isPending: isConfigPending} = useConfig();
  const articleOptions = useArticleOptions({
    loaded, articleValue, articles, formOnly
  });
  const antibodyOptions = useAntibodyOptions({
    loaded, antibodyValue, antibodies, formOnly
  });
  const vaccineOptions = useVaccineOptions({
    loaded, vaccineValue, vaccines, formOnly
  });
  const variantOptions = useVariantOptions({
    loaded, variantValue, variants, formOnly
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

  const handleMutationsChange = React.useCallback(
    ({mutations}, anyErrors) => mutations && onChange(
      'mutations', mutations.join(',')
    ),
    [onChange]
  );

  const handleMutMatchChange = React.useCallback(
    event => onChange(
      'mut_match', event.currentTarget.checked ? 'any' : 'all'
    ),
    [onChange]
  );

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
       direction="left"
       placeholder={EMPTY_TEXT}
       options={antibodyOptions}
       search={antibodySearch}
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
    ),
    variantDropdown: (
      <Dropdown
       search direction="left"
       placeholder={EMPTY_TEXT}
       options={variantOptions}
       onChange={handleChange('variant')}
       value={variantValue || defaultValue} />
    ),
    mutationsInput: (
      isConfigPending ? null :
      <div>
        <MutationsInput
         config={config}
         className={style['mutations-input']}
         mutations={
           mutationText.split(',')
             .map(m => m.trim())
             .filter(m => m)
         }
         onChange={handleMutationsChange} />
        <CheckboxInput
         id="mut_match"
         name="mut_match"
         className={style['mutation-match-checkbox']}
         onChange={handleMutMatchChange}
         disabled={mutationText.length === 0}
         checked={mutationMatch === 'any'}>
          Display results matching any of the input mutations
        </CheckboxInput>
      </div>
    )
  });

}
