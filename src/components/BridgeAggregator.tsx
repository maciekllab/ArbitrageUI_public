import { Bridge } from "@socket.tech/plugin";
import { useEthersProvider } from "./WalletProvider";
import { Dialog } from "@mui/material";

export function BridgeAggregator(props: BridgeAggregatorDialogProps) {
    const { defaultSourceChainID, defaultDestinationChainID, defaultSourceTokenAddress, defaultDestinationTokenAddress } = props;
    const {provider} = useEthersProvider();

    return (
        <Bridge
            API_KEY="075f779c-2691-491f-9389-3da42ab60f3a"
            provider={provider}
            defaultDestNetwork={defaultDestinationChainID}
            defaultSourceNetwork={defaultSourceChainID}
            defaultDestToken={defaultDestinationTokenAddress}
            defaultSourceToken={defaultSourceTokenAddress}
            enableSameChainSwaps={true}
        />
    );
}

export interface BridgeAggregatorDialogProps {
    open: boolean;
    onClose: () => void;
    defaultSourceChainID: number;
    defaultDestinationChainID: number;
    defaultSourceTokenAddress: string;
    defaultDestinationTokenAddress: string;
}

export function BridgeAggregatorDialog(props: BridgeAggregatorDialogProps) {
    const { onClose, open, defaultDestinationChainID, defaultSourceChainID, defaultDestinationTokenAddress, defaultSourceTokenAddress } = props;

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <BridgeAggregator
                open={open}
                onClose={onClose}
                defaultSourceChainID={defaultSourceChainID}
                defaultDestinationChainID={defaultDestinationChainID}
                defaultDestinationTokenAddress={defaultDestinationTokenAddress}
                defaultSourceTokenAddress={defaultSourceTokenAddress}
            />
        </Dialog>
    );
}

export default BridgeAggregator;
