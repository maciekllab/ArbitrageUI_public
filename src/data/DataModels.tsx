import exp from "constants";

export interface DealResponse {
    deal_id: string
    buy_chain: string;
    buy_dex: string;
    date: Date;
    pair: string;
    pair_address: string;
    profit: number;
    sell_chain: string;
    sell_dex: string;
    source: string;
    buy_token_address: string;
    sell_token_address: string;
}

export interface DealResponseWrapper extends DealResponse {
    key: string
    buy_token: string
    sell_token: string
}

export interface DBSetting{
    key: string,
    value: string
}

export interface APISettings{
    apiScanInterval: number
    altcoinsMinProfit: number
    ethDerivativesMinProfit: number
}

export interface UISettings {
    pushNotifications: boolean
    autoRefresh: boolean
    refreshInterval: number
}
export interface AllSettings {
    uiSettings: UISettings
    apiSettings: APISettings
}

export interface DataContext {
    altcoinsDeals: DealResponseWrapper[];
    ethDerivativesDeals: DealResponseWrapper[];
    history: Map<string, DealResponseWrapper[]>;
    settings: AllSettings;
    last_refresh_time: Date;
    loadSettings: () => Promise<boolean>;
    saveSettings: (key:string, value:string) => Promise<boolean>;
    getSupportedDexSite: (dexName:string) => string;
    getSupportedDexName: (dexName:string) => string;
    getSupportedChainID: (chainName:string) => number;
}