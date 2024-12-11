import exp from "constants";

export interface DealResponse {
    deal_id: string;
    source_token: string;
    dest_token: string;
    dest_chain: string;
    dest_dex: string;
    date: Date;
    pair: string;
    source_pair_address: string;
    dest_pair_address: string;
    profit: number;
    source_chain: string;
    source_dex: string;
    source: string;
    source_chain_buy_token_address: string;
    source_chain_sell_token_address: string;
    dest_chain_buy_token_address: string;
    dest_chain_sell_token_address: string;
}

export interface DealResponseWrapper extends DealResponse {
    key: string
}

export interface DBSetting{
    key: string,
    value: string
}

export interface APISettings{
    apiScanInterval: number
    altcoinsMinProfit: number
    ethDerivativesMinProfit: number
    stablecoinsMinProfit: number
}

export interface UISettings {
    pushNotifications: boolean
    autoRefresh: boolean
    refreshInterval: number
    showOnlyCrosschain: boolean

}
export interface AllSettings {
    uiSettings: UISettings
    apiSettings: APISettings
}

export interface DataContext {
    altcoinsDeals: DealResponseWrapper[];
    stablecoinsDeals: DealResponseWrapper[];
    ethDerivativesDeals: DealResponseWrapper[];
    history: Map<string, DealResponseWrapper[]>;
    settings: AllSettings;
    last_refresh_time: Date;
    fetchData: () => Promise<void>;
    loadSettings: () => Promise<boolean>;
    saveSettings: (key:string, value:string) => Promise<boolean>;
    subscribe_notifications: (email:string, min_profit:number) =>  Promise<{ info: string; status: number }>;
    unsubscribe_notifications: (email:string) =>  Promise<{ info: string; status: number }>;
    getSupportedDexSite: (dexName:string) => string;
    getSupportedDexName: (dexName:string) => string;
    getSupportedChainID: (chainName:string) => number;
    isTokenSupportedForChain: (tokenAddress: string, chainName: string) => boolean;
    getStargateBridgeLink: (rowData: DealResponseWrapper, isBridgeInverted: boolean) => string;
}