import React from 'react';

import RxPcntBar from './rx-percent-bar';
import VariantPcntBar from './variant-percent-bar';
import style from './style.module.scss';


export default function PercentBars(props) {

  return <section className={style['stat-section']}>
    <div className={style['percent-bars']}>
      <RxPcntBar {...props} />
      <VariantPcntBar {...props} />
    </div>
  </section>;
}
