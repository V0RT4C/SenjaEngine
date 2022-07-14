export abstract class OutgoingSendOperation {
    public abstract execute() : Promise<void>
}