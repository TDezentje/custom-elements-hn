import { BaseModel } from 'models/base.model';

export class BaseService {
    private jsonHeaders = new Headers();

    constructor() {
        this.jsonHeaders.append('Accept', 'application/json'); // This one is enough for GET requests
        this.jsonHeaders.append('Content-Type', 'application/json');
    }

    protected async getObject<T extends BaseModel>(type: {new(): T; }, path:string) : Promise<T>{
        const resultObj = await this.get(path);
        const result = new type();
        result.deserialize(resultObj);
        return result;
    }

    protected async getArray<T extends BaseModel>(type: {new(): T; }, path:string) : Promise<T[]>{
        const resultObj = await this.get<T[]>(path);
        const result = [];

        for(const child of resultObj) {
            const r = new type();
            r.deserialize(child);
            result.push(r);
        }

        return result;
    }

    protected async get<T>(path:string): Promise<T> {
        const response = await fetch(`/api${path}`, {
            credentials: 'same-origin'
        });

        return await response.json();
    }

    protected async put<T extends BaseModel>(type: {new(): T; }, path:string, body: T): Promise<T> {
        const response = await fetch(`/api${path}`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: this.jsonHeaders,
            body: body.serialize()
        });

        const result = new type();
        result.deserialize(await response.json());

        return result;
    }

    protected async post<T extends BaseModel>(type: {new(): T; }, path:string, body: T): Promise<T> {
        const response = await fetch(`/api${path}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: this.jsonHeaders,
            body: body.serialize()
        });

        const result = new type();
        result.deserialize(await response.json());

        return result;
    }

    protected async delete<T extends BaseModel>(path:string) {
        const response = await fetch(`/api${path}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: this.jsonHeaders
        });
    }
}
