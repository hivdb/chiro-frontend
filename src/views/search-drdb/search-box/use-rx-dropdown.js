import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';

import {useConfig} from '../hooks';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';
const CP = 'cp';
const ANTIBODY = 'antibodies';
const VACCINE = 'vaccine';


function rxSearch(options, query) {
  if (query === '') {
    return options;
  }
  const re = new RegExp(escapeRegExp(query), 'i');
  return options.filter(rx => (
    rx.value && (
      re.test(rx.text) ||
      re.test(rx.value) ||
      (rx.synonyms && rx.synonyms.some(syn => re.test(syn)))
    )
  ));
}


function FragmentWithoutWarning({key, children}) {
  return <React.Fragment key={key}>{children}</React.Fragment>;
}


export default function useRxDropdown({
  loaded,
  convPlasmaValue,
  vaccines, vaccineValue,
  antibodies, antibodyValue,
  cpSuscResultCount,
  onChange,
  formOnly
}) {
  const {config, isPending: isConfigPending} = useConfig();
  const [includeAll, setIncludeAll] = React.useState(false);
  const onSearchChange = React.useCallback(
    (event, {searchQuery}) => {
      setIncludeAll(searchQuery !== '');
    },
    [setIncludeAll]
  );

  const options = React.useMemo(
    () => {
      if (!loaded || isConfigPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: 'cp-any',
            text: 'Convalescent plasma - any',
            value: 'cp-any',
            type: CP
          },
          ...(convPlasmaValue ? [{
            key: convPlasmaValue,
            text: convPlasmaValue,
            value: convPlasmaValue,
            type: CP
          }] : []),
          {
            key: 'vp-any',
            text: 'Vaccinee plasma - any',
            value: 'vp-any',
            type: VACCINE
          },
          ...(vaccineValue ? [{
            key: vaccineValue,
            text: vaccineValue,
            value: vaccineValue,
            type: VACCINE
          }] : []),
          {
            key: 'ab-any',
            text: 'MAb - any',
            value: 'ab-any',
            type: ANTIBODY
          },
          ...(
            antibodyValue && antibodyValue.length > 0 ?
              [{
                key: antibodyValue.join(','),
                text: antibodyValue.join(' + '),
                value: antibodyValue.join(','),
                type: ANTIBODY
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
          {
            key: 'cp-any',
            text: 'Convalescent plasma - any',
            value: 'cp-any',
            description: pluralize('result', cpSuscResultCount, true),
            type: CP
          },
          ...config.convPlasmaOptions.map(
            ({name, label}) => ({
              key: name,
              text: label,
              value: name,
              type: CP
            })
          ),
          {
            key: 'vaccine-divider',
            as: FragmentWithoutWarning,
            children: <Dropdown.Divider />
          },
          {
            key: 'vp-any',
            text: 'Vaccinee plasma - any',
            value: 'vp-any',
            type: VACCINE
          },
          ...vaccines
            .filter(({vaccineName}) => (
              includeAll ||
              vaccineName === vaccineValue ||
              !(/\+/.test(vaccineName))
            ))
            .map(
              ({vaccineName, suscResultCount}) => ({
                key: vaccineName,
                text: vaccineName,
                value: vaccineName,
                description: pluralize('result', suscResultCount, true),
                type: VACCINE
              })
            ),
          {
            key: 'antibody-divider',
            as: FragmentWithoutWarning,
            children: <Dropdown.Divider />
          },
          {
            key: 'ab-any',
            text: 'MAb - any',
            value: 'ab-any',
            type: ANTIBODY
          },
          ...((
            antibodyValue && antibodyValue.length > 0 &&
            (
              antibodyValue.length > 1 ||
              (antibodyValue[0] !== 'any' &&
               !antibodies.some(({abName}) => abName === antibodyValue[0]))
            )
          ) ?
            [{
              key: antibodyValue.join(','),
              text: antibodyValue.join(' + '),
              value: antibodyValue.join(','),
              type: ANTIBODY
            }] : []
          ),
          ...antibodies
            .filter(
              ({abName, visibility}) => (
                includeAll ||
                (antibodyValue && antibodyValue.includes(abName)) ||
                visibility === true
              )
            )
            .map(
              ({
                abName,
                abbreviationName: abbr,
                synonyms,
                abClass,
                suscResultCount
              }) => ({
                key: abName,
                text: abbr ? `${abName} (${abbr})` : abName,
                value: abName,
                type: ANTIBODY,
                description: pluralize('result', suscResultCount, true),
                synonyms
              })
            )
        ];
      }
    },
    [
      loaded, includeAll,
      config, isConfigPending,
      vaccines, antibodies,
      convPlasmaValue,
      vaccineValue, antibodyValue,
      cpSuscResultCount,
      formOnly
    ]
  );
  const handleChange = React.useCallback(
    (evt, {value, options}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        if (value === ANY) {
          const clear = {};
          clear[VACCINE] = undefined;
          clear[CP] = undefined;
          clear[ANTIBODY] = undefined;
          onChange(clear);
        }
        else if (value === 'ab-any') {
          onChange(ANTIBODY, 'any');
        }
        else if (value === 'cp-any') {
          onChange(CP, 'any');
        }
        else if (value === 'vp-any') {
          onChange(VACCINE, 'any');
        }
        else {
          const {type} = options.find(opt => opt.value === value);
          onChange(type, value);
        }
        setIncludeAll(false);
      }
    },
    [onChange]
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  let activeRx = defaultValue;
  if (antibodyValue && antibodyValue[0] === 'any') {
    activeRx = 'ab-any';
  }
  else if (convPlasmaValue === 'any') {
    activeRx = 'cp-any';
  }
  else if (vaccineValue === 'any') {
    activeRx = 'vp-any';
  }
  else if (antibodyValue && antibodyValue.length > 0) {
    activeRx = antibodyValue.join(',');
  }
  else if (convPlasmaValue) {
    activeRx = convPlasmaValue;
  }
  else if (vaccineValue) {
    activeRx = vaccineValue;
  }
  return (
    <Dropdown
     direction="right"
     search={rxSearch}
     options={options}
     placeholder={EMPTY_TEXT}
     onChange={handleChange}
     onSearchChange={onSearchChange}
     value={activeRx} />
  );
}
