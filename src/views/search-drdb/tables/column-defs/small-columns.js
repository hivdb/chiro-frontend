import React from 'react';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import {AiOutlineCheck} from '@react-icons/all-files/ai/AiOutlineCheck';
import {AiOutlineClose} from '@react-icons/all-files/ai/AiOutlineClose';
import {ColumnDef} from 'icosa/components/simple-table';

import CellAssay from './cell-assay';
import CellSection from './cell-section';
import CellAntibodies from './cell-antibodies';
import CellRLevel from './cell-resistance-level';
import CellSubjectName from './cell-subject-name';
import style from './style.module.scss';


export default function useSmallColumns({
  antibodyLookup,
  compareByAntibodies,
  labels = {},
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }
      return {
        assayName: new ColumnDef({
          name: 'assayName',
          label: labels.assayName || 'Assay',
          render: assayName => (
            <CellAssay assayName={assayName} />
          )
        }),
        abNames: new ColumnDef({
          name: 'abNames',
          label: labels.abNames || 'Antibodies',
          render: abNames => <CellAntibodies {...{abNames, antibodyLookup}} />,
          sort: rows => [...rows].sort(compareByAntibodies)
        }),
        section: new ColumnDef({
          name: 'section',
          label: labels.section,
          render: section => <CellSection {...{section}} />,
          decorator: section => (
            section instanceof Array ?
              uniq(section)
                .sort()
                .join('; ') : section
          )
        }),
        numStudies: new ColumnDef({
          name: 'numStudies',
          label: labels.numStudies || '# Publications',
          decorator: (_, {refName}) => (
            refName instanceof Array ? uniq(refName).length : 1
          ),
          render: n => n && n.toLocaleString('en-US')
        }),
        numSubjects: new ColumnDef({
          name: 'numSubjects',
          label: labels.numSubjects || '# Subjects',
          render: n => n && n.toLocaleString('en-US')
        }),
        vaccineName: new ColumnDef({
          name: 'vaccineName',
          label: labels.vaccineName || 'Vaccine'
        }),
        subjectName: new ColumnDef({
          name: 'subjectName',
          label: labels.subjectName || 'Subject',
          render: (subjectName, {subjectSpecies}) => (
            <CellSubjectName {...{subjectName, subjectSpecies}} />
          )
        }),
        subjectAge: new ColumnDef({
          name: 'subjectAge',
          label: labels.subject || 'Age'
        }),
        immuneStatus: new ColumnDef({
          name: 'immuneStatus',
          label: labels.immuneStatus || 'Immune Status',
          render: s => s === null ? '?' : (
            s === 'Medical' ? 'Iatrogenic immunocompromised' : s
          )
        }),
        subjectSpecies: new ColumnDef({
          name: 'subjectSpecies',
          label: labels.subjectSpecies || 'Host'
        }),
        infectionDate: new ColumnDef({
          name: 'infectionDate',
          label: labels.infectionDate,
          render: date => new Date(date).getFullYear()
        }),
        infectionTiming: new ColumnDef({
          name: 'infectionTiming',
          label: labels.infectionTiming || 'Month since Infection',
          render: ([start, end]) => (
            start === end ? start : `${start}-${end}`
          ),
          exportCell: ([start, end]) => (
            start === end ? `${start}m` : `${start}-${end}m`
          ),
          sort: rows => sortBy(rows, [
            'infectionTiming.0',
            'infectionTiming.1'
          ])
        }),
        timing: new ColumnDef({
          name: 'timing',
          label: labels.timing
        }),
        timingRange: new ColumnDef({
          name: 'timingRange',
          label: labels.timingRange,
          exportCell: cellData => `${cellData}m`
        }),
        dosage: new ColumnDef({
          name: 'dosage',
          label: labels.dosage
        }),
        severity: new ColumnDef({
          name: 'severity',
          label: labels.severity
        }),
        resistanceLevel: new ColumnDef({
          name: 'resistanceLevel',
          label: labels.resistanceLevel,
          render: resistanceLevel => <CellRLevel rLevel={resistanceLevel} />
        }),
        escapeScore: new ColumnDef({
          name: 'escapeScore',
          label: labels.escapeScore || 'Escape Fraction',
          render: score => score.toFixed(3)
        }),
        ace2Binding: new ColumnDef({
          name: 'ace2Binding',
          label: labels.ace2Binding || 'ACE 2 Binding',
          render: binding => binding.toFixed(2)
        }),
        expression: new ColumnDef({
          name: 'expression',
          label: labels.expression,
          render: exp => exp.toFixed(2)
        }),
        ace2Contact: new ColumnDef({
          name: 'ace2Contact',
          label: labels.ace2Contact || 'ACE 2 Contact',
          render: flag => <>
            {flag ?
              <AiOutlineCheck className={style['yes']} /> :
              <AiOutlineClose className={style['no']} />}
          </>,
          exportCell: flag => flag
        }),
        countTotal: new ColumnDef({
          name: 'countTotal',
          label: labels.countTotal || '# Results',
          render: (_, {count, total}) => (
            total > 1 ? `${count} / ${total}` : total
          ),
          exportCell: (_, {count, total}) => ({count, total}),
          sort: rows => sortBy(rows, ['count', 'total'])
        })
      };
    },
    [
      skip,
      labels,
      antibodyLookup,
      compareByAntibodies
    ]
  );
}
