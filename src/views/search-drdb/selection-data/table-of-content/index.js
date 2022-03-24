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
              if (!(subjectSpecies in acc)) {
                acc[subjectSpecies] = 0;
              }
              acc[subjectSpecies] += numSubjects;
            }
            return acc;
          },
          {}
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
  // eslint-disable-next-line no-console
  console.debug('render <TableOfContent />');

  return <ul className={style.toc}>
    <li>
      <a
       className={style.title}
       href="#invivo-mutations">
        In vivo selection data:
      </a>
      {numInVivoSbjs.toLocaleString('en-US')}{' '}
      {pluralize('subject', numInVivoSbjs, false)}{', '}
      {numInVivoStudies.toLocaleString('en-US')}{' '}
      {pluralize('publication', numInVivoStudies, false)}
      {numInVivoSbjs === 0 ?
        null :
        <ul>
          {numInVivoIndivSbjs === 0 ?
            null :
            <li>
              <a className={style.title} href="#invivo-mutations_indiv">
                Individual treatment records are available:
              </a>
              {numInVivoIndivSbjs.toLocaleString('en-US')}{' '}
              {pluralize('patient', numInVivoIndivSbjs, false)}{', '}
              {numInVivoIndivStudies.toLocaleString('en-US')}{' '}
              {pluralize('publication', numInVivoIndivStudies, false)}
            </li>}
          {numInVivoAggSbjs === 0 ?
            null :
            <li>
              <a className={style.title} href="#invivo-mutations_agg">
                Only aggregate data are available:
              </a>
              {numInVivoAggSbjs.toLocaleString('en-US')}{' '}
              {pluralize('patient', numInVivoIndivSbjs, false)}{', '}
              {numInVivoAggStudies.toLocaleString('en-US')}{' '}
              {pluralize('publication', numInVivoAggStudies, false)}
            </li>}
          {numInVivoAnimalStudies === 0 ?
            null :
            <li>
              <a className={style.title} href="#invivo-mutations_animal">
                Animal models:
              </a>
              {Object
                .entries(numInVivoAnimalSbjs)
                .map(([species, num]) => (
                  <React.Fragment key={species}>
                    {num.toLocaleString('en-US')}{' '}
                    {pluralize(species.toLocaleLowerCase(), num, false)}
                    {', '}
                  </React.Fragment>
                ))}
              {numInVivoAnimalStudies.toLocaleString('en-US')}
              {pluralize('publication', numInVivoAnimalStudies, false)}
            </li>}
        </ul>}
    </li>
    <li>
      <a
       className={style.title}
       href="#invitro-mutations">
        In vitro selection data:
      </a>
      {numInVitro.toLocaleString('en-US')}{' '}
      {pluralize('experiment', numInVitro, false)}{', '}
      {numInVitroStudies.toLocaleString('en-US')}{' '}
      {pluralize('publication', numInVitroStudies, false)}
    </li>
  </ul>;


}
