export class PermanentRedirectError extends Error {
    public path;

    constructor(path:string) {
        super('Permanent Redirect');
        this.path = path;
        Object.setPrototypeOf(this, PermanentRedirectError.prototype);
    }
}