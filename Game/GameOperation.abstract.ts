export abstract class GameOperation {
    protected abstract _internalOperations(...args : any[]): boolean | Promise<boolean>;
    protected abstract _networkOperations(...args : any[]): boolean | Promise<boolean>;

    public async execute(): Promise<void | boolean> {
        const internalOperationsIsAsync = this._internalOperations.constructor.name === 'AsyncFunction';

        try {
            if (internalOperationsIsAsync){
                if (await this._internalOperations()){
                    await this._networkOperations();
                }
            }else{
                if (this._internalOperations()){
                    await this._networkOperations();
                }
            }
        }catch(err){
            console.log(err);
        }
    }
}