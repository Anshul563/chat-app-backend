export const isChatMuted = (user, chatId) => {
  const mute = user.mutedChats.find(
    (m) => m.chatId.toString() === chatId.toString()
  );

  if (!mute) return false;

  if (!mute.mutedUntil) return true; // forever

  return mute.mutedUntil > new Date();
};
