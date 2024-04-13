import { readdirSync, existsSync } from 'fs';
import { Collection } from 'discord.js';
import { Server } from 'net-ipc';
import { resolve } from 'path';

export default {
  name: 'net-ipc',
  async execute(client) {
    try {
      const requests = new Collection();
      const requestsDir = resolve(client?.plugins?.netIpc?.folder);

      if (requestsDir && existsSync(requestsDir)) {
        const files = readdirSync(requestsDir).filter((file) =>
          file.endsWith('.js')
        );
        for (let file of files) {
          const { default: requestData } = await import(
            `file://${requestsDir}/${file}`
          );
          requests.set(requestData?.name, requestData);
        }
      }

      client.netIpc = new Server({
        port: 3002, // local change to 3002 | prodution change to 7655,
        tls: true,
        options: {
          pskCallback: (socket, identity) => {
            if (identity === client.plugins.netIpc.user)
              return Buffer.from(client.plugins.netIpc.pass);
          },
          ciphers: 'PSK',
        },
      });

      client.netIpc.on('request', async (req, res, connection) => {
        if (!req.type) return;

        const request = requests.get(req.type);
        if (!request) return;

        return await request.execute(client, req, res, connection);
      });

      client.netIpc.on('connect', (client) => console.log(client?.id));
      client.netIpc.start().catch((err) => {
        client.debug(
          `net-ipc: ${err.options.port} | Connection: ${err.message}!`
        );
      });

      return;
    } catch (err) {
      return client.debug(`net-ipc: error | Connection: ${err.message}!`);
    }
  },
};
