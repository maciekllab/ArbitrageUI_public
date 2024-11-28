import { ethers } from 'ethers';

let Provider: ethers.BrowserProvider | null = null;

try {
  if (typeof window.ethereum !== 'undefined' && window.ethereum !== null) {
    Provider = new ethers.BrowserProvider(window.ethereum as any, "any");
  }
} catch (error) {
}

export { Provider };
