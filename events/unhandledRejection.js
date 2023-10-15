export default {
  name: 'unhandledRejection',
  async execute(client) {
    return process.on('unhandledRejection', (err) => {
      return client.webhook.error(err.stack);
    });
  },
};
