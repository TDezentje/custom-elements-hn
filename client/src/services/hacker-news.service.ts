export class HackerNewsService {
    static async getStories(type: string, page: number): Promise<any> {
        const response = await fetch(`https://node-hnapi.herokuapp.com/${type}?page=${page}`);
        return await response.json();
    }

    static async getItem(itemId: number): Promise<any> {
        const response = await fetch(`https://node-hnapi.herokuapp.com/item/${itemId}`);
        return await response.json();
    }

    static async getUser(userId: string) {
        const response = await fetch(`https://node-hnapi.herokuapp.com/user/${userId}`);
        return await response.json();
    }
}
