import { BaseService } from 'services/base.service';
import { HackerNewsContract } from 'contracts/hacker-news.contract';
import { Item } from 'models/item.model';
import { User } from 'models/user.model';

export class HackerNewsService extends BaseService implements HackerNewsContract {
    public getItems(type: string, page: number): Promise<Item[]> {
        return this.getArray<Item>(Item, `/${type}?page=${page}`);
    }

    public getItem(id: number): Promise<Item> {
        return this.getObject<Item>(Item, `/item/${id}`);
    }

    public getUser(id: string): Promise<User> {
        return this.getObject<User>(User, `/user/${id}`);
    }
}
