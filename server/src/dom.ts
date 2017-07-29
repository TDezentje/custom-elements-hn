const fetch = require('node-fetch');

export function dom() {
    (<any>global).HTMLElement = class {
        public innerHTML: string = '';

        constructor() {
        }

        connectedCallback() {
            
        }
    };
    (<any>global).HTMLAnchorElement = class {
        constructor() {

        }
    };

    (<any>global).location = {
        pathname: '/'
    };

    (<any>global).fetch = fetch;
}