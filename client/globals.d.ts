declare class System {
    static import (request: string): Promise<any>
}

declare interface HTMLElement {
    requestContext: any;
    responseContext: any;
    _css: any;
}