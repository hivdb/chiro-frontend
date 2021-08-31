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
  suscResults: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired
};


export default function RxItems({id, title, suscResults, loaded}) {
  const suscResultsBySection = useSeparateSuscResults({
    suscResults: suscResults || [],
    skip: !loaded
  });

  const stats = {
    indivMut: {
      indivFold: useStatSuscResults(
        suscResultsBySection?.indivMut.indivFold || []
      ),
      aggFold: useStatSuscResults(
        suscResultsBySection?.indivMut.aggFold || []
      )
    },
    comboMuts: {
      indivFold: useStatSuscResults(
        suscResultsBySection?.comboMuts.indivFold || []
      ),
      aggFold: useStatSuscResults(
        suscResultsBySection?.comboMuts.aggFold || []
      )
    }
  };

  const onlyOne = Object.values(stats)
    .some(mutStats => Object.values(mutStats)
      .every(({numExps}) => numExps === 0));

  return <>
    {[
      ['indivMut', 'Individual mutation'],
      ['comboMuts', 'Variant / mutation combination']
    ].map(
      ([mutType, subtitle]) => {
        const mutStats = stats[mutType];
        const kebab = kebabCase(mutType);
        return <React.Fragment key={mutType}>
          {mutStats.indivFold.numExps > 0 ?
            <li>
              <a
               className={style.title}
               href={`#${id}${
                 onlyOne ? '' : `_${kebab}`
               }`}>{title} - {subtitle}:</a>{' '}
              {pluralize('result', mutStats.indivFold.numExps, true)},{' '}
              {pluralize('study', mutStats.indivFold.numArticles, true)}
            </li> : null
          }
          {mutStats.aggFold.numExps > 0 ?
            <li>
              <a
               className={style.title}
               href={`#${id}${
                 onlyOne && mutStats.indivFold.numExps === 0 ? '' : `_${kebab}`
               }${
                 mutStats.indivFold.numExps > 0 ? '_agg-fold' : ''
               }`}>{title} - {subtitle} - aggregate form:</a>{' '}
              {pluralize('result', mutStats.aggFold.numExps, true)},{' '}
              {pluralize('study', mutStats.aggFold.numArticles, true)}
            </li> : null
          }
        </React.Fragment>;
      }
    )}
  </>;


}
