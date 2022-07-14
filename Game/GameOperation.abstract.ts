export abstract class GameOperation {
    protected abstract _internalOperations(...args : any[]): boolean | Promise<boolean>;
    protected abstract _networkOperations(...args : any[]): boolean | Promise<boolean>;
    public abstract execute(): Promise<void>
}