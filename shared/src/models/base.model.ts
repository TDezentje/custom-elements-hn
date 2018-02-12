export class BaseModel {
    public serialize() {
        return JSON.stringify(this);
    }

    public deserialize(json: any) {
        Object.assign(this, json)
    }
}