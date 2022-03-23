import React from 'react';
import pluralize from 'pluralize';

import InVivoMutations from '../../hooks/invivo-mutations';
import InVitroMutations from '../../hooks/invitro-mutations';

import style from './style.module.scss';


export default function TableOfContent() {
  const {
    inVivoSbjs,
    isPending: isInVivoPending
  } = InVivoMutations.useMe();

  const {
    inVitroMuts,
    isPending: isInVitroPending
  } = InVitroMutations.useMe();

  const [
    numInVivoIndivSbjs,
    numInVivoAggSbjs,
    numInVivoAnimalSbjs,
    numInVivoSbjs
  ] = React.useMemo(
    () => [
      inVivoSbjs && inVivoSbjs
        .reduce(
          (acc, {numSubjects, subjectSpecies}) => {
            if (
              numSubjects === 1 &&
              subjectSpecies === 'Human'
            ) {
              acc += numSubjects;
            }
            return acc;
          },
          0
        ),
      inVivoSbjs && inVivoSbjs
        .reduce(
          (acc, {numSubjects, subjectSpecies}) => {
            if (
              numSubjects > 1 &&
              subjectSpecies === 'Human'
            ) {
              acc += numSubjects;
            }
            return acc;
          },
          0
        ),
      inVivoSbjs && inVivoSbjs
        .reduce(
          (acc, {numSubjects, subjectSpecies}) => {
            if (subjectSpecies !== 'Human') {
              acc += numSubjects;
            }
            return acc;
          },
          0
        ),
      inVivoSbjs && inVivoSbjs
        .reduce((acc, {numSubjects}) => acc += numSubjects, 0)
    ],
    [inVivoSbjs]
  );

  const numInVitro = inVitroMuts && inVitroMuts.length;

  if (isInVivoPending || isInVitroPending) {
    return null;
  }

  return <ul className={style.toc}>
    <li>
      <a href="#invivo-mutations">In vivo selection data</a>{': '}
      {numInVivoSbjs.toLocaleString('en-US')}{' '}
      {pluralize('subject', numInVitro, false)}
      <ul>
        <li>
          {numInVivoIndivSbjs.toLocaleString('en-US')}{' '}
          {pluralize('patient', numInVivoIndivSbjs, false)}{' '}
          with individual treatment and sample collection records
        </li>
        <li>
          {numInVivoAggSbjs.toLocaleString('en-US')}{' '}
          {pluralize('patient', numInVivoIndivSbjs, false)}{' '}
          are reported <a href="#results.in.aggregated.form">
            in aggregated form
          </a>
        </li>
        <li>
          {numInVivoAnimalSbjs.toLocaleString('en-US')}{' '}
          <a href="#animal.models">
            animal model{' '}
            {pluralize('subject', numInVivoIndivSbjs, false)}
          </a>
        </li>
      </ul>
    </li>
    <li>
      <a href="#invitro-mutations">In vitro selection data</a>{': '}
      {numInVitro.toLocaleString('en-US')}{' '}
      {pluralize('experiment', numInVitro, false)}
    </li>
  </ul>;


}
