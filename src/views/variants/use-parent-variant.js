import React from 'react';
import Select from 'icosa/components/select';

import style from './style.module.scss';


export default function useParentVariant({
  defaultParentVariant,
  parentVariants
}) {

  const parentVariantOptions = React.useMemo(
    () => parentVariants ? [
      {
        label: 'Wuhan-Hu-1',
        value: null
      },
      ...parentVariants.map(
        ({title, varName}) => ({
          label: title,
          value: varName
        })
      )
    ] : null,
    [parentVariants]
  );

  const defaultParentVarOpt = React.useMemo(
    () => parentVariantOptions ? (
      defaultParentVariant ? parentVariantOptions.find(
        ({value}) => value === defaultParentVariant
      ) : parentVariantOptions[1]
    ) : null,
    [parentVariantOptions, defaultParentVariant]
  );

  const [
    curParentVarOpt,
    setCurParentVarOpt
  ] = React.useState(defaultParentVarOpt);

  React.useEffect(
    () => setCurParentVarOpt(defaultParentVarOpt),
    [defaultParentVarOpt]
  );

  return [
    curParentVarOpt?.value,
    curParentVarOpt?.label,
    <>
      {parentVariantOptions ? <div
       className={style['parent-variant-select-container']}>
        <label htmlFor="parent-variant-select">
          Showing mutations from:
        </label>
        <Select
         isSearchable
         options={parentVariantOptions}
         className={style['parent-variant-select']}
         name="parent-variant-select"
         classNamePrefix="parent-variant-select"
         placeHolder="Compare to a parent variant"
         onChange={setCurParentVarOpt}
         value={curParentVarOpt} />
      </div> : null}
    </>
  ];
}
