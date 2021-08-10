import React from 'react';

import RxPcntBar from './rx-percent-bar';
import VirusPcntBar from './virus-percent-bar';
import style from './style.module.scss';


export default function PercentBars(props) {

  return <section className={style['stat-section']}>
    <div className={style['percent-bars']}>
      <RxPcntBar {...props} />
      <VirusPcntBar {...props} />
    </div>
  </section>;
}
