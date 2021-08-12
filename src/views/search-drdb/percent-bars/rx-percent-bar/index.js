import React from 'react';
import {csvStringify} from 'sierra-frontend/dist/utils/csv';

import Vaccines from '../../hooks/vaccines';
import Antibodies from '../../hooks/antibodies';
import {NumExpStats} from '../../hooks/susc-summary';
import InfectedVariants from '../../hooks/infected-variants';
import LocationParams from '../../hooks/location-params';

import PercentBar from '../../../../components/percent-bar';

import prepareItems from './prepare-items';
import VariantRxItem from '../item';
import RxDesc from './desc';


export default function RxPercentBar() {
  const {
    params: {
      vaccineName,
      infectedVarName,
      abNames
    }
  } = LocationParams.useMe();

  const {
    vaccines,
    isPending: isVaccListPending
  } = Vaccines.useAll();

  const {
    antibodies,
    antibodyLookup,
    isPending: isAbListPending
  } = Antibodies.useAll();

  const {
    infectedVariants: infVariants,
    isPending: isInfVarListPending
  } = InfectedVariants.useMe();

  const [vaccNumExpLookup, isVaccNumExpPending] = NumExpStats.useVacc();
  const [
    abNumExpLookup,
    isAbNumExpPending,
    orderedAbNames
  ] = NumExpStats.useAb(
    /* abAggregateBy = */'antibody'
  );
  const [
    infVarNumExpLookup,
    isInfVarNumExpPending
  ] = NumExpStats.useInfVar();

  const isPending = (
    isVaccListPending ||
    isAbListPending ||
    isInfVarListPending ||
    isVaccNumExpPending ||
    isAbNumExpPending ||
    isInfVarNumExpPending
  );

  const presentRx = React.useMemo(
    () => {
      if (isPending) {
        return [];
      }
      else {
        let filteredVaccNumExpLookup = vaccNumExpLookup,
          filteredAbNumExpLookup = abNumExpLookup,
          filteredOrderedAbNames = orderedAbNames,
          filteredInfVarNumExpLookup = infVarNumExpLookup;
        const filterByVaccine = vaccineName;
        const filterByAntibody = (abNames && abNames.length > 0);
        const filterByInfVar = infectedVarName;
        if (filterByVaccine || filterByAntibody || filterByInfVar) {
          filteredVaccNumExpLookup = {};
          filteredAbNumExpLookup = {};
          filteredOrderedAbNames = [];
          filteredInfVarNumExpLookup = {};
          if (filterByVaccine) {
            if (vaccineName === 'any') {
              filteredVaccNumExpLookup = vaccNumExpLookup;
            }
            else {
              filteredVaccNumExpLookup[vaccineName] =
                vaccNumExpLookup[vaccineName] || 0;
            }
          }
          else if (filterByAntibody) {
            if (abNames[0] === 'any') {
              filteredAbNumExpLookup = abNumExpLookup;
              filteredOrderedAbNames = orderedAbNames;
            }
            else {
              filteredOrderedAbNames = orderedAbNames.filter(
                myAbNames => abNames.every(
                  abName => myAbNames.includes(abName)
                )
              );
              let total = 0;
              for (const abNamesArr of filteredOrderedAbNames) {
                const abNamesText = csvStringify(abNamesArr);
                const num = abNumExpLookup[abNamesText] || 0;
                filteredAbNumExpLookup[abNamesText] = num;
                total += num;
              }
              filteredAbNumExpLookup.__ANY = total;
            }
          }
          else if (infectedVarName) {
            if (infectedVarName === 'any') {
              filteredInfVarNumExpLookup = infVarNumExpLookup;
            }
            else {
              filteredInfVarNumExpLookup[infectedVarName] =
              infVarNumExpLookup[infectedVarName] || 0;
            }
          }
        }

        return prepareItems({
          vaccines,
          antibodies,
          antibodyLookup,
          infVariants,
          paramAbNames: abNames,
          vaccNumExpLookup: filteredVaccNumExpLookup,
          abNumExpLookup: filteredAbNumExpLookup,
          orderedAbNames: filteredOrderedAbNames,
          infVarNumExpLookup: filteredInfVarNumExpLookup
        });
      }
    },
    [
      isPending,
      vaccineName,
      abNames,
      infectedVarName,
      vaccines,
      antibodies,
      antibodyLookup,
      infVariants,
      vaccNumExpLookup,
      abNumExpLookup,
      orderedAbNames,
      infVarNumExpLookup
    ]
  );

  return <>
    <PercentBar scaleRatio={0.75}>
      {presentRx.map(
        ({
          index,
          indexGroup,
          pcnt,
          item
        }) => (
          <VariantRxItem
           key={item.name}
           styleType="rx"
           descComponent={RxDesc}
           {...{
             pcnt,
             item,
             indexGroup,
             index
           }} />
        )
      )}
    </PercentBar>
  </>;
}
