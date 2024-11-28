import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { DataContext, DealResponseWrapper, UISettings, APISettings, AllSettings } from './DataModels';
import { getDeals, updateSetting, getSettings, ApiConnectionError, authenticate } from '../api-client/client';
import { useSystemNotification } from './SystemNotification';
import useSnackbarUtils from '../components/SnackbarUtils';
import { useLoading } from '../components/LoadingScreen';


interface PrivateDataContext extends DataContext {
  setAltcoinsDeals: (newData: DealResponseWrapper[]) => void;
  setEthDerivativesDeals: (newData: DealResponseWrapper[]) => void;
  setHistory: (newData: Map<string, DealResponseWrapper[]>) => void;
  setSettings: (newData: AllSettings) => void;
  setLastRefreshTime: (newTime: Date) => void;
  fetched_deals_ids: Set<string>;
}

export  interface ListenerContext {
  subscribe: (listener: () => void) => void;
  unsubscribe: (listener: () => void) => void;
}

const defaultUISettings: UISettings = {
  pushNotifications: false,
  autoRefresh: false,
  refreshInterval: 60,
}
const defaultApiSettings: APISettings = {
  apiScanInterval: 300,
  ethDerivativesMinProfit: 0.5,
  altcoinsMinProfit: 1
}
const defaultSettings: AllSettings = {
  apiSettings: defaultApiSettings,
  uiSettings: defaultUISettings
}

const defaultPublicContext: DataContext = {
  altcoinsDeals: [],
  ethDerivativesDeals: [],
  history: new Map<string, DealResponseWrapper[]>(),
  settings: defaultSettings,
  last_refresh_time: new Date(),
  loadSettings: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  saveSettings: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  getSupportedDexSite: function (dexName: string): string {
    throw new Error('Function not implemented.');
  },
  getSupportedDexName: function (dexName: string): string {
    throw new Error('Function not implemented.');
  },
  getSupportedChainID: function (chainName: string): number {
    throw new Error('Function not implemented.');
  }
};

const PublicAppContext = createContext<DataContext>(defaultPublicContext);

const PrivateAppContext = createContext<PrivateDataContext | undefined>(undefined);

