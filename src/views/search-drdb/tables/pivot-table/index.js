import React from 'react';
import PropTypes from 'prop-types';
import {useLocationState} from 'sierra-frontend/dist/utils/use-location-state';
import PivotTableUI from 'react-pivottable/PivotTableUI';

import style from './style.module.scss';


PivotTable.propTypes = {
  cacheKey: PropTypes.string.isRequired,
  data: PropTypes.array
  // hideNN: PropTypes.bool
};


export default function PivotTable({cacheKey, data}) {
  const [persistState, setPersistState] = useLocationState(cacheKey, {});
  const [state, setState] = React.useState({});

  const handleChange = React.useCallback(
    ({
      rendererName,
      aggregatorName,
      colOrder,
      cols,
      rowOrder,
      rows,
      // sorters,
      // derivedAttributes,
      // hiddenAttributes,
      // hiddenFromAggregators,
      // hiddenFromDragDrop,
      // menuLimit,
      // renderers,
      ...props
    }) => {
      setPersistState({
        rendererName,
        aggregatorName,
        colOrder,
        cols,
        rowOrder,
        rows
      });
      setState(props);
    },
    [setPersistState, setState]
  );

  return <div className={style['pivot-table']}>
    <PivotTableUI
     data={data}
     onChange={handleChange}
     {...persistState}
     {...state} />
  </div>;
}
