import React from 'react';

import SuscResults from '../hooks/susc-results';

import RxItems from './rx-items';

import style from './style.module.scss';


export default function TableOfContent() {
  const {
    suscResults: abSuscResults,
    isPending: isAbPending
  } = SuscResults.useAb();
  const {
    suscResults: cpSuscResults,
    isPending: isCPPending
  } = SuscResults.useCP();
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = SuscResults.useVP();

  return <ul className={style.toc}>
    <RxItems
     id="mab-susc-results"
     title="Monoclonal antibody"
     suscResults={abSuscResults}
     loaded={!isAbPending} />
    <RxItems
     id="cp-susc-results"
     title="Convalescent plasma"
     suscResults={cpSuscResults}
     loaded={!isCPPending} />
    <RxItems
     id="vp-susc-results"
     title="Vaccinee plasma"
     suscResults={vpSuscResults}
     loaded={!isVPPending} />
  </ul>;


}
