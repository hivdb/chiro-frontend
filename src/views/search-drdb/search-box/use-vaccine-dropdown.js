import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';

import Vaccines from '../hooks/vaccines';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';

import useOnChangeWithLoading from './use-on-change-with-loading';
import Desc from './desc';
import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = 'empty';
const ANY = 'any';
const VP_ANY = 'vp-any';
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


export default function useVaccineDropdown() {
  const [includeAll, setIncludeAll] = React.useState(false);
  const onSearchChange = React.useCallback(
    (event, {searchQuery}) => {
      setIncludeAll(searchQuery !== '');
    },
    [setIncludeAll]
  );
  const {
    vaccines,
    isPending: isVaccinesPending
  } = Vaccines.useAll();

  const [vaccNumExpLookup, isVaccNumExpPending] = NumExpStats.useVacc();

  const {
    params: {
      vaccineName: paramVaccineName,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const isPending = (
    isVaccinesPending ||
    isVaccNumExpPending
  );

  const options = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: ANY,
            text: 'Any',
            value: ANY
          },
          {
            key: VP_ANY,
            text: 'Any VP',
            value: VP_ANY,
            type: VACCINE
          },
          ...(paramVaccineName && paramVaccineName !== 'any' ? [{
            key: paramVaccineName,
            text: paramVaccineName,
            value: paramVaccineName,
            type: VACCINE
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
            key: ANY,
            text: 'Any',
            value: ANY,
            description: <Desc n={
              vaccNumExpLookup[VP_ANY] ?
                vaccNumExpLookup[ANY] : 0
            } />
          },
          ...(vaccNumExpLookup[VP_ANY] > 0 ? [
            {
              key: 'vaccine-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            {
              key: VP_ANY,
              text: 'Any VP',
              value: VP_ANY,
              type: VACCINE,
              description: <Desc n={vaccNumExpLookup[VP_ANY]} />
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
                  description: (
                    <Desc n={vaccNumExpLookup[vaccineName] || 0} />
                  ),
                  'data-num-exp': vaccNumExpLookup[vaccineName] || 0,
                  type: VACCINE
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
      paramVaccineName,
      formOnly,
      vaccNumExpLookup,
      vaccines,
      includeAll
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
        else if (value === VP_ANY) {
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

  const containerRef = React.useRef();

  const handleChangeWithLoading = useOnChangeWithLoading(
    handleChange,
    containerRef
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  let activeRx = defaultValue;
  if (paramVaccineName === 'any') {
    activeRx = VP_ANY;
  }
  else if (paramVaccineName) {
    activeRx = paramVaccineName;
  }
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
       onSearchChange={onSearchChange}
       value={activeRx} />
    </div>
  );
}
