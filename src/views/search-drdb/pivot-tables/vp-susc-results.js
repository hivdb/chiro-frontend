import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';

import SuscResults from '../hooks/susc-results';
import LocationParams from '../hooks/location-params';
import style from '../style.module.scss';

const INDIV_MUT_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'vaccineName',
  'dosage',
  'timing',
  'controlIsoName',
  'isoName',
  'cumulativeCount',
  'potency',
  'fold',
  'dataAvailability'
];

const INDIV_MUT_LABELS = {
  isoName: 'Mutation',
  dosage: '# Shots',
  timing: 'Months',
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

const INDIV_MUT_GROUP_BY = [
  'refName',
  'assayName',
  'vaccineName',
  'dosage',
  'timing',
  'controlIsoName',
  'isoName',
  'potencyType',
  'potencyUnit',
  'rxType'
];

const COMBO_MUTS_COLUMNS = [
  'refName',
  'assayName',
  'section',
  'vaccineName',
  'dosage',
  'timing',
  'controlIsoName',
  'isoName',
  'cumulativeCount',
  'potency',
  'fold',
  'dataAvailability'
];

const COMBO_MUTS_LABELS = {
  isoName: 'Variant',
  dosage: '# Shots',
  timing: 'Months',
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
  'vaccineName',
  'dosage',
  'timing',
  'controlIsoName',
  'isoName',
  'potencyType',
  'potencyUnit',
  'rxType'
];


export default function VPSuscResults() {
  const {
    params: {
      refName,
      isoAggkey,
      vaccineName
    }
  } = LocationParams.useMe();
  const cacheKey = JSON.stringify({refName, isoAggkey, vaccineName});
  const {suscResults, isPending} = SuscResults.useVP();

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
    id: 'vp-susc-results',
    cacheKey,
    suscResults,
    indivMutColumnDefs,
    indivMutGroupBy: INDIV_MUT_GROUP_BY,
    comboMutsColumnDefs,
    comboMutsGroupBy: COMBO_MUTS_GROUP_BY,
    footnoteMean: true
  });
}
