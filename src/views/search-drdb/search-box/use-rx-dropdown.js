import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';

import Antibodies from '../hooks/antibodies';
import Vaccines from '../hooks/vaccines';
import {NumExpStats} from '../hooks/susc-summary';
import InfectedVariants from '../hooks/infected-variants';
import LocationParams from '../hooks/location-params';

import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


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


export default function useRxDropdown() {
  const [includeAll, setIncludeAll] = React.useState(false);
  const onSearchChange = React.useCallback(
    (event, {searchQuery}) => {
      setIncludeAll(searchQuery !== '');
    },
    [setIncludeAll]
  );

  const {
    antibodies,
    isPending: isAntibodiesPending
  } = Antibodies.useMe();

  const {
    vaccines,
    isPending: isVaccinesPending
  } = Vaccines.useMe();

  const {
    infectedVariants,
    isPending: isInfectedVarsPending
  } = InfectedVariants.useMe();

  const [rxTotalNumExp, isRxTotalNumExpPending] = NumExpStats.useRxTotal();
  const [abNumExpLookup, isAbNumExpPending] = NumExpStats.useAb();
  const [vaccNumExpLookup, isVaccNumExpPending] = NumExpStats.useVacc();
  const [infVarNumExpLookup, isInfVarNumExpPending] = NumExpStats.useInfVar();

  const {
    params: {
      infectedVarName: paramInfectedVarName,
      vaccineName: paramVaccineName,
      abNames: paramAbNames,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const isPending = (
    isAntibodiesPending ||
    isVaccinesPending ||
    isInfectedVarsPending ||
    isRxTotalNumExpPending ||
    isAbNumExpPending ||
    isVaccNumExpPending ||
    isInfVarNumExpPending
  );

  const options = React.useMemo(
    () => {
      if (isPending) {
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
          ...(paramInfectedVarName && paramInfectedVarName !== 'any' ? [{
            key: paramInfectedVarName,
            text: paramInfectedVarName,
            value: paramInfectedVarName,
            type: CP
          }] : []),
          {
            key: 'vp-any',
            text: 'Vaccinee plasma - any',
            value: 'vp-any',
            type: VACCINE
          },
          ...(paramVaccineName && paramVaccineName !== 'any' ? [{
            key: paramVaccineName,
            text: paramVaccineName,
            value: paramVaccineName,
            type: VACCINE
          }] : []),
          {
            key: 'ab-any',
            text: 'MAb - any',
            value: 'ab-any',
            type: ANTIBODY
          },
          ...(
            paramAbNames &&
            paramAbNames.length > 0 &&
            paramAbNames[0] !== 'any' ?
              [{
                key: paramAbNames.join(','),
                text: paramAbNames.join(' + '),
                value: paramAbNames.join(','),
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
            value: ANY,
            description: pluralize(
              'result',
              rxTotalNumExp,
              true
            )
          },
          ...(infVarNumExpLookup[ANY] > 0 ? [
            {
              key: 'cp-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            {
              key: 'cp-any',
              text: 'Convalescent plasma - any',
              value: 'cp-any',
              description: pluralize(
                'result',
                infVarNumExpLookup[ANY],
                true
              ),
              type: CP
            },
            ...infectedVariants
              .map(
                ({varName, synonyms}) => ({
                  key: varName,
                  text: `${
                    synonyms.length > 0 ?
                      `${varName} (${synonyms[0]})` : varName
                  } infection`,
                  value: varName,
                  type: CP,
                  description: pluralize(
                    'result',
                    infVarNumExpLookup[varName] || 0,
                    true
                  ),
                  'data-num-exp': infVarNumExpLookup[varName] || 0
                })
              )
              .filter(v => v['data-num-exp'] > 0)
              .sort((a, b) => b['data-num-exp'] - a['data-num-exp'])
          ] : []),
          ...(vaccNumExpLookup[ANY] > 0 ? [
            {
              key: 'vaccine-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            {
              key: 'vp-any',
              text: 'Vaccinee plasma - any',
              value: 'vp-any',
              type: VACCINE,
              description: pluralize(
                'result',
                vaccNumExpLookup[ANY],
                true
              )
            },
            ...vaccines
              .filter(({vaccineName}) => (
                includeAll ||
                vaccineName === paramVaccineName ||
                !(/\+/.test(vaccineName))
              ))
              .map(
                ({vaccineName}) => ({
                  key: vaccineName,
                  text: vaccineName,
                  value: vaccineName,
                  description: pluralize(
                    'result',
                    vaccNumExpLookup[vaccineName] || 0,
                    true
                  ),
                  'data-num-exp': vaccNumExpLookup[vaccineName] || 0,
                  type: VACCINE
                })
              )
              .filter(v => v['data-num-exp'] > 0)
              .sort((a, b) => b['data-num-exp'] - a['data-num-exp'])
          ] : []),
          ...(abNumExpLookup[ANY] > 0 ? [
            {
              key: 'antibody-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            {
              key: 'ab-any',
              text: 'MAb - any',
              value: 'ab-any',
              type: ANTIBODY,
              description: pluralize(
                'result',
                abNumExpLookup[ANY],
                true
              )
            },
            ...antibodies
              .map(
                ({
                  abName,
                  abbreviationName: abbr,
                  synonyms
                }) => ({
                  key: abName,
                  text: abbr ? `${abName} (${abbr})` : abName,
                  value: abName,
                  type: ANTIBODY,
                  description: pluralize(
                    'result',
                    abNumExpLookup[abName] || 0,
                    true
                  ),
                  'data-is-empty': !abNumExpLookup[abName],
                  synonyms
                })
              )
              .filter(v => !v['data-is-empty'])
              .sort((a, b) => a['data-is-empty'] - b['data-is-empty'])
          ] : [])
        ];
      }
    },
    [
      isPending,
      includeAll,
      vaccines,
      antibodies,
      infectedVariants,
      paramInfectedVarName,
      paramVaccineName,
      paramAbNames,
      formOnly,
      abNumExpLookup,
      vaccNumExpLookup,
      infVarNumExpLookup,
      rxTotalNumExp
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
  if (paramAbNames && paramAbNames[0] === 'any') {
    activeRx = 'ab-any';
  }
  else if (paramInfectedVarName === 'any') {
    activeRx = 'cp-any';
  }
  else if (paramVaccineName === 'any') {
    activeRx = 'vp-any';
  }
  else if (paramAbNames && paramAbNames.length > 0) {
    activeRx = paramAbNames.join(',');
  }
  else if (paramInfectedVarName) {
    activeRx = paramInfectedVarName;
  }
  else if (paramVaccineName) {
    activeRx = paramVaccineName;
  }
  return (
    <div
     data-loaded={!isPending}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       direction="right"
       search={rxSearch}
       options={options}
       placeholder={EMPTY_TEXT}
       onChange={handleChange}
       onSearchChange={onSearchChange}
       value={activeRx} />
    </div>
  );
}
