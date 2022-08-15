import log from 'Logger';
import { TCP } from '~/deps.ts';
import { TCP_LOGINSERVER_HOST, TCP_LOGINSERVER_PORT } from '../../../config.ts';
import { parseNetworkMessage } from './protocol_receive.ts';

const server = new TCP.Server({ port: TCP_LOGINSERVER_PORT, hostname: TCP_LOGINSERVER_HOST });

server.on(TCP.Event.connect, (client : TCP.Client) => {
    log.debug(`[LOGINSERVER] - New Client - ${client.info()}`);
});

server.on(TCP.Event.receive, (client: TCP.Client, data: TCP.Packet, length: number) => {
    parseNetworkMessage(client, data.toData());
});

export const startServer = async () => {
    server.addListener(TCP.Event.listen, () => {
        log.info(`[LOGINSERVER] - \x1b[32mOnline\x1b[0m, Listening on { \x1b[33m${TCP_LOGINSERVER_HOST}:${TCP_LOGINSERVER_PORT}\x1b[0m }`);
    })
    await server.listen();
}

export default server;