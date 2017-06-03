import { CustomElement } from 'decorators/custom-element.decorator';

import { ToolbarElement } from './toolbar/toolbar.element';
import { RouterElement } from './router/router.element';

interface IElements {
    router: RouterElement
}

@CustomElement({
    selector: 'hn-app',
    requires: [RouterElement, ToolbarElement],
    template: require('./app.html'),
    css: require('./app.scss')
})
export class App extends HTMLElement {
    private $: IElements;

    constructor() {
        super();
    }

    connectedCallback() {
        document.body.classList.remove('loading');

        this.$.router.registerRoutes([
            {
                path: '/',
                elementFactory: () => {
                    return new Promise(resolve => {
                        require.ensure([], async require => {
                            const req: any = require('./item-list/item-list.element');
                            
                            await req.ItemListElement.whenDefined;
                            resolve(<HTMLElement>(new req.ItemListElement('best', 1)));
                        });
                    });
                }
            },
            {
                path: '/[type:(best|newest|show|ask|jobs)]\/[page:number]',
                elementFactory: args => {
                    if (args.page < 1) {
                        args.page = 1;
                    }
                    return new Promise(resolve => {
                        require.ensure(['./item-list/item-list.element'], async require => {
                            const req: any = require('./item-list/item-list.element');
                            
                            await req.ItemListElement.whenDefined;
                            resolve(<HTMLElement>(new req.ItemListElement(args.type, args.page)));
                        });
                    });
                }
            },
            {
                path: '/item\/[id:number]',
                elementFactory: args => {
                    return new Promise(resolve => {
                        require.ensure(['./item/item.element'], async require => {
                            const req: any = require('./item/item.element');
                            
                            await req.ItemElement.whenDefined;
                            resolve(<HTMLElement>(new req.ItemElement( args.id)));
                        });
                    });
                }
            },
            {
                path: '/user\/[id:string]',
                elementFactory: args => {
                    return new Promise(resolve => {
                        require.ensure(['./user/user.element'], async require => {
                            const req: any = require('./user/user.element');

                            await req.UserElement.whenDefined;
                            resolve(<HTMLElement>(new req.UserElement(args.id)));
                        });
                    });
                }
            }
        ]);
    }
}