const ListenerContext = createContext<ListenerContext | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [altcoinsDeals, setAltcoinsDeals] = useState<DealResponseWrapper[]>([]);
  const [ethDerivativesDeals, setEthDerivativesDeals] = useState<DealResponseWrapper[]>([]);
  const [history, setHistory] = useState<Map<string, DealResponseWrapper[]>>(new Map<string, DealResponseWrapper[]>());
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);
  const [last_refresh_time, setLastRefreshTime] = useState<Date>(new Date())
  const [listeners, setListeners] = useState<Set<() => void>>(new Set());
  const [fetched_deals_ids, setFetched_deals_ids] = useState<Set<string>>(new Set<string>());
  const {showSnackbar} = useSnackbarUtils(); 
  const {showLoadingScreen, hideLoadingScreen} = useLoading();

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  const handleSetAltcoinsDeals = (newData: DealResponseWrapper[]) => {
    setAltcoinsDeals(newData);
    notifyListeners(); 
  };

  const handleSetEthDerivativesDeals = (newData: DealResponseWrapper[]) => {
    setEthDerivativesDeals(newData);
    notifyListeners();
  };

  const subscribe = (listener: () => void) => {
    setListeners((prevListeners) => new Set(prevListeners.add(listener)));
  };

  const unsubscribe = (listener: () => void) => {
    setListeners((prevListeners) => {
      const newListeners = new Set(prevListeners);
      newListeners.delete(listener);
      return newListeners;
    });
  };

  const saveSettingsToDatabase = async (key: string, value: string) =>  {
    return updateSetting(key,value);
  }

  const loadSettings = async () => {
    const savedPushNotifications = localStorage.getItem('pushNotifications');
    const savedAutoRefresh = localStorage.getItem('autoRefresh');
    const savedRefreshInterval = localStorage.getItem('refreshInterval');
    showLoadingScreen();
    try {
      const all = await getSettings();
      const DBApiScanInterval = all.find(setting => setting.key === 'apiScanInterval');
      const DBApiAltcoinsMinProfit = all.find(setting => setting.key === 'altcoinsMinProfit');
      const DBApiEthDerivativesMinProfit = all.find(setting => setting.key === 'ethDerivativesMinProfit');

      const savedApiScanInterval = Number(DBApiScanInterval?.value);
      const savedAltcoinsMinProfit = Number(DBApiAltcoinsMinProfit?.value);
      const savedEthDerivativesMinProfit = Number(DBApiEthDerivativesMinProfit?.value);

      const apiSettings : APISettings = {
        apiScanInterval: Number(savedApiScanInterval !== null ? savedApiScanInterval : defaultSettings.apiSettings.apiScanInterval),
        altcoinsMinProfit: Number(savedAltcoinsMinProfit !== null ? savedAltcoinsMinProfit : defaultSettings.apiSettings.altcoinsMinProfit),
        ethDerivativesMinProfit: Number(savedEthDerivativesMinProfit !== null ? savedEthDerivativesMinProfit : defaultSettings.apiSettings.ethDerivativesMinProfit)
      }
      const uiSettings : UISettings = {
        pushNotifications:savedPushNotifications !== null ? JSON.parse(savedPushNotifications) : defaultSettings.uiSettings.pushNotifications,
        autoRefresh: savedAutoRefresh !== null ?  JSON.parse(savedAutoRefresh) : defaultSettings.uiSettings.autoRefresh,
        refreshInterval: Number(savedRefreshInterval !== null ? Number(savedRefreshInterval) : defaultSettings.uiSettings.refreshInterval)
      }
      setSettings({
        apiSettings: apiSettings,
        uiSettings: uiSettings
      });
      return true;
    } catch (error){
      if (error instanceof ApiConnectionError)
        showSnackbar('Unable to fetch settings from database - check API connection', 'error');
      return false;
    } finally {
      hideLoadingScreen();
    }
  }

  const getSupportedChainID= (chainName: string) => {
    switch (chainName) {
      case 'linea':
        return 59144;
      case 'bnb':
        return 56;
      case 'optimism':
        return 10;
      case 'mantle':
        return 5000;
      case 'ethereum':
        return 1;
      case 'polygon':
        return 137;
      case 'avalanche':
        return 43114;
      case 'base':
        return 8453;
      case 'arbitrum':
        return 42161;
      case 'bsc':
        return 56;
      default:
        return -1; 
    }
  }

  const getSupportedDexName = (dexName: string) => {
    switch (dexName) {
      case 'uniswap':
        return "uni";
      case 'aerodrome':
        return "aero";
      case 'syncswap':
        return "sync";
      case 'pancakeswap':
        return "cake";
      case 'sushiswap':
        return "sushi";
      case 'balancer':
        return "bal";
      case 'ramses':
        return "ram";
      case 'fenix':
        return "phb";
      case 'stargate':
        return "stg";
      case 'camelot':
        return "grail";
      case 'velodrome':
        return "velo";
      case 'fusion':
        return 'fsn';
      case 'thena':
        return 'the';
      case 'fraxswap':
        return 'fxs';
      default:
        return dexName; 
    }
  }

  const getSupportedDexSite = (dexName: string) => {
    switch (dexName) {
      case 'uniswap':
        return "https://app.uniswap.org/swap";
      case 'aerodrome':
        return "https://aerodrome.finance/swap";
      case 'syncswap':
        return "https://syncswap.xyz/";
      case 'pancakeswap':
        return "https://pancakeswap.finance/";
      case 'sushiswap':
        return "https://www.sushi.com/swap";
      case 'balancer':
        return "https://balancer.fi/swap/";
      case 'ramses':
        return "https://www.ramses.exchange/swap";
      case 'fenix':
        return "https://www.fenixfinance.io/trade/swap";
      case 'camelot':
        return "https://app.camelot.exchange/";
      case 'velodrome':
        return "https://velodrome.finance/swap";
      case 'iziswap':
        return "https://izumi.finance/trade/swap";
      case 'fusionx':
        return 'https://fusionx.finance/swap';
      case 'thruster':
        return 'https://www.thrusterhflnance.org/#';
      case 'kim':
        return 'https://app.kim.exchange/swap';
      case 'lynex':
        return 'https://app.lynex.fi/swap';
      case 'nile':
        return 'https://www.nile.build/swap';
      case 'agni':
        return 'https://agni.finance/swap';
      case 'cleo':
        return 'https://cleo.exchange/swap';
      case 'methlab':
        return 'https://www.methlab.xyz/swap';
      case 'merchantmoe':
        return 'https://merchantmoe.com/trade';
      case 'fraxswap':
        return 'https://app.frax.finance/swap/main';
      case 'thena':
        return 'https://thena.fi/';
      default:
        return "https://google.com"; 
    }
  }

  useEffect(() => {
    const auth = async () => {
      try{
        await authenticate();
        loadSettings();
      }catch (error){
        
      }
  };
    auth();
  }, []);
  
  return (
    <PrivateAppContext.Provider
      value={{ altcoinsDeals, setAltcoinsDeals: handleSetAltcoinsDeals, ethDerivativesDeals, setEthDerivativesDeals: handleSetEthDerivativesDeals, history, setHistory,settings, setSettings, last_refresh_time, setLastRefreshTime, fetched_deals_ids, loadSettings, saveSettings: saveSettingsToDatabase, getSupportedDexSite:getSupportedDexSite, getSupportedDexName:getSupportedDexName, getSupportedChainID:getSupportedChainID}}
    >
      <PublicAppContext.Provider value={{ altcoinsDeals, ethDerivativesDeals, history, settings, last_refresh_time, loadSettings, saveSettings: saveSettingsToDatabase, getSupportedDexSite:getSupportedDexSite, getSupportedDexName:getSupportedDexName, getSupportedChainID:getSupportedChainID }}>
        <ListenerContext.Provider value={{ subscribe, unsubscribe }}>
          {children}
        </ListenerContext.Provider>
      </PublicAppContext.Provider>
    </PrivateAppContext.Provider>
  );
};

