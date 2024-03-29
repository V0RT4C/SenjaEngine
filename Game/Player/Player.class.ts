import log from 'Logger';
import { TCP } from 'Dependencies';
import { Creature } from 'Creature';
import { CHASE_MODE, PARTY_SHIELD, PLAYER_SEX, SAFE_FIGHT_MODE, SKULL, THING_TYPE } from 'Constants';
import { Inventory } from "Game/Player/Inventory.class.ts";
import { Container } from "Game/Container.class.ts";
import game from '../Game.class.ts';
import { CloseContainerOp } from '../Operations/CloseContainerOp.class.ts';

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
            log.error(`Player ${this.name} had a TCP error.`);
            c.removeAllListeners();
        });
        this._client.addListener(TCP.Event.shutdown, () => { log.debug(`connection shutdown`)})
        log.debug(`Player ${this._name} connected.`);
    }

    private _id : number;
    private _client! : TCP.Client;
    private _lastPing = 0;
    private _knownCreatures: Set<number> = new Set();
    private _inventory : Inventory = new Inventory();
    private _openContainers : Array<Container> = [];
    private _containerIds : Array<number> = Array.from((new Array(10)).keys());
    private _sex : PLAYER_SEX = PLAYER_SEX.MALE;
    protected _thingType = THING_TYPE.PLAYER;
    protected _skull : SKULL = SKULL.NONE;
    protected _partyShield : PARTY_SHIELD = PARTY_SHIELD.SHIELD_NONE;
    protected _chaseMode : CHASE_MODE = CHASE_MODE.OFF;
    protected _safeFightMode : SAFE_FIGHT_MODE = SAFE_FIGHT_MODE.ON;
    protected _loggedInAt = 0;
    protected _previousVisit = 0;

    public get id() : number {
        return this._id;
    }

    public set id(value : number) {
        this._id = value;
    }
    
    public get inventory() : Inventory {
        return this._inventory;
    }

    public get sex() : PLAYER_SEX {
        return this._sex;
    }

    public set sex(value : PLAYER_SEX){
        this._sex = value;
    }

    public get skull() : SKULL {
        return this._skull;
    }

    public get partyShield() : PARTY_SHIELD {
        return this._partyShield;
    }

    public get chaseMode() : CHASE_MODE {
        return this._chaseMode;
    }

    public set chaseMode(value : CHASE_MODE) {
        this._chaseMode = value;
    }

    public get safeFightMode() : SAFE_FIGHT_MODE {
        return this._safeFightMode;
    }

    public set safeFightMode(value : SAFE_FIGHT_MODE) {
        this._safeFightMode = value;
    }

    public set client(value : TCP.Client) {
        this._client = value;
    }

    public get client() : TCP.Client {
        return this._client;
    }

    public get lastPing() : number {
        return this._lastPing;
    }

    public set lastPing(value : number) {
        this._lastPing = value;
    }

    public get openContainers() : Container[] {
        return this._openContainers;
    }

    public get loggedInAt() : number {
        return this._loggedInAt;
    }

    public set previousVisit(timestamp : number){
        this._previousVisit = timestamp;
    }

    public get previousVisit() : number {
        return this._previousVisit;
    }

    public addOpenContainer(container : Container){
        if (this.containerIsOpen(container)){
            return false;
        }
        
        if (this._containerIds.length === 0){
            return false;
        }
        
        container.setContainerId(this._containerIds.pop() as number, this);
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
                id = container.getContainerId(this);
                break;
            }
        }

        return id;
    }

    public closeContainerById(id : number) : boolean {

        for (let i=0; i < this._openContainers.length; i++){
            if (this._openContainers[i].getContainerId(this) === id){
                this._openContainers[i].removeContainerId(this);
                this._openContainers.splice(i, 1);
                this._containerIds.push(id);
                return true;
            }
        }

        return false;
    }

    public getContainerById(id : number) : Container | null {

        for (const container of this._openContainers){
            if (container.getContainerId(this) === id){
                return container;
            }
        }

        return null;
    }

    public onMove(){
        super.onMove();
        log.debug(`${this._name} moved.`);
        this.closeDistantContainers();
        //Check if need to close containers.
        //maybe by checking if container has parent and while has parent.
        //Eventually will get to top parent. If top parent does not have inventory position then close container.
    }

    public closeDistantContainers(){
        log.debug(`CloseDistantContainers`);
        for (const container of this._openContainers){
            if (
                (Math.abs(container.position.x - this.position.x) > 1 || 
                Math.abs(container.position.y - this.position.y) > 1 ||
                container.position.z !== this.position.z) && 
                (container.position.x !== -1)
                ){
                    const containerId = container.getContainerId(this);
                    game.addOperation(new CloseContainerOp(this, containerId));
                }
        }
    }

    public checkCreatureAsKnown(extId : number) : boolean {
        if (this._knownCreatures.has(extId)){
            return true;
        }else{
            this._knownCreatures.add(extId);
            return false;
        }
    }

    public hasActiveWalkTask() : boolean {
        return this._scheduledWalkTasks.length > 0;
    }

    private _connectionListener = () => {
        log.debug(`Player ${this._name} lost tcp connection.`);
        //If in combat, start timer
    }

    public onLogin(): void {
        this._loggedInAt = Date.now();
    }
}