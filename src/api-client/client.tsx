import { DBSetting, DealResponse } from "../data/DataModels";

const baseUrl = 'https://just-readily-baboon.ngrok-free.app/';
const getDealsEndpoint = 'get-deals';
const getSettingsEndpoint = 'get-settings';
const updateSettingEndpoint = 'update-setting';

export class ApiConnectionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiNoConnectionError';
    }
  }

export async function getDeals(): Promise<DealResponse[]> {
    const apiUrl = `${baseUrl}${getDealsEndpoint}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

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
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

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
        const response = await fetch(`${baseUrl}${updateSettingEndpoint}`, {
            method: 'POST',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: bodyJson
        });
         return response.ok &&  response.status === 201;
    } catch {
        return false;
    }
}