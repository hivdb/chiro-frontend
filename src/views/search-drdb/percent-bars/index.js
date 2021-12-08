import React from 'react';
import PropTypes from 'prop-types';

import {NumExpStats} from '../hooks/susc-summary';

import RxPcntBar from './rx-percent-bar';
import VirusPcntBar from './virus-percent-bar';
import style from './style.module.scss';


PercentBars.propTypes = {
  children: PropTypes.node
};


export default function PercentBars({children, ...props}) {

  const [totalNumExp, isPending] = NumExpStats.useRxTotal();

  return (isPending || totalNumExp === 0 ? null :
  <section className={style['stat-section']}>
    <h2>Susceptibility data</h2>
    <div className={style['percent-bars']}>
      <RxPcntBar {...props} />
      <VirusPcntBar {...props} />
    </div>
    {children}
  </section>
  );
}
