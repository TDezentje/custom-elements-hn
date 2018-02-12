import { IRoute } from "app/common/router/router.element";

const routes: IRoute[] = [
    {
        path: '/',
        elementFactory: async () => (await System.import(
            /* webpackChunkName: "list" */
            'app/pages/list/list.element'
        )).ListElement
    },
    {
        
        path: '/item/:id',
        elementFactory: async () => (await System.import(
            /* webpackChunkName: "item" */
            'app/pages/item/item.element'
        )).ItemElement
    },
    {
        
        path: '/user/:id',
        elementFactory: async () => (await System.import(
            /* webpackChunkName: "user" */
            'app/pages/user/user.element'
        )).UserElement
    },
    {
        path: '/:type',
        elementFactory: async () => (await System.import(
            /* webpackChunkName: "list" */
            'app/pages/list/list.element'
        )).ListElement
    }
];

export { routes };