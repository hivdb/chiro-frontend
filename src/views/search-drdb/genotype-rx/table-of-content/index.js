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
    numInVivoIndivStudies,
    numInVivoAggStudies,
    numInVivoAnimalStudies,
    numInVivoStudies,
    numInVivoIndivSbjs,
    numInVivoAggSbjs,
    numInVivoAnimalSbjs,
    numInVivoSbjs
  ] = React.useMemo(
    () => [
      inVivoSbjs && Object.keys(inVivoSbjs
        .reduce(
          (acc, {refName, numSubjects, subjectSpecies}) => {
            if (
              numSubjects === 1 &&
              subjectSpecies === 'Human'
            ) {
              acc[refName] = 1;
            }
            return acc;
          },
          {}
        )).length,
      inVivoSbjs && Object.keys(inVivoSbjs
        .reduce(
          (acc, {refName, numSubjects, subjectSpecies}) => {
            if (
              numSubjects > 1 &&
              subjectSpecies === 'Human'
            ) {
              acc[refName] = 1;
            }
            return acc;
          },
          {}
        ))
        .length,
      inVivoSbjs && Object.keys(inVivoSbjs
        .reduce(
          (acc, {refName, subjectSpecies}) => {
            if (subjectSpecies !== 'Human') {
              acc[refName] = 1;
            }
            return acc;
          },
          {}
        ))
        .length,
      inVivoSbjs && Object.keys(inVivoSbjs
        .reduce(
          (acc, {refName}) => {
            acc[refName] = 1;
            return acc;
          },
          {}
        ))
        .length,
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
  const numInVitroStudies = inVitroMuts && Object.keys(
    inVitroMuts.reduce(
      (acc, {refName}) => {
        acc[refName] = 1;
        return acc;
      },
      {}
    )
  )
    .length;

  if (isInVivoPending || isInVitroPending) {
    return null;
  }

  return <ul className={style.toc}>
    <li>
      <a href="#invivo-mutations">In vivo selection data</a>{': '}
      {numInVivoStudies.toLocaleString('en-US')}{' '}
      {pluralize('study', numInVivoStudies, false)}{'; '}
      {numInVivoSbjs.toLocaleString('en-US')}{' '}
      {pluralize('subject', numInVivoSbjs, false)}
      <ul>
        <li>
          {numInVivoIndivSbjs.toLocaleString('en-US')}{' '}
          {pluralize('patient', numInVivoIndivSbjs, false)}{' of '}
          {numInVivoIndivStudies.toLocaleString('en-US')}{' '}
          {pluralize('study', numInVivoIndivStudies, false)}{' '}
          with individual treatment and sample collection records
        </li>
        <li>
          {numInVivoAggSbjs.toLocaleString('en-US')}{' '}
          {pluralize('patient', numInVivoIndivSbjs, false)}{' of '}
          {numInVivoAggStudies.toLocaleString('en-US')}{' '}
          {pluralize('study', numInVivoAggStudies, false)}{' '}
          are reported <a href="#results.in.aggregated.form">
            in aggregated form
          </a>
        </li>
        <li>
          {numInVivoAnimalSbjs.toLocaleString('en-US')}{' '}
          <a href="#animal.models">
            animal model{' '}
            {pluralize('subject', numInVivoIndivSbjs, false)}
          </a>{' from '}
          {numInVivoAnimalStudies.toLocaleString('en-US')}{' '}
          {pluralize('study', numInVivoAnimalStudies, false)}
        </li>
      </ul>
    </li>
    <li>
      <a href="#invitro-mutations">In vitro selection data</a>{': '}
      {numInVitroStudies.toLocaleString('en-US')}{' '}
      {pluralize('study', numInVitroStudies, false)}{'; '}
      {numInVitro.toLocaleString('en-US')}{' '}
      {pluralize('experiment', numInVitro, false)}
    </li>
  </ul>;


}
