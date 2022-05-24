import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

import {getMutations, compareIsolateAggs} from './funcs';

export {getMutations, compareIsolateAggs};

const IsolateAggsContext = React.createContext();

IsolateAggsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

function IsolateAggsProvider({children}) {

  const sql = `
    SELECT iso_aggkey, iso_agg_display, var_name, iso_type
    FROM isolate_aggs
  `;

  const {
    payload,
    isPending
  } = useQuery({sql});

  const lookup = React.useMemo(
    () => isPending || !payload ? {} : payload.reduce(
      (acc, isoAgg) => {
        isoAgg.mutations = getMutations(isoAgg.isoAggkey);
        acc[isoAgg.isoAggkey] = isoAgg;
        return acc;
      },
      {}
    ),
    [isPending, payload]
  );

  const contextValue = {
    isolateAggs: payload && payload.sort(compareIsolateAggs),
    isolateAggLookup: lookup,
    isPending
  };

  return <IsolateAggsContext.Provider value={contextValue}>
    {children}
  </IsolateAggsContext.Provider>;
}


function useIsolateAggs() {
  return React.useContext(IsolateAggsContext);
}

const IsolateAggs = {
  Provider: IsolateAggsProvider,
  useMe: useIsolateAggs
};

export default IsolateAggs;
