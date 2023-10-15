import { Miuky } from './src/structures/Client.js';

const client = new Miuky({
  webhookUrl: process.env.WEBHOOK_URL,
  discordOptions: {
    intents: 643,
  },
  folders: {
    events: 'events',
    commands: 'commands',
    functions: 'src/functions',
    plugins: 'src/plugins',
    resources: 'src/resources', // Only JSON files
    interactions: 'src/interactions',
  },
  plugins: {
    netIpc: {
      user: process.env.NETIPC_IDENTITY.split(':')[0],
      pass: process.env.NETIPC_IDENTITY.split(':')[1],
      folder: 'src/plugins/requests',
    },
  },
}).on('Miuky', console.log);

client.connect();
