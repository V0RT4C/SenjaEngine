import { TCP } from '~/deps.ts';
import { parseNetworkMessage } from './protocol_receive.ts';

const server = new TCP.Server({ port: 7171 });

server.on(TCP.Event.connect, (client : TCP.Client) => {
    console.log("[LOGINSERVER] - New Client -", client.info());
});

server.on(TCP.Event.receive, (client: TCP.Client, data: TCP.Packet, length: number) => {
    parseNetworkMessage(client, data.toData());
});

export default server;