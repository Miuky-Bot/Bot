import { config } from 'dotenv';
import { ClusterManager } from 'discord-hybrid-sharding';

config();

const Cluster = new ClusterManager('./Miuky.js', {
  token: process.env.DISCORD_TOKEN,
  respawn: true,
});

Cluster.spawn({ timeout: -1 });
