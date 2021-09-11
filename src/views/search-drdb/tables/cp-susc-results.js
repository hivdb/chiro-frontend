import useColumnDefs from './column-defs';
import useRenderSuscResults from './use-render-susc-results';
import colDefStyle from './column-defs/style.module.scss';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';
import style from '../style.module.scss';

const INDIV_MUT_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'infectedVarName',
  'timingRange',
  'subjectSpecies',
  // 'severity',
  'controlVarName',
  'isoAggkey',
  'numStudies',
  'cumulativeCount',
  'potency',
  'fold',
  'dataAvailability'
];

const INDIV_MUT_LABELS = {
  isoAggkey: 'Mutation',
  timingRange: 'Months',
  potency: <>
    NT50 Dilution{' '}
    <span className={style['nowrap']}>
      (GeoMean
      <span className={colDefStyle['mul-div-sign']}>
        ×÷
      </span>GSD)
    </span>
  </>,
  fold: <>
    Fold Reduction{' '}
    <span className={style['nowrap']}>
      (Mean±SD)
    </span>
  </>
};

const INDIV_MUT_GROUP_BY = [
  'refName',
  'assayName',
  'infectedVarName',
  'timingRange',
  'subjectSpecies',
  'controlVarName',
  'isoAggkey',
  'numMutations',
  'rxType'
];

const INDIV_MUT_DEFAULT_GROUP_BY = [
  'refName',
  'assayName',
  'infectedVarName',
  'timingRange',
  'controlVarName',
  'isoAggkey',
  'numMutations',
  'rxType'
];

const COMBO_MUTS_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'infectedVarName',
  'timingRange',
  'subjectSpecies',
  // 'severity',
  'controlVarName',
  'isoAggkey',
  'numStudies',
  'cumulativeCount',
  'potency',
  'fold',
  'dataAvailability'
];

const COMBO_MUTS_LABELS = {
  isoAggkey: 'Variant',
  timingRange: 'Months',
  potency: <>
    NT50 Dilution{' '}
    <span className={style['nowrap']}>
      (GeoMean
      <span className={style['mul-div-sign']}>
        ×÷
      </span>GSD)
    </span>
  </>,
  fold: <>
    Fold Reduction{' '}
    <span className={style['nowrap']}>
      (Mean±SD)
    </span>
  </>
};

const COMBO_MUTS_GROUP_BY = [
  'refName',
  'assayName',
  'infectedVarName',
  'timingRange',
  'subjectSpecies',
  // 'severity',
  'controlVarName',
  'isoAggkey',
  'numMutations',
  'rxType'
];

const COMBO_MUTS_DEFAULT_GROUP_BY = [
  'refName',
  'assayName',
  'infectedVarName',
  'timingRange',
  'controlVarName',
  'isoAggkey',
  'numMutations',
  'rxType'
];


export default function CPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey});

  const {suscResults, isPending} = SuscResults.useCP();

  const indivMutColumnDefs = useColumnDefs({
    columns: INDIV_MUT_COLUMNS,
    labels: INDIV_MUT_LABELS
  });

  const comboMutsColumnDefs = useColumnDefs({
    columns: COMBO_MUTS_COLUMNS,
    labels: COMBO_MUTS_LABELS
  });

  return useRenderSuscResults({
    loaded: !isPending,
    id: 'cp-susc-results',
    cacheKey,
    suscResults,
    indivMutColumnDefs,
    indivMutGroupBy: INDIV_MUT_GROUP_BY,
    indivMutDefaultGroupBy: INDIV_MUT_DEFAULT_GROUP_BY,
    comboMutsColumnDefs,
    comboMutsGroupBy: COMBO_MUTS_GROUP_BY,
    comboMutsDefaultGroupBy: COMBO_MUTS_DEFAULT_GROUP_BY,
    footnoteMean: true
  });
}
