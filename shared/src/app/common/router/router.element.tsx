import { CustomElement } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { Inject } from 'decorators/inject.decorator';
import { DomService } from 'services/dom.service';
import { RouterService } from 'services/router.service';
import { routes } from 'app/routes';

let _routesAreMatched = false;

export interface IRoute {
    path: string,
    elementFactory(): Promise<any>,
    params?: string[];
    regex?: RegExp;
}

@CustomElement({
    selector: 'hn-router',
    css: './router.scss'
})
export class RouterElement extends HTMLElement {
    private _currentRouteId;
    private _scrollPositions = {};
    private currentRoute;

    @Inject(DomService)
    private domService: DomService;
    @Inject(RouterService)
    private routerService: RouterService;

    constructor() {
        super();
    }

    async init() {
        if (!_routesAreMatched) {
            this._matchRoutes();
        }
        this.currentRoute = await this._determineRoute();
    }

    render() {
        const me = this;
        return <div class="view">
            {this.currentRoute}
        </div>;
    }

    afterRender() {
        if (!_routesAreMatched) {
            this._matchRoutes();
        }

        //redetermine route for the client side to load the components.
        this._determineRoute();
        this._currentRouteId = this.makeid();
        history.replaceState({ index: this._currentRouteId }, '', location.href);

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        window.addEventListener('popstate', this._onPopState);
    }

    /**
     * Generate regex based on the routes
     */
    private _matchRoutes() {
        for (let route of routes) {
            let match;
            route.params = [];
            while ((match = route.path.match(/:([A-z|0-9]+)/))) {
                let param = match[1];

                route.params.push(param);
                route.path = route.path.replace(match[0], '(.+)');
            }
            route.regex = new RegExp(`^${route.path}$`);
        }

        _routesAreMatched = true;
    }

    private async _determineRoute() {
        let path = this.domService.getPathname();

        for (let route of routes) {
            let match = path.match(route.regex);
            if (match) {
                const params = {};
                for (let i = 1; i < match.length; i++) {
                    const param = route.params[i - 1];
                    params[param] = this.tryTypeConversion(match[i]);
                }

                const queryParams = this.domService.getQueryParams();
                for (const param in queryParams) {
                    params[param] = queryParams[param];
                }
                this.routerService.setParams(params)

                var el = await route.elementFactory();
                await el.whenDefined;
                return new el();
            }
        }
    }

    private tryTypeConversion(val: any) {
        const intVal = parseInt(val);
        if (!isNaN(intVal)) {
            return intVal;
        }

        return val;
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
        node.classList.add(this._css.view);

        let newRoute = await this._determineRoute();
        node.appendChild(newRoute);
        this.appendChild(node);

        if ('onNavigate' in newRoute) {
            await (newRoute as any).onNavigate(prevNode ? prevNode.firstChild : undefined);
        }

        if (prevNode) {
            this.removeChild(prevNode);
        }

        this.dispatchEvent(new Event('routeChanged'));
        document.body.scrollTop = this._scrollPositions[this._currentRouteId];
    }

    private makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    public navigate(path: string, replace?: boolean) {
        this.saveScrollPosition();
        this._currentRouteId = this.makeid();
        if(replace) {
            history.replaceState({ index: this._currentRouteId }, '', path);
        } else {
            history.pushState({ index: this._currentRouteId }, '', path);
        }
        
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

    private static instance: RouterElement;
    public static getInstance() {
        if (!RouterElement.instance) {
            RouterElement.instance = document.querySelector('hn-router') as RouterElement;
        }
        return RouterElement.instance;
    }
}
