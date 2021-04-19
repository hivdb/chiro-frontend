import React from 'react';

import {loadPage} from '../cms';


async function loadConfig(setConfig, mounted) {
  const config = await loadPage('covid-drdb');

  if (mounted.mounted) {
    setConfig(
      new Proxy(config, {
        get(target, name) {
          return Object.freeze(target[name]);
        }
      })
    );
  }
}


export default function useConfig() {

  const [config, setConfig] = React.useState(null);

  React.useEffect(
    () => {
      const mounted = {mounted: true};
      loadConfig(setConfig, mounted);
      return () => {
        mounted.mounted = false;
      };
    },
    [setConfig]
  );

  return {
    config,
    isPending: config === null
  };

}
