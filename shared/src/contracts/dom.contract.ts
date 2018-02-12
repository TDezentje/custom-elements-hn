import { BaseModel } from "models/base.model";

export interface DomContract {
    getPathname(): string,
    getQueryParams(): any
    getPostBody<T extends BaseModel>(ctor: {new(): T; }): T;
    getUploadedFiles(): any[];
}