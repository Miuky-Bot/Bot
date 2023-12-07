export default {
  name: 'uncaughtException',
  async execute(client) {
    return process.on('uncaughtException', (err) => {
      return client.webhook.error(err.stack);
    });
  },
};
