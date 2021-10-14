import React from 'react';
import uniq from 'lodash/uniq';
import {useRouter} from 'found';

import InfoCard from '../info-card';
import IsolateAggs, {getMutations} from '../hooks/isolate-aggs';
import MutationComments from '../hooks/mutation-comments';
import LocationParams, {buildLocationQuery} from '../hooks/location-params';

import refDataLoader from '../../../components/refdata-loader';

import Markdown from 'sierra-frontend/dist/components/markdown';

import style from './style.module.scss';


function useMessage({isoAggkey, mutationCommentLookup, skip}) {
  return React.useMemo(
    () => {
      if (skip || !isoAggkey) {
        return null;
      }
      const mutations = getMutations(isoAggkey);
      const comments = mutations
        .reduce(
          (acc, {gene, position, aminoAcid}) => {
            const mutCmts = mutationCommentLookup[
              `${gene}:${position}${aminoAcid}`
            ] || [];
            return [...acc, ...mutCmts.map(({comment}) => comment)];
          },
          []
        )
        .filter(cmt => cmt);
      if (comments.length === 0) {
        return null;
      }
      else if (comments.length === 1) {
        return comments[0];
      }
      return '- ' + uniq(comments).join('\n- ');
    },
    [isoAggkey, mutationCommentLookup, skip]
  );
}


function useFormatVersion(version, skip) {
  return React.useMemo(
    () => {
      if (skip) {
        return '';
      }
      const [, year, month, day] = /(\d{4})(\d{2})(\d{2})/.exec(version);
      return new Date(year, month - 1, day).toLocaleDateString('en-US');
    },
    [skip, version]
  );
}


export default function MutationCard() {
  const descRef = React.useRef();
  const {
    params: {
      refName,
      isoAggkey,
      infectedVarName,
      vaccineName,
      antibodyText
    }
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();

  const {
    version,
    mutationCommentLookup,
    isPending
  } = MutationComments.useMe();

  const formatVersion = useFormatVersion(version, isPending);

  const {
    isolateAggLookup,
    isPending: isIsoAggPending
  } = IsolateAggs.useMe();

  const skip = isPending || isIsoAggPending;

  const message = useMessage({
    isoAggkey,
    mutationCommentLookup,
    skip
  });

  if (!isoAggkey || !message) {
    return null;
  }

  const {isoAggDisplay} = skip ? {} : isolateAggLookup[isoAggkey];

  return (
    <InfoCard
     removeTo={{
       pathname: loc.pathname,
       query: buildLocationQuery('mutations', undefined, loc.query)
     }}
     className={style['mutation-card']}
     loaded={!skip}
     tagline={`Last updated on ${formatVersion}`}
     titleAs={
       refName || antibodyText ||
       vaccineName || infectedVarName ? 'div' : 'h2'}
     title={isoAggDisplay}>
      <div ref={descRef} className={style['mutation-desc']}>
        <Markdown
         disableHeadingTagAnchor
         referenceHeadingTagLevel={3}
         refDataLoader={refDataLoader}
         escapeHtml={false}>
          {message}
        </Markdown>
      </div>
    </InfoCard>
  );
}
