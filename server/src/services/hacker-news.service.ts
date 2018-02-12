import { HttpGet } from 'decorators/http.decorator';
import { BaseService } from 'services/base.service';
import { HackerNewsContract } from 'contracts/hacker-news.contract';
import { Item } from 'models/item.model';
import * as fetch from 'node-fetch';
import { BaseModel } from 'models/base.model';
import { User } from 'models/user.model';
import * as moment from 'moment';

interface Cache {
    value: Promise<any>;
    expiresAt: number;
}

const cache: { [key: string]: Cache } = {};
const pageSize = 30;

export class HackerNewsService extends BaseService implements HackerNewsContract {
    @HttpGet('/:type', {
        queryParams: ['page']
    })
    public async getItems(type: string, page: number) {
        const list = this.loadList(`/${type}stories.json`, page)
        return list;
    }

    @HttpGet('/item/:id')
    public async getItem(id: number) {
        const item = await this.loadItemWithChildren(id);
        return item;
    }

    @HttpGet('/user/:id')
    public async getUser(id: string): Promise<User> {
        const result = await this.get(`/user/${id}.json`);
        const user = new User();
        user.deserialize(result);
        user.created = moment.unix(result.created).fromNow();
        return user;
    }

    private async loadItemWithChildren(id: number) {
        const parent = await this.loadItem(id);
        parent.comments = [];

        if(parent.kids) {
            parent.comments = await Promise.all(
                parent.kids.map(async (kid) => await this.loadItemWithChildren(kid))
            );
        }

        return parent;
    }

    private async loadList(path: string, page: number): Promise<Item[]> {
        const result = [];
        let list: number[] = await this.get(path);

        const start = pageSize * page;
        list = list.slice(start, start + pageSize);

        //Get all articles for the page and remove null values.
        return (await Promise.all(list.map(n => this.loadItem(n)))).filter(i => i);
    }


    private async loadItem(id: number): Promise<Item> {
        const result = await this.get(`/item/${id}.json`);
        const item = new Item();
        item.deserialize(result);
        item.time = moment.unix(result.time).fromNow();
        return item;
    }

    private async get(path: string) {
        const now = (new Date()).getTime();

        for (const key in cache) {
            if (cache[key].expiresAt < now) {
                delete cache[key];
            }
        }

        if (!cache[path]) {
            //15 minutes cache
            cache[path] = {
                expiresAt: now + 900000,
                value: await this.fetchJson(path)
            }
        }

        return cache[path].value;
    }

    private async fetchJson(path: string) {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0${path}`);
        return  await response.json();
    }
}
