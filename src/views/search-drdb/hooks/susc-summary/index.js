import {SuscSummaryProvider} from './context';
import useAntibodyNumExp from './use-antibody-numexp';
import useArticleNumExp from './use-article-numexp';
import useInfectedVariantNumExp from './use-infected-variant-numexp';
import useVaccineNumExp from './use-vaccine-numexp';
import useIsoAggNumExp from './use-isolate-agg-numexp';
import useIsolateNumExp from './use-isolate-numexp';
import useVariantNumExp from './use-variant-numexp';
import usePositionNumExp from './use-position-numexp';

const NumExpStats = {
  useRef: useArticleNumExp,
  useAb: useAntibodyNumExp,
  useInfVar: useInfectedVariantNumExp,
  useVacc: useVaccineNumExp,
  useIsoAgg: useIsoAggNumExp,
  useVar: useVariantNumExp,
  useIso: useIsolateNumExp,
  usePos: usePositionNumExp
};

const SuscSummary = {
  Provider: SuscSummaryProvider
};

export {NumExpStats};

export default SuscSummary;
