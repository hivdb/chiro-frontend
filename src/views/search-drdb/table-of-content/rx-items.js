import React from 'react';
import PropTypes from 'prop-types';
import kebabCase from 'lodash/kebabCase';
import pluralize from 'pluralize';

import {
  useSeparateSuscResults,
  useStatSuscResults
} from '../hooks';

import style from './style.module.scss';


RxItems.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  suscResults: PropTypes.array,
  loaded: PropTypes.bool.isRequired
};


export default function RxItems({id, title, suscResults, loaded}) {
  const suscResultsBySection = useSeparateSuscResults({
    suscResults: suscResults || [],
    aggFormDimension: false,
    skip: !loaded
  });
  const suscResultsByMutTypeAndAggForm = useSeparateSuscResults({
    suscResults: suscResults || [],
    aggFormDimension: true,
    skip: !loaded
  });

  const stats = {
    indivMut: {
      ...useStatSuscResults(
        suscResultsBySection?.indivMut || []
      ),
      indivFold: useStatSuscResults(
        suscResultsByMutTypeAndAggForm?.indivMut.indivFold || []
      ),
      aggFold: useStatSuscResults(
        suscResultsByMutTypeAndAggForm?.indivMut.aggFold || []
      )
    },
    comboMuts: {
      ...useStatSuscResults(
        suscResultsBySection?.comboMuts || []
      ),
      indivFold: useStatSuscResults(
        suscResultsByMutTypeAndAggForm?.comboMuts.indivFold || []
      ),
      aggFold: useStatSuscResults(
        suscResultsByMutTypeAndAggForm?.comboMuts.aggFold || []
      )
    }
  };

  const onlyOne = Object.values(stats)
    .every(({numExps}) => numExps === 0);

  return <>
    {[
      ['indivMut', 'Individual mutation'],
      ['comboMuts', 'Variant / mutation combination']
    ].map(
      ([mutType, subtitle]) => {
        const mutStats = stats[mutType];
        const kebab = kebabCase(mutType);
        return <React.Fragment key={mutType}>
          {mutStats.numExps > 0 ?
            <li>
              <a
               className={style.title}
               href={`#${id}${
                 onlyOne ? '' : `_${kebab}`
               }`}>{title} - {subtitle}:</a>{' '}
              {mutStats.numExps.toLocaleString('en-US')}{' '}
              {pluralize('result', mutStats.numExps, false)},{' '}
              {mutStats.numArticles.toLocaleString('en-US')}{' '}
              {pluralize('publication', mutStats.numArticles, false)}
              {mutStats.indivFold.numExps + mutStats.aggFold.numExps > 0 ?
                <ul>
                  {mutStats.indivFold.numExps > 0 ?
                    <li>
                      <span className={style.title}>Individual form{': '}</span>
                      {' '}
                      {mutStats.indivFold.numExps.toLocaleString('en-US')}{' '}
                      {pluralize('result', mutStats.indivFold.numExps, false)}
                      {', '}
                      {mutStats.indivFold.numArticles.toLocaleString('en-US')}
                      {' '}
                      {pluralize(
                        'publication',
                        mutStats.indivFold.numArticles,
                        false
                      )}
                    </li> : null}
                  {mutStats.aggFold.numExps > 0 ?
                    <li>
                      <span className={style.title}>Aggregate form{': '}</span>
                      {' '}
                      {mutStats.aggFold.numExps.toLocaleString('en-US')}{' '}
                      {pluralize('result', mutStats.aggFold.numExps, false)}
                      {', '}
                      {mutStats.aggFold.numArticles.toLocaleString('en-US')}
                      {' '}
                      {pluralize(
                        'publication',
                        mutStats.aggFold.numArticles,
                        false
                      )}
                    </li> : null}
                </ul> : null}
            </li> : null
          }
        </React.Fragment>;
      }
    )}
  </>;


}
