import React from 'react';

const URL_ALLOWLIST = /(?:https?:i\/\/)?((?:bitly\.is|bit\.ly|git\.io)\/\w+)/g;


export default function CellSection({section}) {
  if (URL_ALLOWLIST.test(section)) {
    const parts = section.split(URL_ALLOWLIST);
    return <>
      {parts.map((part, idx) => {
        if (URL_ALLOWLIST.test(part)) {
          return (
            <a
             key={idx}
             rel="noreferrer"
             href={`//${part}`}
             target="_blank">
              {part}
            </a>
          );
        }
        else {
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        }
      })}
    </>;
  }
  else {
    return section;
  }
}
