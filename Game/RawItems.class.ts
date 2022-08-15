class RawItems {
    private _items : { [any: number]: any } = {};

    public loadItemsFromJSONFile(path : string){
        const items = JSON.parse(Deno.readTextFileSync(path));
        for (const item of items){
            this._items[item.clientId] = item;
        }
    }

    public getItemById(id : number) : any | null {
        if (this._items[id] === undefined){
            return null;
        }

        return this._items[id];
    }
}

const rawItems = new RawItems();
export default rawItems;