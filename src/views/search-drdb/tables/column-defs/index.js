import React from 'react';
import uniq from 'lodash/uniq';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import useFold from './fold';
import CellAssay from './cell-assay';
import usePotency from './potency';
import CellSection from './cell-section';
import {useInfectedIsoName} from './isolate';
import {useControlVarName} from './variant';
import useIsoAggkey from './isolate-agg';
import useRefName from './reference';
import CellAntibodies from './cell-antibodies';
import CellRLevel from './cell-resistance-level';
import useCumulativeCount from './cumulative-count';
import useDataAvailability from './data-availability';
import {
  useCompareSuscResultsByInfectedIsolate,
  useCompareSuscResultsByAntibodies
} from '../../hooks';

import Articles from '../../hooks/articles';
import Antibodies from '../../hooks/antibodies';
import Isolates from '../../hooks/isolates';
import IsolateAggs, {compareIsolateAggs} from '../../hooks/isolate-aggs';
import Variants from '../../hooks/variants';


function getColDefLookup({
  isolateAggLookup,
  variantLookup,
  antibodyLookup,
  compareByAntibodies,
  labels = {}
}) {
  const lookup = {
    assayName: new ColumnDef({
      name: 'assayName',
      label: labels.assayName || 'Assay',
      render: assayName => (
        <CellAssay assayName={assayName} />
      )
    }),
    abNames: new ColumnDef({
      name: 'abNames',
      label: labels.abNames || 'Antibodies',
      render: abNames => <CellAntibodies {...{abNames, antibodyLookup}} />,
      sort: rows => [...rows].sort(compareByAntibodies)
    }),
    section: new ColumnDef({
      name: 'section',
      label: labels.section,
      render: section => <CellSection {...{section}} />,
      decorator: section => (
        section instanceof Array ?
          uniq(section)
            .sort()
            .join('; ') : section
      )
    }),
    numStudies: new ColumnDef({
      name: 'numStudies',
      label: labels.numStudies || '# Publications',
      decorator: (_, {refName}) => (
        refName instanceof Array ? uniq(refName).length : 1
      )
    }),
    vaccineName: new ColumnDef({
      name: 'vaccineName',
      label: labels.vaccineName || 'Vaccine'
    }),
    timing: new ColumnDef({
      name: 'timing',
      label: labels.timing
    }),
    timingRange: new ColumnDef({
      name: 'timingRange',
      label: labels.timingRange,
      exportCell: cellData => `${cellData}m`
    }),
    dosage: new ColumnDef({
      name: 'dosage',
      label: labels.dosage
    }),
    severity: new ColumnDef({
      name: 'severity',
      label: labels.severity
    }),
    resistanceLevel: new ColumnDef({
      name: 'resistanceLevel',
      label: labels.resistanceLevel,
      render: resistanceLevel => <CellRLevel rLevel={resistanceLevel} />
    })
  };
  return lookup;
}


export default function useColumnDefs({
  columns,
  labels
}) {
  const {
    articleLookup,
    isPending: isRefLookupPending
  } = Articles.useMe();
  const {
    antibodyLookup,
    isPending: isAbLookupPending
  } = Antibodies.useAll();
  const {
    isolateLookup,
    isPending: isIsoLookupPending
  } = Isolates.useMe();
  const {
    isolateAggLookup,
    isPending: isIsoAggLookupPending
  } = IsolateAggs.useMe();
  const {
    variantLookup,
    isPending: isVarLookupPending
  } = Variants.useMe();

  const compareByAntibodies = (
    useCompareSuscResultsByAntibodies(antibodyLookup)
  );
  const compareByInfectedIsolate = (
    useCompareSuscResultsByInfectedIsolate(isolateLookup)
  );

  const skip = (
    isRefLookupPending ||
    isAbLookupPending ||
    isIsoLookupPending ||
    isIsoAggLookupPending ||
    isVarLookupPending
  );

  const commonArgs = {
    articleLookup,
    antibodyLookup,
    isolateLookup,
    isolateAggLookup,
    variantLookup,
    compareByAntibodies,
    compareByInfectedIsolate,
    labels,
    columns,
    skip
  };

  const refName = useRefName(commonArgs);
  const controlVarName = useControlVarName(commonArgs);
  const infectedIsoName = useInfectedIsoName(commonArgs);
  const isoAggkey = useIsoAggkey(commonArgs);
  const cumulativeCount = useCumulativeCount(commonArgs);
  const potency = usePotency(commonArgs);
  const fold = useFold(commonArgs);
  const dataAvailability = useDataAvailability(commonArgs);

  const lookup = React.useMemo(
    () => ({
      refName,
      controlVarName,
      infectedIsoName,
      isoAggkey,
      cumulativeCount,
      potency,
      fold,
      dataAvailability
    }),
    [
      refName,
      controlVarName,
      infectedIsoName,
      isoAggkey,
      cumulativeCount,
      potency,
      fold,
      dataAvailability
    ]
  );

  return React.useMemo(
    () => {
      if (skip) {
        return [];
      }
      const oldLookup = getColDefLookup({
        antibodyLookup,
        isolateLookup,
        isolateAggLookup,
        variantLookup,
        compareByAntibodies,
        compareByInfectedIsolate,
        labels
      });
      return columns.map(
        name => lookup[name] || oldLookup[name]
      ).filter(cd => cd);
    },
    [
      skip,
      antibodyLookup,
      isolateLookup,
      isolateAggLookup,
      variantLookup,
      compareByAntibodies,
      compareByInfectedIsolate,
      columns,
      labels,
      lookup
    ]
  );
}
