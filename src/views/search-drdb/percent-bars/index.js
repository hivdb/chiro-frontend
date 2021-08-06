import React from 'react';

import VariantPcntBar from './variant-percent-bar';
import style from './style.module.scss';


export default function PercentBars(props) {

  return <section className={style['stat-section']}>
    <div className={style['percent-bars']}>
      <VariantPcntBar {...props} />
    </div>
  </section>;
}
