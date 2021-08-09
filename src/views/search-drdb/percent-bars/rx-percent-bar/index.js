import React from 'react';

import {
  useVaccineNumExpLookup, 
  useAntibodyNumExpLookup,
  useInfectedVariantNumExpLookup
} from '../../hooks';

import Vaccines from '../../hooks/vaccines';
import Antibodies from '../../hooks/antibodies';
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
  } = Vaccines.useMe();

  const {
    antibodies,
    antibodyLookup,
    isPending: isAbListPending
  } = Antibodies.useMe();

  const {
    infectedVariants: infVariants,
    isPending: isInfVarListPending
  } = InfectedVariants.useMe();

  const [vaccNumExpLookup, isVaccNumExpPending] = useVaccineNumExpLookup();
  const [abNumExpLookup, isAbNumExpPending] = useAntibodyNumExpLookup(
    /* skip = */false,
    /* abAggregateBy = */'antibody'
  );
  const [
    infVarNumExpLookup,
    isInfVarNumExpPending
  ] = useInfectedVariantNumExpLookup();

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
          filteredInfVarNumExpLookup = infVarNumExpLookup;
        const filterByVaccine = vaccineName;
        const filterByAntibody = (abNames && abNames.length > 0);
        const filterByInfVar = infectedVarName;
        if (filterByVaccine || filterByAntibody || filterByInfVar) {
          filteredVaccNumExpLookup = {};
          filteredAbNumExpLookup = {};
          filteredInfVarNumExpLookup = {};
          if (filterByVaccine && vaccineName !== 'any') {
            filteredVaccNumExpLookup[vaccineName] =
              vaccNumExpLookup[vaccineName] || 0;
          }
          else if (filterByAntibody) {
            if (abNames[0] === 'any') {
              filteredAbNumExpLookup = abNumExpLookup;
            }
            else {
              filteredAbNumExpLookup.__ANY =
              filteredAbNumExpLookup[abNames] =
                abNumExpLookup[abNames] || 0;
            }
          }
          else if (infectedVarName !== 'any') {
            filteredInfVarNumExpLookup[infectedVarName] =
              infVarNumExpLookup[infectedVarName] || 0;
          }
        }

        return prepareItems({
          vaccines,
          antibodies,
          antibodyLookup,
          infVariants,
          vaccNumExpLookup: filteredVaccNumExpLookup,
          abNumExpLookup: filteredAbNumExpLookup,
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
      infVarNumExpLookup
    ]
  );

  return <>
    <PercentBar>
      {presentRx.map(
        ({
          pcnt,
          item
        }, index) => (
          <VariantRxItem
           key={item.name}
           styleType="rx"
           descComponent={RxDesc}
           {...{
             pcnt,
             item,
             index
           }} />
        )
      )}
    </PercentBar>
  </>;
}
