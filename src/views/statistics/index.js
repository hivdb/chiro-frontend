import React from 'react';
import CompoundChart from './compound.svg';
import PolymeraseChart from './polymerase.svg';
import ClinialChart from './clinical-trials.svg';
import TargetChart from './target.svg';


export default function Statistics() {
  // return <TargetChart />;
  return (<>
    <div>
      <img src={PolymeraseChart} alt={"Polymerase"} width={1000}/>
    </div>
    <div>
      <img src={TargetChart} alt={"Target"} width={1000} />
    </div>
    <div>
      <img src={CompoundChart} alt={"Compound"} width={1000}/>
    </div>
    <div>
      <img src={ClinialChart} alt={"Clinical trials"} width={1000}/>
    </div>
  </>)
}