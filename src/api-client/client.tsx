import { DBSetting, DealResponse } from "../data/DataModels";

export class ApiConnectionError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiNoConnectionError';
    }
  }

export async function getDeals(): Promise<DealResponse[]> {
    const baseUrl = 'http://127.0.0.1:5010/get-deals';
    const apiUrl = `${baseUrl}`;

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
    const baseUrl = 'http://127.0.0.1:5010/get-settings';
    const apiUrl = `${baseUrl}`;

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
        const response = await fetch('http://127.0.0.1:5010/update-setting', {
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