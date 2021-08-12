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
  const descRef = React.useRef();
  const {
    config,
    isPending: isConfigPending
  } = useConfig();
  const {
    params: {
      refName,
      vaccineName: paramVaccName
    }
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();

  const {
    vaccine,
    isPending
  } = Vaccines.useCurrent();

  const loaded = !isConfigPending && !isPending;

  const {
    vaccineName,
    vaccineType
  } = vaccine || {};

  const message = loaded ?
    (config.messages || {})[`vaccine-desc_${vaccineName}`] :
    PLACEHOLDER_MESSAGE;

  React.useEffect(
    () => {
      if (!descRef.current) {
        return;
      }
      const allList = descRef.current.querySelectorAll('ul');
      for (const list of allList) {
        const parentWidth = list.parentElement.scrollWidth;
        const childWidths = Array.from(list.children)
          .map(child => child.scrollWidth);
        const leftMaxWidth = Math.max(
          ...childWidths.slice(0, Math.ceil(childWidths.length / 2))
        );
        const rightMaxWidth = Math.max(
          ...childWidths.slice(Math.ceil(childWidths.length / 2))
        );
        let childRows = childWidths.length;
        if (leftMaxWidth + rightMaxWidth < parentWidth * 0.8) {
          childRows = childRows / 2;
        }
        list.style.setProperty('--child-rows', childRows);
      }
    },
    [message]
  );


  if (!(isPending && paramVaccName) && !vaccine) {
    return null;
  }

  return (
    <InfoCard
     removeTo={{
       pathname: loc.pathname,
       query: buildLocationQuery('vaccine', undefined, loc.query)
     }}
     className={style['vaccine-card']}
     loaded={loaded}
     tagline={vaccineType ? `${vaccineType} vaccine` : null}
     titleAs={refName ? 'div' : 'h2'}
     title={vaccineName}>
      <div ref={descRef} className={style['vaccine-desc']}>
        <Markdown
         escapeHtml={false}>
          {message}
        </Markdown>
      </div>
    </InfoCard>
  );
}
