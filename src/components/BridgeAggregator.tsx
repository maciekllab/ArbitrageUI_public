import { Bridge } from "@socket.tech/plugin";
import { Provider } from "./WalletProvider"
import { Dialog } from "@mui/material";

export function BridgeAggregator(props: BridgeAggregatorDialogProps) {
    return (
        <Bridge
            API_KEY="645b2c8c-5825-4930-baf3-d9b997fcd88c"
			provider={Provider}       
            defaultDestNetwork={props.defaultDestinationChainID}
            defaultSourceNetwork={props.defaultSourceChainID}
            defaultDestToken={props.defaultDestinationTokenAddress}
            defaultSourceToken={props.defaultSourceTokenAddress}
		/>
    )
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