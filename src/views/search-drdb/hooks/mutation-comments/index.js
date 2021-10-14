import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'lodash/memoize';

import useConfig from '../use-config';
import {fetchCMS} from '../../../../utils/cms';

const MutationCommentsContext = React.createContext();


const loadMutationComments = memoize(
  async function loadMutationComments(version) {
    const resPath = `downloads/mutation-comments/${version}.json`;
    const [resp] = await fetchCMS(resPath);
    if (resp.status === 403 || resp.status === 404) {
      throw new Error(`Resource not found: ${resPath}`);
    }
    return resp.json();
  }
);


function parseMutations(mutations) {
  const results = [];
  for (const geneMut of mutations.split(',')) {
    const [gene, mut] = geneMut.trim().split(':');
    let [, pos, aas] = /^[A-Z]?(\d+)([\w*]+)$/.exec(mut);
    pos = Number.parseInt(pos);
    if (['ins', 'del', 'stop'].includes(aas)) {
      aas = [aas];
    }
    else {
      aas = aas.split('');
    }
    for (const aa of aas) {
      results.push({
        gene,
        position: pos,
        aminoAcid: aa,
        uniqKey: `${gene}:${pos}${aa}`
      });
    }
  }
  return results;
}


MutationCommentsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function MutationCommentsProvider({children}) {
  const {config, isPending} = useConfig();
  const [contextValue, setContextValue] = React.useState({isPending: true});

  React.useEffect(
    () => {
      if (isPending) {
        return;
      }
      const commentObjs = [];
      const commentLookup = {};
      const {cmtVersion} = config;
      const mountStatus = {mounted: true};
      loadMutationComments(cmtVersion)
        .then(({payload}) => {
          if (!mountStatus.mounted) {
            return;
          }
          for (const {mutations, comment} of payload) {
            const commentObj = {
              mutations: parseMutations(mutations),
              comment
            };
            commentObjs.push(commentObj);
            for (const {uniqKey} of commentObj.mutations) {
              commentLookup[uniqKey] = commentLookup[uniqKey] || [];
              commentLookup[uniqKey].push(commentObj);
            }
          }
          setContextValue({
            mutationComments: commentObjs,
            mutationCommentLookup: commentLookup,
            isPending: false
          });
        });
      return () => {
        mountStatus.mounted = false;
      };
    },
    [config, isPending]
  );

  return <MutationCommentsContext.Provider value={contextValue}>
    {children}
  </MutationCommentsContext.Provider>;
}

function useMutationComments() {
  return React.useContext(MutationCommentsContext);
}

const MutationComments = {
  Provider: MutationCommentsProvider,
  useMe: useMutationComments
};

export default MutationComments;
