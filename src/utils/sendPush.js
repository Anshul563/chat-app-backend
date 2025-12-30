import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async ({
  pushToken,
  title,
  body,
  data,
}) => {
  if (!Expo.isExpoPushToken(pushToken)) return;

  await expo.sendPushNotificationsAsync([
    {
      to: pushToken,
      sound: "default",
      title,
      body,
      data, // used for deep linking
    },
  ]);
};
