import React from 'react';
import {useRouter} from 'found';

import InfoCard from '../info-card';
import useConfig from '../hooks/use-config';
import Vaccines from '../hooks/vaccines';
import LocationParams, {buildLocationQuery} from '../hooks/location-params';

import Markdown from 'sierra-frontend/dist/components/markdown';

import style from './style.module.scss';


const PLACEHOLDER_MESSAGE = `
${'<div>&nbsp;</div>\n'.repeat(3)}

${'- &nbsp;\n'.repeat(6)}
`;


export default function VaccineCard() {
  const {
    config,
    isPending: isConfigPending
  } = useConfig();
  const {
    params: {refName}
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();

  const {
    vaccine,
    isPending
  } = Vaccines.useCurrent();

  if (!isPending && !vaccine) {
    return null;
  }

  const {
    vaccineName
  } = vaccine || {};

  const loaded = !isConfigPending && !isPending;
  const message = loaded ?
    (config.messages || {})[`vaccine-desc_${vaccineName}`] :
    PLACEHOLDER_MESSAGE;

  return (
    <InfoCard
     removeTo={{
       pathname: loc.pathname,
       query: buildLocationQuery('vaccine', undefined, loc.query)
     }}
     className={style['vaccine-card']}
     loaded={loaded}
     titleAs={refName ? 'div' : 'h2'}
     title={vaccineName}>
      <div className={style['vaccine-desc']}>
        <Markdown
         escapeHtml={false}>
          {message}
        </Markdown>
      </div>
    </InfoCard>
  );
}
