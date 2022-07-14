import { TCP } from 'Dependencies';
import { parseNetworkMessage } from 'Network/Protocol/Incoming/protocol_receive.ts';

const server = new TCP.Server({ port: 7373 });

server.on(TCP.Event.connect, (client : TCP.Client) => {
    console.log("[GAMESERVER] - New Client -", client.info());
});

server.on(TCP.Event.receive, async (client: TCP.Client, data: TCP.Packet, length: number) => {
    await parseNetworkMessage(client, data.toData());
});

export default server;