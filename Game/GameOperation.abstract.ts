export abstract class GameOperation {
    protected abstract _internalOperations(...args : any[]): void | Promise<void> | boolean | Promise<boolean>;
    protected abstract _networkOperations(...args : any[]): Promise<void> | boolean | Promise<boolean>;

    public async execute(): Promise<void | boolean> {
        const internalOperationsIsAsync = this._internalOperations.constructor.name === 'AsyncFunction';

        try {
            if (internalOperationsIsAsync){
                await this._internalOperations();
                await this._networkOperations();
            }else{
                this._internalOperations();
                await this._networkOperations();
            }
        }catch(err){
            console.log(err);
        }
    }
}