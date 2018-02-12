import { Router } from 'express';
import { BaseModel } from 'models/base.model';

const api = Router();

const regex = /(:[A-z|0-9]+)/g;

interface HttpOptions {
    queryParams?: string[]
}

function getHandler<T extends BaseModel>(method: string, path: string, httpOptions: HttpOptions = {}, ctor?: { new(): T; }) {
    const argNames = [];
    let match;
    while ((match = regex.exec(path)) != null) {
        argNames.push(match[1].substring(1));
    }

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        api[method](path, async (req, res) => {
            const service = new target.constructor();
            service.requestContext = req;
            service.responseContext = res;

            const args = [];
            if (argNames) {
                for (const name of argNames) {
                    args.push(req.params[name]);
                }
            }

            if (method === 'put' || method === 'post') {
                const body = new ctor();
                body.deserialize(req.body);
                args.push(body);
            }

            if (httpOptions.queryParams) {
                for (const name of httpOptions.queryParams) {
                    args.push(req.query[name]);
                }
            }

            try {
                const result = await service[propertyKey](...args);
                res.json(result);
                res.status(200);
            } catch (error) {
                res.sendStatus(400);
            }
        });

        return descriptor;
    };
}

export function HttpPut<T extends BaseModel>(path: string, bodyConstructor: { new(): T; }, httpOptions?: HttpOptions) {
    return getHandler<T>('put', path, httpOptions, bodyConstructor);
}

export function HttpPost<T extends BaseModel>(path: string, bodyConstructor: { new(): T; }, httpOptions?: HttpOptions) {
    return getHandler<T>('post', path, httpOptions, bodyConstructor);
}

export function HttpDelete<T extends BaseModel>(path: string, httpOptions?: HttpOptions) {
    return getHandler<T>('delete', path, httpOptions);
}

export function HttpGet(path: string, httpOptions?: HttpOptions) {
    return getHandler('get', path, httpOptions);
}

console.log('[App: Api] initialized.');
export default api;
