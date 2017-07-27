const cache = {};

export class HackerNewsService {
    static async getStories(type: string, page:number): Promise<any> {
        let key = `https://node-hnapi.herokuapp.com/${type}?page=${page}`;
        if (!(key in cache)) {
            const response = await fetch(key);
            cache[key] = await response.json();
        }

        return cache[key];
    }

    static async getItem(itemId: number): Promise<any> {
        if (!(itemId in cache)) {
            const response = await fetch(`https://node-hnapi.herokuapp.com/item/${itemId}`);
            const item = await response.json();
            cache[itemId] = item;
        }

        return cache[itemId];
    }

    static async getUser(userId: string) {
        if (!(userId in cache)) {
            const response = await fetch(`https://node-hnapi.herokuapp.com/user/${userId}`);
            const item = await response.json();
            cache[userId] = item;
        }

        return cache[userId];
    }
}
