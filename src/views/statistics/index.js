import React from 'react';
import CompoundChart from './compound.svg';
import PolymeraseChart from './polymerase.svg';
import ClinialChart from './clinical-trials.svg';


export default function Statistics() {
  // return <TargetChart />;
  return (<>
    <div>
      <img src={PolymeraseChart} width={1000}/>
    </div>
    <div>
      <img src={CompoundChart} width={1000}/>
    </div>
    <div>
      <img src={ClinialChart} width={1000}/>
    </div>
  </>)
}