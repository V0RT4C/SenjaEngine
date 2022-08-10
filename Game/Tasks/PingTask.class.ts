import { SendPingRequestOperation } from "../../Network/Protocol/Outgoing/SendOperations/CoreSendOperations/SendPingRequestOperation.class.ts";
import game from "../Game.class.ts";
import { Player } from "../Player/Player.class.ts";

export class PingTask {
    public static async processPlayerPing(player : Player, gameTicks : number){
        if (gameTicks % 200 === 0){
            if (player.client.isOpen){
                const ping = new SendPingRequestOperation(player.client);
                await ping.execute();
                player.lastPing = Date.now();
            }else{
                if ((Date.now() - player.lastPing) > 60000){
                    game.removePlayerFromGame(player);
                }
            }
        }
    }
}