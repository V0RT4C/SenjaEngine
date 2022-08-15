import log from 'Logger';
import { TCP } from 'Dependencies';
import { TCP_GAMESERVER_HOST, TCP_GAMESERVER_PORT } from '~/config.ts';
import { NetworkMessageHandler } from 'Network/Lib/NetworkMessageHandler.class.ts';
import coreOperations from 'CoreOperations/exports.ts';

const networkMessageHandler = new NetworkMessageHandler();
networkMessageHandler.useOperations(coreOperations);

const server = new TCP.Server({ port: TCP_GAMESERVER_PORT, hostname: TCP_GAMESERVER_HOST });

server.on(TCP.Event.connect, (client : TCP.Client) => {
    log.debug(`[GAMESERVER] - New Client - ${client.info()}`);
});

server.on(TCP.Event.receive, (client: TCP.Client, data: TCP.Packet, length: number) => {
    networkMessageHandler.handleNetworkMessage(client, data.toData());
});


export const startServer = async () => {
    server.addListener(TCP.Event.listen, () => {
        log.info(`[GAMESERVER] - \x1b[32mOnline\x1b[0m, Listening on { \x1b[33m${TCP_GAMESERVER_HOST}:${TCP_GAMESERVER_PORT}\x1b[0m }`);
    })
    await server.listen();
}

export default server;