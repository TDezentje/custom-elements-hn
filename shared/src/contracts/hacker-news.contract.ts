import { Item } from 'models/item.model';
import { User } from 'models/user.model';

export interface HackerNewsContract {
    getItems(type: string, page: number): Promise<Item[]>;
    getItem(id: number): Promise<Item>;
    getUser(id: string): Promise<User>;
}