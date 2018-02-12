import { DomContract } from 'contracts/dom.contract';
import { BaseModel } from 'models/base.model';

export class DomService implements DomContract {
    public getQueryParams(): any {
        const result = {};

        if (!location.search) {
            return result;
        }

        const keyValuePairs = location.search.substr(1).split('&');

        for (const kvp of keyValuePairs) {
            const val = kvp.split('=');
            let value: any = decodeURIComponent(val[1]);

            const intVal = parseInt(value);
            if (!isNaN(intVal)) {
                value = intVal;
            }

            result[val[0]] = value;
        }

        return result;
    }

    public getPathname(): string {
        return location.pathname;
    }

    public getPostBody<T extends BaseModel>(ctor: { new(): T; }): T {
        //This method is only for SSR
        return null;
    }

    public getUploadedFiles(): any[] {
        //This method is only for SSR
        return null;
    }
}
