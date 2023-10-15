import { readdirSync, existsSync } from 'fs';
import { Collection, Events } from 'discord.js';
import { resolve } from 'path';

export class Handler {
  /**
   *
   * @param {MiukyFolders} folders
   * @param {DiscordClient} client
   */
  constructor(folders, client) {
    this.folders = folders;
    this.client = client;
  }

  async init() {
    const { commands, events, functions, plugins, resources } = this.folders;

    if (plugins && resolve(plugins)) {
      const pluginsDir = resolve(plugins);

      console.log(
        '────────────────────────────[Plugins]──────────────────────────────'
      );

      const files = await readdirSync(pluginsDir).filter((file) =>
        file.endsWith('.js')
      );
      for (let file of files) {
        const { default: plugin } = await import(
          `file:///${pluginsDir}/${file}`
        );
        await plugin.execute(this.client);
        this.client.debug(`name: ${plugin?.name}`);
      }
    }

    if (events && existsSync(resolve(events))) {
      const eventsDir = resolve(events);

      console.log(
        '────────────────────────────[Events]───────────────────────────────'
      );

      const dirs = await readdirSync(eventsDir, { withFileTypes: true });
      for (let dir of dirs) {
        if (dir.isDirectory()) {
          const files = await readdirSync(`${eventsDir}/${dir.name}`).filter(
            (file) => file.endsWith('.js')
          );
          for (let file of files) {
            const { default: event } = await import(
              `file:///${eventsDir}/${dir.name}/${file}`
            );

            if (event?.once)
              this.client.once(event?.name, (...args) =>
                event?.execute(this.client, ...args)
              );
            else if (!event?.once)
              this.client.on(event?.name, (...args) =>
                event?.execute(this.client, ...args)
              );
            else event?.execute(this.client);

            this.client.debug(
              `name: ${event?.name} - ${
                event?.once !== undefined
                  ? `once: ${event?.once}`
                  : 'type: process'
              }`
            );
          }
        } else {
          const { default: event } = await import(
            `file:///${eventsDir}/${dir.name}`
          );

          if (event?.once)
            this.client.once(event?.name, (...args) =>
              event?.execute(this.client, ...args)
            );
          else if (!event?.once)
            this.client.on(event?.name, (...args) =>
              event?.execute(this.client, ...args)
            );
          else event?.execute(this.client);

          this.client.debug(
            `name: ${event?.name} - ${
              event?.once !== undefined
                ? `once: ${event?.once}`
                : 'type: process'
            }`
          );
        }
      }
    }

    if (commands && existsSync(resolve(commands))) {
      const commandsDir = resolve(commands);

      console.log(
        '────────────────────────────[Commands]─────────────────────────────'
      );

      this.client.commands = new Collection();
      let restCommands = [];

      const dirs = await readdirSync(commandsDir, {
        withFileTypes: true,
      });
      for (let dir of dirs) {
        if (dir.isDirectory()) {
          const files = await readdirSync(`${commandsDir}/${dir.name}`).filter(
            (file) => file.endsWith('.js')
          );
          for (let file of files) {
            const { default: command } = await import(
              `file:///${commandsDir}/${dir.name}/${file}`
            );

            if ('data' in command && 'execute' in command) {
              this.client.commands.set(command?.data?.name, command);
              restCommands.push(command?.data?.toJSON());
              this.client.debug(`name: ${command?.data?.name}`);
            } else
              this.client.debug(`name: ${command?.data?.name} ERROR DETECTED`);
          }
        } else {
          const { default: command } = await import(
            `file:///${commandsDir}/${dir.name}`
          );

          if ('data' in command && 'execute' in command) {
            this.client.commands.set(command?.data?.name, command);
            restCommands.push(command?.data?.toJSON());
            this.client.debug(`name: ${command?.data?.name}`);
          } else
            this.client.debug(`name: ${command?.data?.name} ERROR DETECTED`);
        }
      }

      this.client.once(
        Events.ClientReady,
        async () => await this.client.application.commands.set(restCommands)
      );
    }

    if (functions && existsSync(resolve(functions))) {
      const functionsDir = resolve(functions);
      this.client.functions = [];

      console.log(
        '────────────────────────────[Functions]────────────────────────────'
      );

      const files = readdirSync(functionsDir).filter((file) =>
        file.endsWith('.js')
      );
      for (let file of files) {
        const { default: functionData } = await import(
          `file:///${functionsDir}/${file}`
        );

        this.client.functions[functionData?.name] = functionData?.execute;
        this.client.debug(`name: ${functionData?.name}`);
      }
    }

    if (resources && existsSync(resolve(resources))) {
      const resourcesDir = resolve(resources);
      this.client.res = [];

      console.log(
        '────────────────────────────[Resources]────────────────────────────'
      );

      const dirs = readdirSync(resourcesDir, { withFileTypes: true });
      for (let dir of dirs) {
        if (dir.isDirectory()) {
          const files = await readdirSync(`${resourcesDir}/${dir.name}`).filter(
            (file) => file.endsWith('.json')
          );
          for (let file of files) {
            const { default: jsonData } = await import(
              `file:///${resourcesDir}/${dir.name}/${file}`,
              {
                assert: {
                  type: 'json',
                },
              }
            );

            this.client.res[jsonData?.name] = jsonData?.data;
            this.client.debug(
              `name: ${jsonData?.name} - Category: ${jsonData?.category}`
            );
          }
        } else {
          const { default: jsonData } = await import(
            `file:///${resourcesDir}/${dir.name}`,
            {
              assert: {
                type: 'json',
              },
            }
          );

          this.client.res[jsonData?.name] = jsonData?.data;
          this.client.debug(
            `name: ${jsonData?.name} - Category: ${jsonData?.category}`
          );
        }
      }
    }
  }
}
