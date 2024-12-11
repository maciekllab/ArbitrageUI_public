import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLoading } from "./LoadingScreen";
import useSnackbarUtils from "./SnackbarUtils";
import { useDataContext } from "../data/DataProvider";

export function useEthersProvider() {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [currentChainId, setCurrentChainId] = useState<string | null>(null);
    const {showLoadingScreen, hideLoadingScreen} = useLoading();
    const {showSnackbar} = useSnackbarUtils();
    const {getSupportedChainID} = useDataContext();

    useEffect(() => {
        if (typeof window.ethereum !== "undefined" && window.ethereum !== null) {
            const newProvider = new ethers.BrowserProvider(window.ethereum as any, "any");
            setProvider(newProvider);

            window.ethereum
                .request({ method: "eth_chainId" })
                .then((chainId: string) => setCurrentChainId(chainId));

            window.ethereum.on("chainChanged", (chainId: string) => {
                setCurrentChainId(chainId);
            });

            return () => {
                window.ethereum.removeListener("chainChanged", () => {});
            };
        }
    }, []);

    const switchNetwork = async (chainName: string) => {

        if (typeof window.ethereum !== "undefined") {
            showLoadingScreen();
            try {
                const chainId = getSupportedChainID(chainName);
                const chainIdHex = `0x${chainId.toString(16)}`;
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: chainIdHex }],
                });
                showSnackbar(`Chain changed to '${chainName}'`, "success");
            } catch (error: any) {
                if (error.code === 4902) {
                  showSnackbar(`Chain '${chainName}' is not added to your wallet`, "info");
                } else {
                  showSnackbar(`Failed to change your wallet current chain`, "error");
                }
                console.log(error);
            } finally {
              hideLoadingScreen();
            }
        }
    };

    return { provider, currentChainId, switchNetwork };
}
