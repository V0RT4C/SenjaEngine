import { Item } from "Item";

export class Container extends Item {
    private _containerId! : number;
    private _items : Array<Item> = [];
    private _capacity = 8;
    private _parent : Container | null = null;

    public get containerId() : number {
        return this._containerId;
    }

    public get items() : Array<Item> {
        return this._items;
    }

    public get capacity() : number {
        return this._rawItem?.attributes?.capacity ? this._rawItem?.attributes?.capacity : this._capacity;
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

    public set containerId(id : number){
        this._containerId = id;
    }

    public set parent(container : Container | null){
        this._parent = container;
    }

    public addItem(item : Item) : boolean {
        const oldLength = this._items.length;

        if (this._items.length < this._capacity){
            if (item instanceof Container){
                item.parent = this;
            }

            const newLength = this._items.unshift(item);

            if ((newLength - oldLength) === 1){
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
                if (item instanceof Container){
                    item.parent = null;
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
                return removedItem;
            }
        }
    }

    public hasParent() : boolean {
        return this._parent !== undefined;
    }
}