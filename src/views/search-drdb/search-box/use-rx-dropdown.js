import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';
import capitalize from 'lodash/capitalize';
import escapeRegExp from 'lodash/escapeRegExp';

import Antibodies from '../hooks/antibodies';
import Vaccines from '../hooks/vaccines';
import {NumExpStats} from '../hooks/susc-summary';
import InVitroMutations from '../hooks/invitro-mutations';
import InVivoMutations from '../hooks/invivo-mutations';
import DMSMutations from '../hooks/dms-mutations';
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
  } = Antibodies.useAll();

  const {
    vaccines,
    isPending: isVaccinesPending
  } = Vaccines.useAll();

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

  const [
    numInVitroMutsByAbs,
    isInVitroMutsByAbsPending
  ] = InVitroMutations.useSummaryByAntibodies();
  const [
    numInVitroMutsByInfVar,
    isInVitroMutsByInfVarPending
  ] = InVitroMutations.useSummaryByInfVar();
  const [
    numInVivoMutsByAbs,
    isInVivoMutsByAbsPending
  ] = InVivoMutations.useSummaryByAntibodies();
  const [
    numInVivoMutsByInfVar,
    isInVivoMutsByInfVarPending
  ] = InVivoMutations.useSummaryByInfVar();
  const [
    numDMSMutsByAbs,
    isDMSMutsByAbsPending
  ] = DMSMutations.useSummaryByAntibodies();

  const isPending = (
    isAntibodiesPending ||
    isVaccinesPending ||
    isInfectedVarsPending ||
    isRxTotalNumExpPending ||
    isAbNumExpPending ||
    isVaccNumExpPending ||
    isInfVarNumExpPending ||
    isInVitroMutsByAbsPending ||
    isInVitroMutsByInfVarPending ||
    isInVivoMutsByAbsPending ||
    isInVivoMutsByInfVarPending ||
    isDMSMutsByAbsPending
  );

  const [
    finalRxTotalNumExp,
    finalAbNumExpLookup,
    finalVaccNumExpLookup,
    finalInfVarNumExpLookup
  ] = React.useMemo(
    () => {
      if (isPending) {
        return [0, {}, {}, {}];
      }
      let finalRxTotalNumExp = rxTotalNumExp;
      const finalAbNumExpLookup = {...abNumExpLookup};
      const finalVaccNumExpLookup = {...vaccNumExpLookup};
      const finalInfVarNumExpLookup = {...infVarNumExpLookup};
      for (const {abNames, count} of [
        ...numInVitroMutsByAbs,
        ...numInVivoMutsByAbs,
        ...numDMSMutsByAbs
      ]) {
        // finalRxTotalNumExp += count;
        for (const abName of abNames) {
          finalAbNumExpLookup[abName] = finalAbNumExpLookup[abName] || 0;
          finalAbNumExpLookup[abName] += count;
        }
        finalAbNumExpLookup[ANY] += count;
      }

      for (const {infectedVarName, count} of [
        ...numInVitroMutsByInfVar,
        ...numInVivoMutsByInfVar
      ]) {
        finalRxTotalNumExp += count;
        finalInfVarNumExpLookup[infectedVarName] =
          finalInfVarNumExpLookup[infectedVarName] || 0;
        finalInfVarNumExpLookup[infectedVarName] += count;
        finalInfVarNumExpLookup[ANY] += count;
      }
      return [
        finalRxTotalNumExp,
        finalAbNumExpLookup,
        finalVaccNumExpLookup,
        finalInfVarNumExpLookup
      ];
    },
    [
      isPending,
      rxTotalNumExp,
      abNumExpLookup,
      vaccNumExpLookup,
      infVarNumExpLookup,
      numInVitroMutsByAbs,
      numInVivoMutsByAbs,
      numDMSMutsByAbs,
      numInVitroMutsByInfVar,
      numInVivoMutsByInfVar
    ]
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
            text: `${capitalize(paramInfectedVarName)} infection`,
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
              finalRxTotalNumExp,
              true
            )
          },
          ...(finalInfVarNumExpLookup[ANY] > 0 ? [
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
                finalInfVarNumExpLookup[ANY],
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
                      `${capitalize(varName)} (${synonyms[0]})` :
                      capitalize(varName)
                  } infection`,
                  value: varName,
                  type: CP,
                  description: pluralize(
                    'result',
                    finalInfVarNumExpLookup[varName] || 0,
                    true
                  ),
                  'data-num-exp': finalInfVarNumExpLookup[varName] || 0
                })
              )
              .filter(v => v['data-num-exp'] > 0)
              .sort((a, b) => b['data-num-exp'] - a['data-num-exp'])
          ] : []),
          ...(finalVaccNumExpLookup[ANY] > 0 ? [
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
                finalVaccNumExpLookup[ANY],
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
                    finalVaccNumExpLookup[vaccineName] || 0,
                    true
                  ),
                  'data-num-exp': finalVaccNumExpLookup[vaccineName] || 0,
                  type: VACCINE
                })
              )
              .filter(v => v['data-num-exp'] > 0)
              .sort((a, b) => b['data-num-exp'] - a['data-num-exp'])
          ] : []),
          ...(finalAbNumExpLookup[ANY] > 0 ? [
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
                finalAbNumExpLookup[ANY],
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
                    finalAbNumExpLookup[abName] || 0,
                    true
                  ),
                  'data-is-empty': !finalAbNumExpLookup[abName],
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
      finalAbNumExpLookup,
      finalVaccNumExpLookup,
      finalInfVarNumExpLookup,
      finalRxTotalNumExp
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
