import useQuery from './use-query';


export default function useLastUpdate() {
  const sql = `
    SELECT last_update FROM last_update WHERE scope = 'global'
  `;
  const {payload} = useQuery({sql});
  if (!payload || payload.length === 0) {
    return null;
  }
  return payload[0].lastUpdate;
}
