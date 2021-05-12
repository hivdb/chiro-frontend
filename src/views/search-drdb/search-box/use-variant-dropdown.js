import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import shortenMutList from '../shorten-mutlist';
import {compareMutations} from '../hooks';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


function FragmentWithoutWarning({key, children}) {
  return <React.Fragment key={key}>{children}</React.Fragment>;
}


function useMutOptions({loaded, isolates}) {

  return React.useMemo(
    () => {
      if (!loaded) {
        return [];
      }
      return Object.values(
        isolates
          .filter(({mutations, type, numMuts, suscResultCount}) => (
            type !== 'named-variant' &&
            suscResultCount > 0 &&
            numMuts > 0
          ))
          .reduce(
            (acc, {mutations, suscResultCount}) => {
              const mutsWithout614G = mutations
                .filter(
                  ({gene, position, aminoAcid}) => !(
                    gene === 'S' && position === 614 && aminoAcid === 'G'
                  )
                );
              const value = (mutsWithout614G
                .map(
                  ({gene, position, aminoAcid}) => (
                    `${gene}:${position}${aminoAcid}`
                  )
                )
                .join(',')
              );
              acc[value] = acc[value] || {
                mutations: mutsWithout614G,
                value,
                suscResultCount: 0
              };
              acc[value].suscResultCount += suscResultCount;
              return acc;
            },
            {}
          )
      ).sort((opt1, opt2) => {
        let cmp = - (opt1.suscResultCount - opt2.suscResultCount);
        if (cmp !== 0) {
          return cmp;
        }
        return compareMutations(opt1.mutations, opt2.mutations);
      });
    },
    [loaded, isolates]
  );
}


export default function useVariantDropdown({
  loaded,
  variants,
  isolates,
  variantValue,
  mutations,
  mutationText,
  onChange,
  formOnly
}) {
  const [includeAll, setIncludeAll] = React.useState(false);
  const mutOptions = useMutOptions({loaded, isolates});
  const variantOptions = React.useMemo(
    () => {
      if (!loaded) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          ...(variantValue ? [{
            key: variantValue,
            text: variantValue,
            value: variantValue
          }] : []),
          ...(mutationText ? [{
            key: mutationText,
            text: shortenMutList(mutations).join(' + '),
            value: mutationText
          }] : [])
        ];
      }
      else {
        const inMutOptions = mutOptions.some(
          ({value}) => mutationText === value
        );
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
            key: 'vaccine-divider',
            as: FragmentWithoutWarning,
            children: <Dropdown.Divider />
          },
          ...variants
            .filter(({suscResultCount}) => (
              includeAll || suscResultCount >= 20
            ))
            .map(
              ({varName, suscResultCount}) => ({
                key: varName,
                text: varName,
                value: varName,
                type: 'variant',
                description: `${suscResultCount} results`
              })
            ),
          {
            key: 'combomut-divider',
            as: FragmentWithoutWarning,
            children: <Dropdown.Divider />
          },
          ...(inMutOptions ? [] : [{
            key: mutationText,
            text: shortenMutList(mutations).join(' + '),
            value: mutationText,
            type: 'mutations'
          }]),
          ...mutOptions
            .filter(({suscResultCount}) => (
              includeAll || suscResultCount >= 5
            ))
            .map(
              ({value, mutations, suscResultCount}) => ({
                key: value,
                text: shortenMutList(mutations).join(' + '),
                value,
                type: 'mutations',
                description: `${suscResultCount} results`
              })
            )
        ];
      }
    },
    [
      loaded, includeAll, variants, mutOptions,
      variantValue, mutations, mutationText, formOnly
    ]
  );

  const handleSearchChange = React.useCallback(
    (evt, {searchQuery}) => setIncludeAll(searchQuery !== ''),
    [setIncludeAll]
  );

  const handleChange = React.useCallback(
    (evt, {value, options}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        if (value === ANY) {
          onChange({
            variant: undefined,
            mutations: undefined
          });
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

  return (
    <Dropdown
     search direction="right"
     placeholder={EMPTY_TEXT}
     options={variantOptions}
     onChange={handleChange}
     onSearchChange={handleSearchChange}
     value={variantValue || mutationText || defaultValue} />
  );
}
