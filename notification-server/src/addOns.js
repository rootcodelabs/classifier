const { searchNotification } = require("./openSearch");
const { serverConfig } = require("./config");

function buildNotificationSearchInterval({
  sessionId,
  interval = serverConfig.refreshInterval,
}) {
  return ({ connectionId, sender }) => {
    const intervalHandle = setInterval(
      () =>
        searchNotification({
          connectionId,
          sessionId,
          sender,
        }),
      interval
    );
    return () => clearInterval(intervalHandle);
  };
}

module.exports = {
  buildNotificationSearchInterval,
};
