import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { DataContext, DealResponseWrapper, UISettings, APISettings, AllSettings } from './DataModels';
import { getDeals, updateSetting, getSettings, ApiConnectionError, authenticate, subscribe_notification, unsubscribe_notification } from '../api-client/client';
import { useSystemNotification } from './SystemNotification';
import useSnackbarUtils from '../components/SnackbarUtils';
import { useLoading } from '../components/LoadingScreen';
import lineaTokenList from '../external_data/chain59144.json';
import optimismTokenList from '../external_data/chain10.json';
import bnbTokenList from '../external_data/chain56.json';
import mantleTokenList from '../external_data/chain5000.json';
import ethereumTokenList from '../external_data/chain1.json';
import polygonTokenList from '../external_data/chain137.json';
import avalancheTokenList from '../external_data/chain43114.json';
import baseTokenList from '../external_data/chain8453.json';
import arbitrumTokenList from '../external_data/chain42161.json';
import modeTokenList from '../external_data/chain34443.json';
import blastTokenList from '../external_data/chain81457.json';
import zksyncTokenList from '../external_data/chain324.json';

interface PrivateDataContext extends DataContext {
  setAltcoinsDeals: (newData: DealResponseWrapper[]) => void;
  setStablecoinsDeals: (newData: DealResponseWrapper[]) => void;
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
  showOnlyCrosschain: false
}
const defaultApiSettings: APISettings = {
  apiScanInterval: 300,
  ethDerivativesMinProfit: 0.5,
  altcoinsMinProfit: 1,
  stablecoinsMinProfit: 1,
}
const defaultSettings: AllSettings = {
  apiSettings: defaultApiSettings,
  uiSettings: defaultUISettings
}

const defaultPublicContext: DataContext = {
  altcoinsDeals: [],
  stablecoinsDeals: [],
  ethDerivativesDeals: [],
  history: new Map<string, DealResponseWrapper[]>(),
  settings: defaultSettings,
  last_refresh_time: new Date(),
  fetchData: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  loadSettings: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  saveSettings: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  subscribe_notifications: function ():  Promise<{ info: string; status: number }> {
    throw new Error('Function not implemented.');
  },
  unsubscribe_notifications: function ():  Promise<{ info: string; status: number }> {
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
  },
  isTokenSupportedForChain: function (tokenAddress: string, chainName: string): boolean {
    throw new Error('Function not implemented.');
  },
  getStargateBridgeLink: function (rowData: DealResponseWrapper, isBridgeInverted: boolean): string {
    throw new Error('Function not implemented.');
  }
};

const PublicAppContext = createContext<DataContext>(defaultPublicContext);

const PrivateAppContext = createContext<PrivateDataContext | undefined>(undefined);

