import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import {buildQuery, parseAntibodies} from './funcs';

const LocationParamsContext = React.createContext();

LocationParamsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function LocationParamsProvider({children}) {
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query: {
        form_only: formOnly,
        article: refName = null,
        mutations: isoAggkey = '',
        antibodies: antibodyText = '',
        variant: varName = null,
        cp: infectedVarName = '',
        vaccine: vaccineName = null
      } = {}
    }
  } = match;

  const onChange = React.useCallback(
    (action, value, clearAction = false) => {
      const query = buildQuery(action, value, clearAction ? {} : loc.query);

      router.push({
        ...loc,
        query
      });
    },
    [router, loc]
  );

  const contextValue = React.useMemo(
    () => {
      const abNames = parseAntibodies(antibodyText);
      return {
        params: {
          formOnly: formOnly !== undefined,
          refName,
          isoAggkey,
          abNames,
          varName,
          vaccineName,
          infectedVarName
        },
        filterFlag: {
          article: !!refName,
          isolateAgg: !!isoAggkey,
          antibody: !!(abNames && abNames.length > 0),
          variant: !!varName,
          vaccine: !!vaccineName,
          infectedVariant: !!infectedVarName
        },
        onChange
      };
    },
    [
      formOnly,
      refName,
      isoAggkey,
      antibodyText,
      varName,
      vaccineName,
      infectedVarName,
      onChange
    ]
  );
  return <LocationParamsContext.Provider value={contextValue}>
    {children}
  </LocationParamsContext.Provider>;
}

function useLocationParams() {
  return React.useContext(LocationParamsContext);
}

const LocationParams = {
  Provider: LocationParamsProvider,
  useMe: useLocationParams
};

export default LocationParams;
