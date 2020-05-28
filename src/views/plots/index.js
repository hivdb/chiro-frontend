import React from 'react';
// import CompoundChart from './compound.svg';
import PolymeraseChart from './polymerase.png';
import ClinialChart from './clinical-trials.png';
import TargetChart from './target.png';
import VirusChart from './virus.png';

import VirusTable from './virus-table';


export default function Plots() {
  // return <TargetChart />;
  return (<>
    <div>
      <img src={VirusChart} alt={"virus"} width={1000} />
    </div>
    <div>
      <VirusTable />
    </div>
    <div>
      <img src={TargetChart} alt={"Target"} width={1000} />
    </div>
    <div>
      <img src={PolymeraseChart} alt={"Polymerase"} width={1000}/>
    </div>
    <div>
      <img src={ClinialChart} alt={"Clinical trials"} width={1000}/>
    </div>
   {/* <div>
      <img src={CompoundChart} alt={"Compound"} width={1000}/>
   </div> */}
  </>)
}
