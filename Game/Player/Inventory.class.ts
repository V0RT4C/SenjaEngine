import log from 'Logger';
import { Item } from "Item";
import { INVENTORY_SLOT } from "Constants";
import { Container } from "Game/Container.class.ts";

export class Inventory {
    private _helmet : Item | null = new Item(3365);
    private _amulet : Item | null = null;
    private _backpack : Item | null = new Container(2854);
    private _armor : Item | null = new Item(3366);
    private _shield : Item | null = new Item(3423);
    private _weapon : Item | null = new Item(3288);
    private _legs : Item | null = new Item(3364);
    private _boots : Item | null = new Item(3555);
    private _ring : Item | null = null;
    private _ammunition : Item | null = null;

    public get helmet() : Item | null {
        return this._helmet;
    }

    public get amulet() : Item | null {
        return this._amulet;
    }

    public get backpack() : Item | null {
        return this._backpack;
    }

    public get armor() : Item | null {
        return this._armor;
    }

    public get shield() : Item | null {
        return this._shield;
    }

    public get weapon() : Item | null {
        return this._weapon;
    }

    public get legs() : Item | null {
        return this._legs;
    }

    public get boots() : Item | null {
        return this._boots;
    }

    public get ring() : Item | null {
        return this._ring;
    }

    public get ammunition() : Item | null {
        return this._ammunition;
    }

    public getItemReferenceFromInventory(inventorySlot : INVENTORY_SLOT) : Item | null {
        if (inventorySlot > 10 || inventorySlot < 1){
            //Not an inventory slot
            return null;
        }

        let item : Item | null = null;

        switch(inventorySlot){
            case INVENTORY_SLOT.HELMET:
                item = this._helmet;
                break;
            case INVENTORY_SLOT.AMULET:
                item = this._amulet;
                break;
            case INVENTORY_SLOT.BACKPACK:
                item = this._backpack;
                break;
            case INVENTORY_SLOT.ARMOR:
                item = this._armor;
                break;
            case INVENTORY_SLOT.SHIELD:
                item = this._shield;
                break;
            case INVENTORY_SLOT.WEAPON:
                item = this._weapon;
                break;
            case INVENTORY_SLOT.LEGS:
                item = this._legs;
                break;
            case INVENTORY_SLOT.BOOTS:
                item = this._boots;
                break;
            case INVENTORY_SLOT.RING:
                item = this._ring;
                break;
            case INVENTORY_SLOT.AMMUNITION:
                item = this._ammunition;
                break;
            default:
                return null;
        }

        return item;
    }

    public deleteItemFromInventory(inventorySlot : INVENTORY_SLOT) : boolean {
        if (inventorySlot > 10 || inventorySlot < 1){
            //Not an inventory slot
            return false;
        }


        switch(inventorySlot){
            case INVENTORY_SLOT.HELMET:
                this._helmet = null;
                break;
            case INVENTORY_SLOT.AMULET:
                this._amulet = null;
                break;
            case INVENTORY_SLOT.BACKPACK:
                this._backpack = null;
                break;
            case INVENTORY_SLOT.ARMOR:
                this._armor = null;
                break;
            case INVENTORY_SLOT.SHIELD:
                this._shield = null;
                break;
            case INVENTORY_SLOT.WEAPON:
                this._weapon = null;
                break;
            case INVENTORY_SLOT.LEGS:
                this._legs = null;
                break;
            case INVENTORY_SLOT.BOOTS:
                this._boots = null;
                break;
            case INVENTORY_SLOT.RING:
                this._ring = null;
                break;
            case INVENTORY_SLOT.AMMUNITION:
                this._ammunition = null;
                break;
            default:
                return false;
        }

        return true;
    }

    public getItemAndRemoveFromInventory(inventorySlot : INVENTORY_SLOT) : Item | null {
        const item = this.getItemReferenceFromInventory(inventorySlot);

        if (item === null){
            return null;
        }

        this.deleteItemFromInventory(inventorySlot);
        return item;
    }

    public addItem(item : Item, inventorySlot : INVENTORY_SLOT) : boolean {
        if (inventorySlot > 10 || inventorySlot < 1){
            //Not an inventory slot
            return false;
        }


        switch(inventorySlot){
            case INVENTORY_SLOT.HELMET:
                this._helmet = item;
            break;
            case INVENTORY_SLOT.AMULET:
                this._amulet = item;
            break;
            case INVENTORY_SLOT.BACKPACK:
                this._backpack = item;
            break;
            case INVENTORY_SLOT.ARMOR:
                this._armor = item;
            break;
            case INVENTORY_SLOT.SHIELD:
                this._shield = item;
            break;
            case INVENTORY_SLOT.WEAPON:
                this._weapon = item;
            break;
            case INVENTORY_SLOT.LEGS:
                this._legs = item;
            break;
            case INVENTORY_SLOT.BOOTS:
                this._boots = item;
            break;
            case INVENTORY_SLOT.RING:
                this._ring = item;
            break;
            case INVENTORY_SLOT.AMMUNITION:
                this._ammunition = item;
            break;
            default:
                return false;
        }

        item.position.x = -1;
        log.debug(`Item position now: { x:${item.position.x}, y:${item.position.y}, z:${item.position.z} }`);
        return true;
    }
}