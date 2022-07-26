import { TCP } from 'Dependencies';
import { Creature } from 'Creature';
import { CREATURE_TYPE, PARTY_SHIELD, PLAYER_SEX, SKULL, THING_TYPE } from 'Constants';
import { Inventory } from "Game/Player/Inventory.class.ts";
import { Container } from "Game/Container.class.ts";

export class Player extends Creature {
    constructor(name : string, extId: number, client : TCP.Client){
        super();

        if (!client.conn){
            client.close();
        }

        this._name = name;
        this._client = client;
        this._id = client.conn?.rid as number;
        this._extId = extId;
        this._client.addListener(TCP.Event.close, this._connectionListener);
        this._client.addListener(TCP.Event.error, (c : TCP.Client) => {
            c.removeAllListeners();
        });
        this._client.addListener(TCP.Event.shutdown, () => { console.log('connection shutdown')})
        console.log(`Player ${this._name} connected.`);
    }

    private _id : number;
    private _client! : TCP.Client;
    private _knownCreatures: Array<Creature> = [];
    private _inventory : Inventory = new Inventory();
    private _openContainers : Array<Container> = [];
    private _containerIds : Array<number> = Array.from((new Array(10)).keys());
    private _sex : PLAYER_SEX = PLAYER_SEX.MALE;
    protected _thingType = THING_TYPE.PLAYER;
    protected _type = CREATURE_TYPE.CREATURE_TYPE_PLAYER;
    protected _skull : SKULL = SKULL.NONE;
    protected _partyShield : PARTY_SHIELD = PARTY_SHIELD.SHIELD_NONE;

    public get id() : number {
        return this._id;
    }

    public get inventory() : Inventory {
        return this._inventory;
    }

    public get sex() : PLAYER_SEX {
        return this._sex;
    }

    public get skull() : SKULL {
        return this._skull;
    }

    public get partyShield() : PARTY_SHIELD {
        return this._partyShield;
    }

    public set id(value : number) {
        this._id = value;
    }

    public set client(value : TCP.Client) {
        this._client = value;
    }

    public get client() : TCP.Client {
        return this._client;
    }

    public set sex(value : PLAYER_SEX){
        this._sex = value;
    }

    public addOpenContainer(container : Container){
        if (this.containerIsOpen(container)){
            return false;
        }

        if (this._containerIds.length === 0){
            return false;
        }
        console.log(this._containerIds);
        container.containerId = this._containerIds.pop() as number;
        this._openContainers.push(container);
        return true;
    }

    public containerIsOpen(container : Container) : boolean {
        let isOpen = false;

        for (const c of this._openContainers){
            if (c === container){
                isOpen = true;
                break;
            }
        }

        return isOpen;
    }

    public getContainerIdByContainer(container : Container) : number {
        let id = -1;

        for (let i=0; i < this._openContainers.length; i++){
            if (this._openContainers[i] === container){
                id = container.containerId;
                break;
            }
        }

        return id;
    }

    public getLastOpenedContainer() : Container {
        return this._openContainers[this._openContainers.length - 1];
    }

    public getLastOpenedContainerId() : number {
        return this._openContainers.length ? this._openContainers.length - 1 : 0;
    }

    public closeContainerById(id : number) : boolean {

        for (let i=0; i < this._openContainers.length; i++){
            if (this._openContainers[i].containerId === id){
                this._openContainers.splice(i, 1);
                this._containerIds.push(id);
                return true;
            }
        }

        return false;
    }

    public getContainerById(id : number) : Container | null {

        for (const container of this._openContainers){
            if (container.containerId === id){
                return container;
            }
        }

        return null;
    }

    public onMove(){
        console.log(`${this._name} moved.`);
        //Check if need to close containers.
        //maybe by checking if container has parent and while has parent.
        //Eventually will get to top parent. If top parent does not have inventory position then close container.
    }

    private _connectionListener = () => {
        console.log(`Player ${this._name} lost tcp connection.`);
        //If in combat, start timer
    }
}