const usePrivateDataContext = () => {
  const context = React.useContext(PrivateAppContext);
  if (!context) {
    throw new Error('usePrivateDataContext must be used within an AppProvider');
  }
  return context;
};

export const useDataContext = () => {
  const context = React.useContext(PublicAppContext);
  if (!context) {
    throw new Error('useDataContext must be used within an AppProvider');
  }
  return context;
};

export const useListeners = () => {
  const context = React.useContext(ListenerContext);
  if (!context) {
    throw new Error('useListeners must be used within an AppProvider');
  }
  return context;
};

export const useFetchData = () => {
  const { settings, history, fetched_deals_ids, setAltcoinsDeals, setEthDerivativesDeals, setLastRefreshTime } = usePrivateDataContext();
  const {sendNotification} = useSystemNotification();
  const {showSnackbar} = useSnackbarUtils(); 
  const {showLoadingScreen, hideLoadingScreen} = useLoading();

  const addToHistory = (newDeals: DealResponseWrapper[]) => {
    for (let i = 0; i < newDeals.length; i++){
      const item = newDeals[i];
      if (fetched_deals_ids.has(item.deal_id))
        continue;
      
      fetched_deals_ids.add(item.deal_id);
      if (history.has(item.key)){
        history.get(item.key)?.push(item);
      } else {
        history.set(item.key, [item])
      }
    }
  }

  const fetchData = async () => {
    showLoadingScreen();
    try {
      const deals = await getDeals();
      const dealsWrapper: DealResponseWrapper[] = deals.map(deal => {
        const [buy_t, sell_t] = deal.pair.split(":");
        return {
            ...deal,
            key: deal.buy_chain + deal.buy_dex + deal.sell_chain + deal.sell_dex + deal.pair_address,
            buy_token: buy_t,
            sell_token: sell_t
        };
    });
      const ethDerivatives : DealResponseWrapper[] = [];
      const altcoins : DealResponseWrapper[] = [];

      const timeNow = new Date();
      setLastRefreshTime(timeNow);
      addToHistory(dealsWrapper);
      const dealsMap = new Map<string, DealResponseWrapper[]>();
      for (let i = 0; i < dealsWrapper.length; i++){
        const deal = dealsWrapper[i];
        if(dealsMap.has(deal.key)){
          dealsMap.get(deal.key)?.push(deal);
        } else {
          dealsMap.set(deal.key, [deal]);
        }
      }

      dealsMap.forEach((value, key) => {
        const maxObject = value.reduce((prev, current) => {
          return (current.date > prev.date) ? current : prev;
        });
        if (maxObject.source === 'altcoins'){
          altcoins.push(maxObject);
        } else if (maxObject.source === 'eth_derivatives'){
          ethDerivatives.push(maxObject);
        } else {
          throw Error("Unhandled deal source");
        }
      });

      setAltcoinsDeals(altcoins);
      setEthDerivativesDeals(ethDerivatives);
      if (settings.uiSettings.pushNotifications){
        sendNotification({
          title: "ArbitrageUI alert",
          message: `Found ${altcoins.length + ethDerivatives.length} new potential deals`,
          icon: "logo192.png"
        });
      }
      return deals;
    } catch (error) {
      if (error instanceof ApiConnectionError)
        showSnackbar('Unable to fetch data from database - check API connection', 'error');
      throw error;
    } finally {
      hideLoadingScreen();
    }
  };

  return { fetchData };
};

export const useSettings = () => {
  const { setSettings } = usePrivateDataContext();
  return { setSettings };
};