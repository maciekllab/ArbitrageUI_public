import { DBSetting, DealResponse } from "../data/DataModels";

const baseUrl = 'https://just-readily-baboon.ngrok-free.app/';
const getDealsEndpoint = 'get-deals';
const getSettingsEndpoint = 'get-settings';
const updateSettingEndpoint = 'update-setting';
const authenticateEndpoint = 'auth';
const subscribeEndpoint = 'subscribe-notification';
const unsubscribeEndpoint = 'unsubscribe-notification';

export class ApiConnectionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiNoConnectionError';
    }
  }

function createHeaders(): HeadersInit {
    return {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };
}

async function fetchWithTimeout(resource: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const signal = controller.signal;

    try {
        const response = await fetch(resource, { ...options, signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiConnectionError('Request aborted - check API connection');
        }
        throw error;
    }
}

export async function authenticate(): Promise<null> {
    const apiUrl = `${baseUrl}${authenticateEndpoint}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: createHeaders(),
            credentials: 'include',
        });

        if (!response.ok)
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        
        return null;

    } catch (error) {
        if (error instanceof TypeError) {
            throw new ApiConnectionError(error.message)
        } else {
            throw error;
        }
    }
}

export async function getDeals(): Promise<DealResponse[]> {
    const apiUrl = `${baseUrl}${getDealsEndpoint}`;

    try {
        const response = await fetchWithTimeout(apiUrl, {
            method: 'GET',
            headers: createHeaders(),
            credentials: 'include',
        }, 2000);

        if (!response.ok)
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        
        const result: DealResponse[] = await response.json();
        return result;

    } catch (error) {
        if (error instanceof TypeError) {
            throw new ApiConnectionError(error.message)
        } else {
            throw error;
        }
    }
}

export async function getSettings(): Promise<DBSetting[]> {
    const apiUrl = `${baseUrl}${getSettingsEndpoint}`;

    try {
        const response = await fetchWithTimeout(apiUrl, {
            method: 'GET',
            headers: createHeaders(),
            credentials: 'include',
        }, 2000);

        if (!response.ok)
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        
        const result: DBSetting[] = await response.json();
        return result;

    } catch (error) {
        if (error instanceof TypeError) {
            throw new ApiConnectionError(error.message)
        } else {
            throw error;
        }
    }
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
    const bodyJson = JSON.stringify({ key, value });
    try {
        const response = await fetchWithTimeout(`${baseUrl}${updateSettingEndpoint}`, {
            method: 'POST',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyJson, 
            credentials: 'include',
        }, 1000);
         return response.ok &&  response.status === 201;
    } catch {
        return false;
    }
}

export async function subscribe_notification(email: string, min_profit: number): Promise<{ info: string; status: number }> {
    const bodyJson = JSON.stringify({
        email: email,
        min_profit: min_profit
    });
    try {
        const response = await fetchWithTimeout(`${baseUrl}${subscribeEndpoint}`, {
            method: 'POST',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyJson, 
            credentials: 'include',
        }, 10000);

        const responseData = await response.json();

        return {
            info: responseData.info,
            status: response.status
        };
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError')
            return {
                info: "Unable to process subscription request - check API connection",
                status: 503
            };
        }
        return {
            info: "Error occured during processing email subscription request",
            status: 500
        };
    }

    export async function unsubscribe_notification(email: string): Promise<{ info: string; status: number }> {
        const bodyJson = JSON.stringify({
            email: email,
        });
        try {
            const response = await fetchWithTimeout(`${baseUrl}${unsubscribeEndpoint}`, {
                method: 'POST',
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: bodyJson, 
                credentials: 'include',
            }, 1000);
            
            const responseData = await response.json();

            return {
                info: responseData.info,
                status: response.status
            };
        } catch (error) {
            return {
                info: "An error occurred while unsubscribing",
                status: 500
            };
        }
    }