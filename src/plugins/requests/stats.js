import { FLAGS } from '../../structures/extras/Flags.js';
import { getInfo } from 'discord-hybrid-sharding';

export default {
  name: 'stats',
  async execute(client, req, res, connection) {
    try {
      const clusters = await client.cluster.broadcastEval((c) => {
        const shards = [...c.ws.shards.values()];
        const guilds = [...c.guilds.cache.values()];

        let data = [];
        for (let i = 0; i < shards.length; i++) {
          data.push({
            id: shards[i] ? shards[i].id : NaN,
            status: shards[i] ? shards[i].status : 5,
            ping: shards[i] ? shards[i].ping : NaN,
            guildcount: guilds
              ? guilds.filter((x) => x.shardId === shards[i].id).length
              : 0,
          });
        }

        function getRamUsageinMB() {
          let mem = process.memoryUsage();
          return Number((mem.rss / 1024 / 1024).toFixed(2));
        }

        return {
          id: c.cluster.id,
          ram: getRamUsageinMB(),
          cpu: (Math.random() * 3).toFixed(2),
          uptime: c.uptime,
          shards: data,
        };
      });

      const guilds = await client.cluster
        .broadcastEval((c) => c.guilds.cache.size)
        .then((res) => res.reduce((a, b) => a + b, 0));

      return res({
        statusCode: 200,
        statusText: FLAGS.STATUS[200],
        data: {
          totalClusters: client.cluster.count,
          totalShards: getInfo().TOTAL_SHARDS,
          totalGuilds: guilds,
          clusters,
        },
      });
    } catch (err) {
      return res({
        statusCode: 500,
        statusText: err.message,
      });
    }
  },
};