const ListenerContext = createContext<ListenerContext | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [altcoinsDeals, setAltcoinsDeals] = useState<DealResponseWrapper[]>([]);
  const [stablecoinsDeals, setStablecoinsDeals] = useState<DealResponseWrapper[]>([]);
  const [ethDerivativesDeals, setEthDerivativesDeals] = useState<DealResponseWrapper[]>([]);
  const [history, setHistory] = useState<Map<string, DealResponseWrapper[]>>(new Map<string, DealResponseWrapper[]>());
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);
  const [last_refresh_time, setLastRefreshTime] = useState<Date>(new Date(0))
  const [listeners, setListeners] = useState<Set<() => void>>(new Set());
  const [fetched_deals_ids, setFetched_deals_ids] = useState<Set<string>>(new Set<string>());
  const {showSnackbar} = useSnackbarUtils(); 
  const {showLoadingScreen, hideLoadingScreen} = useLoading();
  const {sendNotification} = useSystemNotification();
  const [chainToTokensMap, setChainToTokensMap] = useState<Map<number, Set<string>>>(new Map<number, Set<string>>());

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  const handleSetAltcoinsDeals = (newData: DealResponseWrapper[]) => {
    setAltcoinsDeals(newData);
    notifyListeners(); 
  };

  const handleSetStablecoinsDeals = (newData: DealResponseWrapper[]) => {
    setStablecoinsDeals(newData);
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
        return {
            ...deal,
            key: deal.source_pair_address + deal.dest_pair_address
        };
    });
      const ethDerivatives : DealResponseWrapper[] = [];
      const altcoins : DealResponseWrapper[] = [];
      const stablecoins : DealResponseWrapper[] = [];

      addToHistory(dealsWrapper);
      const latestDealsWrapper = dealsWrapper.filter(item => new Date(item.date) > last_refresh_time);
      const dealsMap = new Map<string, DealResponseWrapper[]>();
      for (let i = 0; i < latestDealsWrapper.length; i++){
        const deal = latestDealsWrapper[i];
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
        }else if (maxObject.source === 'stablecoins'){
          stablecoins.push(maxObject);
        }else {
          throw Error("Unhandled deal source");
        }
      });

      if (altcoins.length > 0)
        setAltcoinsDeals(altcoins);

      if (stablecoins.length > 0)
        setStablecoinsDeals(stablecoins);

      if (ethDerivatives.length > 0)
        setEthDerivativesDeals(ethDerivatives);

      const timeNow = new Date();
      setLastRefreshTime(timeNow);

      if (settings.uiSettings.pushNotifications){
        sendNotification({
          title: "ArbitrageUI alert",
          message: `Found ${latestDealsWrapper.length} new potential deals`,
          icon: "logo192.png"
        });
      }
    } catch (error) {
      if (error instanceof ApiConnectionError)
        showSnackbar('Unable to fetch data from database - check API connection', 'error');
      throw error;
    } finally {
      hideLoadingScreen();
    }
  };

  const saveSettingsToDatabase = async (key: string, value: string) =>  {
    return updateSetting(key,value);
  }

  const subscribeNotifications = async (email: string, min_profit: number) =>  {
    return subscribe_notification(email,min_profit);
  }

  const unsubscribeNotifications = async (email: string) =>  {
    return unsubscribe_notification(email);
  }

  const loadSettings = async () => {
    const savedPushNotifications = localStorage.getItem('pushNotifications');
    const savedAutoRefresh = localStorage.getItem('autoRefresh');
    const savedRefreshInterval = localStorage.getItem('refreshInterval');
    const savedShowOnlyCrosschain = localStorage.getItem('showOnlyCrosschain');
    showLoadingScreen();
    try {
      const all = await getSettings();
      const DBApiScanInterval = all.find(setting => setting.key === 'apiScanInterval');
      const DBApiAltcoinsMinProfit = all.find(setting => setting.key === 'altcoinsMinProfit');
      const DBApiStablecoinsMinProfit = all.find(setting => setting.key === 'stablecoinsMinProfit');
      const DBApiEthDerivativesMinProfit = all.find(setting => setting.key === 'ethDerivativesMinProfit');

      const savedApiScanInterval = Number(DBApiScanInterval?.value);
      const savedAltcoinsMinProfit = Number(DBApiAltcoinsMinProfit?.value);
      const savedStablecoinsMinProfit = Number(DBApiStablecoinsMinProfit?.value);
      const savedEthDerivativesMinProfit = Number(DBApiEthDerivativesMinProfit?.value);

      const apiSettings : APISettings = {
        apiScanInterval: Number(savedApiScanInterval !== null ? savedApiScanInterval : defaultSettings.apiSettings.apiScanInterval),
        altcoinsMinProfit: Number(savedAltcoinsMinProfit !== null ? savedAltcoinsMinProfit : defaultSettings.apiSettings.altcoinsMinProfit),
        stablecoinsMinProfit: Number(savedStablecoinsMinProfit !== null ? savedStablecoinsMinProfit : defaultSettings.apiSettings.stablecoinsMinProfit),
        ethDerivativesMinProfit: Number(savedEthDerivativesMinProfit !== null ? savedEthDerivativesMinProfit : defaultSettings.apiSettings.ethDerivativesMinProfit)
      }
      const uiSettings : UISettings = {
        pushNotifications:savedPushNotifications !== null ? JSON.parse(savedPushNotifications) : defaultSettings.uiSettings.pushNotifications,
        autoRefresh: savedAutoRefresh !== null ?  JSON.parse(savedAutoRefresh) : defaultSettings.uiSettings.autoRefresh,
        refreshInterval: Number(savedRefreshInterval !== null ? Number(savedRefreshInterval) : defaultSettings.uiSettings.refreshInterval),
        showOnlyCrosschain: savedShowOnlyCrosschain !== null ?  JSON.parse(savedShowOnlyCrosschain) : defaultSettings.uiSettings.showOnlyCrosschain,
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

  const getStargateBridgeLink = (rowData: DealResponseWrapper, isBridgeInverted: boolean) => {
    let srcChain = rowData.source_chain;
    let srcToken = rowData.source_chain_buy_token_address;
    let destChain = rowData.dest_chain;
    let destToken = rowData.dest_chain_sell_token_address;

    if (isBridgeInverted){
      srcChain = rowData.dest_chain;
      srcToken = rowData.dest_chain_buy_token_address;
      destChain = rowData.source_chain;
      destToken = rowData.source_chain_sell_token_address;
    }

    const baseLink = `https://stargate.finance/bridge?srcChain=${srcChain}&srcToken=${srcToken}&dstChain=${destChain}&dstToken=${destToken}`
    return baseLink;
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
      case 'mode':
        return 34443;
      case 'blast':
        return 81457;
      case 'zksync':
        return 324;
      case 'pulsechain':
        return 369;
      default:
        return -1; 
    }
  }

  const isTokenSupportedForChain = (tokenAddress: string, chainName: string) => {
    const chainID = getSupportedChainID(chainName);
    const tokensAddresses = chainToTokensMap.get(chainID) ?? new Set<string>();
    if (tokenAddress) {
        const isSupported = tokensAddresses.has(tokenAddress.toLowerCase());
        return isSupported;
    }
    return false;
};



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
      case 'ambient':
        return 'https://ambient.finance/swap/';
      case 'swapmode':
        return 'https://swapmode.fi/swap';
      case 'oku':
        return "https://oku.trade/";
      case 'quickswap':
        return "https://quickswap.exchange/#/swap";
      case 'ocelex':
        return 'https://pre.ocelex.fi/swap';
      case 'traderjoe' :
        return 'https://lfj.gg/avalanche/trade';
      case 'leetswap' :
        return 'https://base.leetswap.finance/#/swap';
      default:
        return "https://google.com"; 
    }
  }
  
  const initChainToTokensMap = () => {
      const map = new Map<number, Set<string>>();

      const lineaTokensAddresses = new Set<string>(lineaTokenList.result.map(obj => obj.address));
      map.set(59144, lineaTokensAddresses);

      const optimismTokensAddresses = new Set<string>(optimismTokenList.result.map(obj => obj.address));
      map.set(10, optimismTokensAddresses);

      const bnbTokensAddresses = new Set<string>(bnbTokenList.result.map(obj => obj.address));
      map.set(56, bnbTokensAddresses);

      const mantleTokensAddresses = new Set<string>(mantleTokenList.result.map(obj => obj.address));
      map.set(5000, mantleTokensAddresses);

      const ethereumTokensAddresses = new Set<string>(ethereumTokenList.result.map(obj => obj.address));
      map.set(1, ethereumTokensAddresses);

      const polygonTokensAddresses = new Set<string>(polygonTokenList.result.map(obj => obj.address));
      map.set(137, polygonTokensAddresses);

      const avalancheTokensAddresses = new Set<string>(avalancheTokenList.result.map(obj => obj.address));
      map.set(43114, avalancheTokensAddresses);

      const baseTokensAddresses = new Set<string>(baseTokenList.result.map(obj => obj.address));
      map.set(8453, baseTokensAddresses);

      const arbitrumTokensAddresses = new Set<string>(arbitrumTokenList.result.map(obj => obj.address));
      map.set(42161, arbitrumTokensAddresses);

      const modeTokensAddresses = new Set<string>(modeTokenList.result.map(obj => obj.address));
      map.set(34443, modeTokensAddresses);

      const blastTokensAddresses = new Set<string>(blastTokenList.result.map(obj => obj.address));
      map.set(81457, blastTokensAddresses);

      const zksyncTokensAddresses = new Set<string>(zksyncTokenList.result.map(obj => obj.address));
      map.set(324, zksyncTokensAddresses);

      setChainToTokensMap(map);
  }

  useEffect(() => {
    const auth = async () => {
      try{
        await authenticate();
        await loadSettings();
        await fetchData();
      }catch (error){
        
      }
  };
    initChainToTokensMap();
    auth();
  }, []);
  
  return (
    <PrivateAppContext.Provider
      value={{ altcoinsDeals, setAltcoinsDeals: handleSetAltcoinsDeals, stablecoinsDeals, setStablecoinsDeals: handleSetStablecoinsDeals, ethDerivativesDeals, setEthDerivativesDeals: handleSetEthDerivativesDeals, history, setHistory,settings, setSettings, last_refresh_time, setLastRefreshTime, fetched_deals_ids, fetchData:fetchData, loadSettings, saveSettings: saveSettingsToDatabase, subscribe_notifications:subscribeNotifications, unsubscribe_notifications:unsubscribeNotifications, getSupportedDexSite:getSupportedDexSite, getSupportedDexName:getSupportedDexName, getSupportedChainID:getSupportedChainID, isTokenSupportedForChain:isTokenSupportedForChain, getStargateBridgeLink:getStargateBridgeLink}}
    >
      <PublicAppContext.Provider value={{ altcoinsDeals, stablecoinsDeals, ethDerivativesDeals, history, settings, last_refresh_time, fetchData:fetchData ,loadSettings, saveSettings: saveSettingsToDatabase, subscribe_notifications:subscribeNotifications, unsubscribe_notifications:unsubscribeNotifications, getSupportedDexSite:getSupportedDexSite, getSupportedDexName:getSupportedDexName, getSupportedChainID:getSupportedChainID, isTokenSupportedForChain:isTokenSupportedForChain, getStargateBridgeLink:getStargateBridgeLink }}>
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

export const useSettings = () => {
  const { setSettings } = usePrivateDataContext();
  return { setSettings };
};