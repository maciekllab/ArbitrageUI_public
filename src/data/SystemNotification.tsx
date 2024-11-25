import React, { useState } from "react";

export interface SystemNotificationProps {
    title:string;
    message:string;
    icon:string;
}

export const SystemNotification = {
  requestPermission: () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
      });
    } else {
      alert("Your browser does not support system notifications.");
    }
  },

  sendNotification: (props: SystemNotificationProps) => {
    if (Notification.permission === "granted") {
      new Notification(props.title, {
        body: props.message,
        icon: props.icon,
      });
    } else {
      alert("You need to enable push notifications");
    }
  },
};