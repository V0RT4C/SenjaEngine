import { Item } from "Item";
import { Player } from "./Player/Player.class.ts";

export class Container extends Item {
    private _containerIds : { [playerId : number] : number } = {};
    private _items : Array<Item> = [];
    private _capacity = 8;
    private _parent : Container | null = null;


    public get items() : Array<Item> {
        return this._items;
    }

    public get capacity() : number {
        return this._rawItem?.attributes?.capacity ? this._rawItem?.attributes?.capacity : this._capacity;
    }

    public set capacity(value : number) {
        if (value < 40 && value > 0){
            this._capacity = value;
        }
        else if (value === 0 || value < 0){
            this._capacity = 1;
        }
        else{
            this._capacity = 40;
        }
    }

    public isFull() : boolean {
        return this._items.length === this._capacity;
    }

    public get parent() : Container | null {
        if (this._parent === undefined){
            return null;
        }else{
            return this._parent;
        }
    }

    public set parent(container : Container | null){
        this._parent = container;
    }

    public setContainerId(id : number, player : Player) : void {
        this._containerIds[player.id] = id;
    }

    public getContainerId(player : Player) : number {
        if (this._containerIds[player.id] != undefined){
            return this._containerIds[player.id];
        }else{
            return -1;
        }
    }

    public getChildContainers(){
        const childContainers = [];

        for (const item of this._items){
            if (item.isContainer()){
                childContainers.push(item);
            }
        }

        return childContainers;
    }

    public addItem(item : Item) : boolean {
        const oldLength = this._items.length;

        if (this._items.length < this._capacity){
            if (item.isContainer()){
                (item as Container).parent = this;
            }

            const newLength = this._items.unshift(item);

            if ((newLength - oldLength) === 1){
                item.setPosition(this.position);
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    public removeItem(slot : number) : Item | null {
        if (slot > this._items.length || slot < 0){
            return null;
        }else{
            const item = this._items.splice(slot, 1)[0];

            if (item === undefined){
                return null;
            }else{
                if (item.isContainer()){
                    (item as Container).parent = null;
                }
                return item;
            }
        }
    }

    public getItemBySlotId(slotId : number) : Item | null { //slotId is just index of array
        if (this._items[slotId] === undefined){
            return null;
        }

        return this._items[slotId];
    }

    public removeItemBySlotId(slotId : number) : Item | null {
        if (this._items[slotId] === undefined){
            return null;
        }else{
            const removedItem = this._items.splice(slotId, 1)[0];

            if (removedItem === undefined){
                return null;
            }else{
                if (removedItem instanceof Container){
                    removedItem.parent = null;
                }
                return removedItem;
            }
        }
    }

    public removeContainerId(player : Player) : void {
        if (this._containerIds[player.id] !== undefined){
            delete this._containerIds[player.id];
        }
    }

    public hasParent() : boolean {
        return this._parent !== undefined;
    }

    public getPlayerSpectatorIds(){
        return Object.keys(this._containerIds).map((id) => Number(id));
    }

    public onMove(): void {
        for (const item of this._items){
            item.setPosition(this.position);
        }
    }
}