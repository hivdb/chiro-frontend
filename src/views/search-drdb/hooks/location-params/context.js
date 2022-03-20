import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import {buildQuery, parseAntibodies} from './funcs';

const LocationParamsContext = React.createContext();

LocationParamsProvider.propTypes = {
  redirectTo: PropTypes.string,
  defaultQuery: PropTypes.object,
  formOnly: PropTypes.oneOf(['auto', true, false]).isRequired,
  children: PropTypes.node.isRequired
};


LocationParamsProvider.defaultProps = {
  formOnly: 'auto'
};


function LocationParamsProvider({
  defaultQuery = {},
  redirectTo = null,
  formOnly: formOnlyConfig,
  children
}) {
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
        position: genePos = null,
        cp: infectedVarName = '',
        vaccine: vaccineName = null,
        debug: debugMsg = null,
        infected: infectedStrOrArr,
        month: monthStrOrArr,
        dosage: dosageStrOrArr,
        host: hostStrOrArr,
        naive = null
      } = {}
    }
  } = match;
  const pathname = redirectTo ? redirectTo : loc.pathname;

  const onChange = React.useCallback(
    (action, value, clearAction = false) => {
      const query = buildQuery(
        action,
        value,
        clearAction ? defaultQuery : {
          ...defaultQuery,
          ...loc.query
        },
        formOnlyConfig
      );

      router.push({
        pathname,
        query
      });
    },
    [formOnlyConfig, router, defaultQuery, pathname, loc.query]
  );

  const contextValue = React.useMemo(
    () => {
      const abNames = parseAntibodies(antibodyText);
      const month = monthStrOrArr instanceof Array ?
        monthStrOrArr : (
          typeof monthStrOrArr === 'string' ? [monthStrOrArr] : []
        );
      const dosage = dosageStrOrArr instanceof Array ?
        dosageStrOrArr : (
          typeof dosageStrOrArr === 'string' ? [dosageStrOrArr] : []
        );
      const host = hostStrOrArr instanceof Array ?
        hostStrOrArr : (
          typeof hostStrOrArr === 'string' ? [hostStrOrArr] : []
        );
      const infected = infectedStrOrArr instanceof Array ?
        infectedStrOrArr : (
          typeof infectedStrOrArr === 'string' ? [infectedStrOrArr] : []
        );
      return {
        params: {
          formOnly: formOnly !== undefined,
          refName,
          isoAggkey,
          abNames,
          varName,
          vaccineName,
          infectedVarName,
          genePos,
          infected,
          month,
          dosage,
          host,
          naive,
          debugMsg
        },
        filterFlag: {
          article: !!refName,
          isolateAgg: !!isoAggkey,
          antibody: !!(abNames && abNames.length > 0),
          variant: !!varName,
          vaccine: !!vaccineName,
          infectedVariant: !!infectedVarName,
          genePos: !!genePos
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
      genePos,
      infectedStrOrArr,
      monthStrOrArr,
      dosageStrOrArr,
      hostStrOrArr,
      naive,
      debugMsg,
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
