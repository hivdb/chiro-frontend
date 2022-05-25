import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';

import {NumExpStats} from '../hooks/susc-summary';
import InVitroMutations from '../hooks/invitro-mutations';
import InVivoMutations from '../hooks/invivo-mutations';
import DMSMutations from '../hooks/dms-mutations';
import InfectedVariants from '../hooks/infected-variants';
import LocationParams from '../hooks/location-params';

import useOnChangeWithLoading from './use-on-change-with-loading';
import Desc from './desc';
import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = 'empty';
const ANY = 'any';
const CP_ANY = 'cp-any';
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


export default function useInfectedVariantDropdown() {
  const {
    infectedVariants,
    isPending: isInfectedVarsPending
  } = InfectedVariants.useMe();

  const [infVarNumExpLookup, isInfVarNumExpPending] = NumExpStats.useInfVar();

  const {
    params: {
      infectedVarName: paramInfectedVarName,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const [
    numInVitroMuts,
    isInVitroMutsPending
  ] = InVitroMutations.useSummaryByRx();
  const [
    numInVivoMuts,
    isInVivoMutsPending
  ] = InVivoMutations.useSummaryByRx();
  const [
    numDMSMuts,
    isDMSMutsPending
  ] = DMSMutations.useSummaryByRx();

  const isPending = (
    isInfectedVarsPending ||
    isInfVarNumExpPending ||
    isInVitroMutsPending ||
    isInVivoMutsPending ||
    isDMSMutsPending
  );

  const finalInfVarNumExpLookup = React.useMemo(
    () => {
      if (isPending) {
        return [0, {}];
      }
      const finalInfVarNumExpLookup = {...infVarNumExpLookup};
      for (const {infectedVarNames, infectedVarName, count} of [
        ...numInVitroMuts,
        ...numInVivoMuts,
        ...numDMSMuts
      ]) {
        finalInfVarNumExpLookup[ANY] += count;

        if (infectedVarNames) {
          for (const infVarName of infectedVarNames) {
            if (infVarName) {
              finalInfVarNumExpLookup[infVarName] =
                finalInfVarNumExpLookup[infVarName] || 0;
              finalInfVarNumExpLookup[infVarName] += count;
            }
          }
          if (infectedVarNames.length > 0) {
            finalInfVarNumExpLookup[ANY] += count;
          }
        }
        else if (infectedVarName) {
          finalInfVarNumExpLookup[infectedVarName] =
            finalInfVarNumExpLookup[infectedVarName] || 0;
          finalInfVarNumExpLookup[infectedVarName] += count;
          finalInfVarNumExpLookup[CP_ANY] += count;
        }
      }

      return finalInfVarNumExpLookup;
    },
    [
      isPending,
      infVarNumExpLookup,
      numInVitroMuts,
      numInVivoMuts,
      numDMSMuts
    ]
  );

  const activeRx = React.useMemo(
    () => {
      const defaultValue = formOnly ? EMPTY : ANY;

      let activeRx = defaultValue;
      if (paramInfectedVarName === 'any') {
        activeRx = CP_ANY;
      }
      else if (paramInfectedVarName) {
        activeRx = paramInfectedVarName;
      }
      return activeRx;
    },
    [formOnly, paramInfectedVarName]
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
            key: CP_ANY,
            text: 'Any CP',
            value: CP_ANY,
            type: CP
          },
          ...(paramInfectedVarName && paramInfectedVarName !== 'any' ? [{
            key: paramInfectedVarName,
            text: paramInfectedVarName,
            value: paramInfectedVarName,
            type: CP
          }] : [])
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
            description: <Desc n={
              finalInfVarNumExpLookup[CP_ANY] ?
                finalInfVarNumExpLookup[ANY] : 0
            } />
          },
          ...(finalInfVarNumExpLookup[CP_ANY] > 0 ? [
            {
              key: 'cp-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            {
              key: CP_ANY,
              text: 'Any CP',
              value: CP_ANY,
              description: <Desc n={finalInfVarNumExpLookup[CP_ANY]} />,
              type: CP
            },
            ...infectedVariants
              .map(
                ({varName, synonyms}) => ({
                  key: varName,
                  text: `${
                    synonyms.length > 0 ?
                      `${varName} (${synonyms[0]})` :
                      varName
                  }`,
                  value: varName,
                  type: CP,
                  description: (
                    <Desc n={finalInfVarNumExpLookup[varName] || 0} />
                  ),
                  'data-num-exp': finalInfVarNumExpLookup[varName] || 0
                })
              )
              .filter(v => v['data-num-exp'] > 0)
              .sort((a, b) => b['data-num-exp'] - a['data-num-exp'])
          ] : [])
        ];
      }
    },
    [
      isPending,
      paramInfectedVarName,
      formOnly,
      finalInfVarNumExpLookup,
      infectedVariants
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
        else if (value === CP_ANY) {
          onChange(CP, 'any');
        }
        else {
          const {type} = options.find(opt => opt.value === value);
          onChange(type, value);
        }
      }
    },
    [onChange]
  );

  const containerRef = React.useRef();

  const handleChangeWithLoading = useOnChangeWithLoading(
    handleChange,
    containerRef
  );

  return (
    <div
     ref={containerRef}
     data-loading={isPending ? '' : undefined}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       direction="right"
       search={rxSearch}
       options={options}
       placeholder={EMPTY_TEXT}
       onChange={handleChangeWithLoading}
       value={activeRx} />
    </div>
  );
}
