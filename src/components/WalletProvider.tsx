import { ethers } from 'ethers';

export const Provider = new ethers.BrowserProvider(window.ethereum as any, "any");