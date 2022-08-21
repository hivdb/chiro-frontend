import React from 'react';
import {useRouter} from 'found';

import InfoCard from '../info-card';
import useConfig from '../hooks/use-config';
import Variants from '../hooks/variants';
import LocationParams, {buildLocationQuery} from '../hooks/location-params';
import shortenMutList from '../../../utils/shorten-mutlist';
import MutationViewer from '../../../components/mutation-viewer';

import Markdown from 'icosa/components/markdown';

import Tagline from './tagline';
import style from './style.module.scss';


const PLACEHOLDER_MESSAGE = `
${'<div>&nbsp;</div>\n'.repeat(3)}
`;


export default function VariantCard() {
  const descRef = React.useRef();
  const {
    config,
    isPending: isConfigPending
  } = useConfig();
  const {
    params: {
      refName,
      infectedVarName: paramInfectedVarName,
      vaccineName,
      antibodyText,
      varName: paramVarName
    }
  } = LocationParams.useMe();
  const {match: {location: loc}} = useRouter();

  const displayInfVar = (
    paramInfectedVarName &&
    paramInfectedVarName !== 'Wild Type' &&
    paramInfectedVarName !== 'any'
  );

  const displayVar = (
    paramInfectedVarName &&
    paramInfectedVarName !== 'any'
  );

  const {
    variant,
    isPending
  } = Variants.useOne(displayInfVar ? paramInfectedVarName : paramVarName);

  const loaded = !isConfigPending && !isPending;

  const {
    varName,
    asWildtype,
    synonyms = [],
    status = [],
    consensusAvailability,
    consensus = []
  } = variant || {};
  const shortCons = shortenMutList(consensus);

  const message = loaded ?
    (config.messages || {})[`variant-desc_${varName}`] :
    PLACEHOLDER_MESSAGE;

  const attrList = loaded ?
    (config.messages || {})[`variant-attrlist_${varName}`] || [] :
    [];

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

  if (!(isPending && (displayInfVar || displayVar)) && !variant) {
    return null;
  }

  const varNameWithSynonyms = <>
    {varName}{' '}
    {synonyms.length > 0 ?
      <span className={style['title-supplement']}>
        ({synonyms[0]})
      </span> : null}
  </>;

  return (
    <InfoCard
     removeTo={{
       pathname: loc.pathname,
       query: buildLocationQuery('variant', undefined, loc.query)
     }}
     className={style['variant-card']}
     loaded={loaded}
     tagline={<Tagline key={`tagline-${varName}`} {...{asWildtype, status}} />}
     titleAs={refName || antibodyText || vaccineName ? 'div' : 'h2'}
     title={
       <>
         {varName ? (
           displayInfVar ?
             <>Infected by {varNameWithSynonyms} virus</> :
             <>{varNameWithSynonyms} variant</>
         ) : null}
       </>
      }>
      <div ref={descRef} className={style['variant-desc']}>
        <Markdown
         escapeHtml={false}>
          {message}
        </Markdown>
        {loaded && (consensusAvailability || consensus.length > 0) ?
          <MutationViewer
           regionPresets={config.regionPresets}
           mutations={consensus} /> : null}
        {loaded ? <ul>
          {consensusAvailability || consensus.length > 0 ?
            <li className={style['full-row']}>
              <strong>Spike mutations</strong>{': '}
              <ul className={style['variant-consensus']}>
                {shortCons.map((mut, idx) => <li key={mut}>
                  {idx > 0 ?
                    <span className={style.bullet}>+</span> : null}
                  {mut}
                </li>)}
              </ul>
              <span className={style['variant-consensus-ref']}>
                {' [source: '}
                <a
                 href="https://outbreak.info"
                 target="_blank"
                 rel="noreferrer">
                  outbreak.info
                </a>]
              </span>
            </li> : null}
          {attrList.map((text, idx) => (
            <li
             key={idx}
             className={style['full-row']}>
              <Markdown inline escapeHtml={false}>{text}</Markdown>
            </li>
          ))}
        </ul> : null}
      </div>
    </InfoCard>
  );
}
