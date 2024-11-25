import React, { useEffect } from 'react';
import { useDataContext, useFetchData } from './DataProvider';

export const AutoRefresh: React.FC = () => {
  const { fetchData } = useFetchData();
  const { settings } = useDataContext();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (settings.uiSettings.autoRefresh) {
      interval = setInterval(async () => {
        try{
          await fetchData();
        } catch (err){
        }
      }, settings.uiSettings.refreshInterval * 1000);
    }
   
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [settings.uiSettings.autoRefresh, settings.uiSettings.refreshInterval]);

  return null; 
};