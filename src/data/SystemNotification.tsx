import useSnackbarUtils from "../components/SnackbarUtils";

export interface SystemNotificationProps {
  title: string;
  message: string;
  icon: string;
}

export const useSystemNotification = () => {
  const {showSnackbar} = useSnackbarUtils(); 


  const requestPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(() => {
        showSnackbar("Notification permission requested.", 'info');
      });
    } else {
      showSnackbar("Your browser does not support system notifications.", 'info');
    }
  };

  const sendNotification = (props: SystemNotificationProps) => {
    if (Notification.permission === "granted") {
      new Notification(props.title, {
        body: props.message,
        icon: props.icon,
      });
    } else {
      showSnackbar("You need to enable notifications.", 'info');
    }
  };

  return { requestPermission, sendNotification };
};
