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
              {pluralize('result', mutStats.numExps, true)},{' '}
              {pluralize('study', mutStats.numArticles, true)}
              {mutStats.indivFold.numExps + mutStats.aggFold.numExps > 0 ?
                <ul>
                  {mutStats.indivFold.numExps > 0 ?
                    <li>
                      <span className={style.title}>Individual form{': '}</span>
                      {' '}
                      {pluralize('result', mutStats.indivFold.numExps, true)}
                      {', '}
                      {pluralize('study', mutStats.indivFold.numArticles, true)}
                    </li> : null}
                  {mutStats.aggFold.numExps > 0 ?
                    <li>
                      <span className={style.title}>Aggregate form{': '}</span>
                      {' '}
                      {pluralize('result', mutStats.aggFold.numExps, true)}
                      {', '}
                      {pluralize('study', mutStats.aggFold.numArticles, true)}
                    </li> : null}
                </ul> : null}
            </li> : null
          }
        </React.Fragment>;
      }
    )}
  </>;


}
