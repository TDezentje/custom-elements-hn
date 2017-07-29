import { CustomElement, render } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { Input } from 'decorators/input.decorator';

export interface IRouteParam {
    name: string,
    type?: string
}

export interface IRoute {
    path: string,
    elementFactory(args): Promise<HTMLElement>,
    params?: IRouteParam[];
    regex?: RegExp;
}

@CustomElement({
    selector: 'hn-router',
    template: (el: RouterElement) => <template>
        <div class="view">
            {el.currentRoute}
        </div>
    </template>
})
export class RouterElement extends HTMLElement {
    private _currentRouteId;
    private _scrollPositions = {};

    public currentRoute;

    private _routesAreMatched = false;
    public routes: IRoute[] = [
        {
            path: '/',
            elementFactory: async () => {
                const req = await System.import('../item-list/item-list.element');
                await req.ItemListElement.whenDefined;
                return (new req.ItemListElement('best', 1)) as HTMLElement;
            }
        },
        {
            path: '/[type:(best|newest|show|ask|jobs)]\/[page:number]',
            elementFactory: async (args) => {
                if (args.page < 1) {
                    args.page = 1;
                }

                const req = await System.import('../item-list/item-list.element');
                await req.ItemListElement.whenDefined;
                return (new req.ItemListElement(args.type, args.page)) as HTMLElement;
            }
        },
        {
            path: '/item\/[id:number]',
            elementFactory: async (args) => {
                const req = await System.import('../item/item.element');
                await req.ItemElement.whenDefined;
                return (new req.ItemElement(args.id)) as HTMLElement;
            }
        },
        {
            path: '/user\/[id:string]',
            elementFactory: async (args) => {
                const req = await System.import('../user/user.element');
                await req.UserElement.whenDefined;
                return (new req.UserElement(args.id)) as HTMLElement;
            }
        }
    ];

    constructor() {
        super();
    }

    async connectedCallback() {
        this._matchRoutes();
        this.currentRoute = await this._determineRoute();
    }

    async afterConnectedCallback() {
        if (!this._routesAreMatched) {
            this._matchRoutes();
            
        }

        this._currentRouteId = this.makeid();
        history.replaceState({ index: this._currentRouteId }, '', location.href);

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        window.addEventListener('popstate', this._onPopState);
    }

    private _matchRoutes() {
        for (let route of this.routes) {
            let match;
            route.params = [];
            while ((match = route.path.match(/\[([A-z|0-9]+\:[A-z|0-9|(|)]+)\]/))) {
                let split = match[1].split(':'), regMatch: string, param;
                param = {
                    name: split[0]
                } as IRouteParam;

                if (split.length > 1) {
                    if (split[1].indexOf('(') === 0) {
                        regMatch = split[1];
                        param.type = 'string';
                    } else {
                        param.type = split[1];
                    }
                }
                route.params.push(param);
                route.path = route.path.replace(match[0], regMatch ? regMatch : '(.+)');
            }
            route.regex = new RegExp(`^${route.path}$`);
        }

        this._routesAreMatched = true;
    }

    private async _determineRoute() {
        let path = location.pathname;

        for (let route of this.routes) {
            let match = path.match(route.regex);
            if (match) {
                let args = {};
                for (let i = 1; i < match.length; i++) {
                    let param = route.params[i - 1];
                    if (param.type === 'number') {
                        args[param.name] = parseInt(match[i]);
                    } else {
                        args[param.name] = match[i];
                    }
                }

                return await route.elementFactory(args);
            }
        }
    }

    private async _onPush() {
        this.currentRoute = undefined;

        let prevNode;
        if (this.children.length > 0) {
            prevNode = this.lastChild;
            prevNode.firstChild.style.top = `${-document.body.scrollTop}px`;
            prevNode.classList.add('locked');
        }

        let node = document.createElement('div');
        node.classList.add('view');

        let newRoute = await this._determineRoute();
        node.appendChild(newRoute);
        this.appendChild(node);

        if ('onNavigate' in newRoute) {
            await (newRoute as any).onNavigate(prevNode ? prevNode.firstChild : undefined);
        }

        if (prevNode) {
            this.removeChild(prevNode);
        }

        document.body.scrollTop = this._scrollPositions[this._currentRouteId];
    }

    private makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    navigate(path: string, params?: object) {
        let paramsString = '';

        if (params) {
            for (let key of Object.keys(params)) {
                paramsString += `${key}=${encodeURIComponent(params[key])}&`;
            }
            paramsString = `?${paramsString.slice(0, paramsString.length - 1)}`;
        }

        this.saveScrollPosition();

        this._currentRouteId = this.makeid();
        history.pushState({ index: this._currentRouteId }, '', `${path}${paramsString}`);
        this._onPush();
    }

    private saveScrollPosition() {
        this._scrollPositions[this._currentRouteId] = document.body.scrollTop;
    }

    @Bind
    private _onPopState(event) {
        this.saveScrollPosition();
        this._currentRouteId = event.state.index;
        this._onPush();
    }
}
