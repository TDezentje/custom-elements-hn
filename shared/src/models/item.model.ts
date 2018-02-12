import { BaseModel } from "models/base.model";


export class Item extends BaseModel {
    by: string;
    descendants: number;
    id: number;
    kids: number[];
    comments: Item[];
    deleted: boolean;
    score: number;
    time: string;
    title: string;
    type: string;
    url: string;
    text: string;

    public get domain() {
        if(!this.url) {
            return;
        }

        let hostname;
        if (this.url.indexOf("://") > -1) {
            hostname = this.url.split('/')[2];
        }
        else {
            hostname = this.url.split('/')[0];
        }

        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        return hostname;
    }
}