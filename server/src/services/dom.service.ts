import { BaseService } from 'services/base.service';
import { DomContract } from 'contracts/dom.contract';
import { BaseModel } from 'models/base.model';

export class DomService extends BaseService implements DomContract {
    public getQueryParams(): any {
        const result = this.requestContext.query;

        for (const key in result) {
            const intVal = parseInt(result[key]);
            if (!isNaN(intVal)) {
                result[key] = intVal;
            }
        }

        return result;
    }

    public getPathname(): string {
        return this.requestContext.originalUrl.split('?')[0];
    }

    public getPostBody<T extends BaseModel>(ctor: { new(): T; }): T {
        if (this.requestContext.method === 'GET') {
            return;
        }

        const result = new ctor();
        result.deserialize(this.requestContext.body);
        return result;
    }

    public getUploadedFiles(): any[] {
        if (this.requestContext.files) {
            return this.requestContext.files.map(f => ({
                name: f.originalname,
                buffer: f.buffer,
                type: f.mimetype
            }));
        }
        return [];
    }
}