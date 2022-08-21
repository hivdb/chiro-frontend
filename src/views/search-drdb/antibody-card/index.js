import React from 'react';
import PropTypes from 'prop-types';
import uniq from 'lodash/uniq';
import {useRouter} from 'found';
import pluralize from 'pluralize';

import InfoCard from '../info-card';
import useConfig from '../hooks/use-config';
import Antibodies from '../hooks/antibodies';
import LocationParams, {buildLocationQuery} from '../hooks/location-params';

import Markdown from 'icosa/components/markdown';

import style from './style.module.scss';


const PLACEHOLDER_MESSAGE = `
${'<div>&nbsp;</div>\n'.repeat(3)}

${'- &nbsp;\n'.repeat(3)}
`;


AntibodyCard.propTypes = {
  formOnly: PropTypes.oneOf(['auto', true, false]).isRequired
};

AntibodyCard.defaultProps = {
  formOnly: 'auto'
};

export default function AntibodyCard({formOnly}) {
  const descRef = React.useRef();
  const {
    config,
    isPending: isConfigPending
  } = useConfig();
  const {
    params: {
      refName,
      abNames: paramAbNames
    }
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();

  const {
    antibodies,
    isPending
  } = Antibodies.useCurrent();
  const abNames = antibodies.map(({abName}) => abName);
  const abClass = uniq(
    antibodies.map(({abClass}) => abClass)
  ).join('/');
  const numAbs = antibodies.length;

  const loaded = !isConfigPending && !isPending;

  const message = loaded ?
    (config.messages || {})[`mab-desc_${abNames.join('+')}`] :
    PLACEHOLDER_MESSAGE;

  if (
    !(isPending && paramAbNames && paramAbNames.length > 0) &&
    !(antibodies && antibodies.length > 0)
  ) {
    return null;
  }

  return (
    <InfoCard
     removeTo={{
       pathname: loc.pathname,
       query: buildLocationQuery('antibodies', undefined, loc.query, formOnly)
     }}
     className={style['antibody-card']}
     loaded={loaded}
     tagline={abClass ? <>
       {abClass} monoclonal {pluralize('antibody', numAbs)}
     </> : null}
     titleAs={refName ? 'div' : 'h2'}
     title={<>
       {antibodies.map(({abName, abbreviationName}, idx) => (
         <React.Fragment key={abName}>
           {idx === 0 ? null : ' + '}
           {abName}
           {abbreviationName ? <>
             {' '}
             <span className={style['title-supplement']}>
               ({abbreviationName})
             </span>
           </> : null}
         </React.Fragment>
       ))}
     </>}>
      <div ref={descRef} className={style['antibody-desc']}>
        <Markdown
         escapeHtml={false}>
          {message}
        </Markdown>
        {antibodies.map(({
          abName,
          availability,
          synonyms,
          abTarget,
          abClass,
          matureMonth,
          epitopes
        }) => (
          <ul key={abName}>
            {antibodies.length > 1 ?
              <li>
                <strong>MAb</strong>: {abName}
              </li> : null}
            {synonyms.length > 0 ?
              <li>
                <strong>Synonyms</strong>: {synonyms.join(', ')}
              </li> : null}
            {availability ?
              <li>
                <strong>Availability</strong>: {availability}
              </li> : null}
            {abTarget ?
              <li>
                <strong>MAb Target</strong>: {abTarget}
              </li> : null}
            {abClass ?
              <li>
                <strong>MAb Class</strong>: {abClass}
              </li> : null}
            {matureMonth ?
              <li>
                <strong>Mature month</strong>: {matureMonth}
              </li> : null}
            {epitopes.length > 0 ?
              <li className={style['full-row']}>
                <strong>Epitopes</strong>:{' '}
                {epitopes.join(', ')}
              </li> : null}
          </ul>
        ))}
      </div>
    </InfoCard>
  );
}
