const fetch = require('node-fetch');

export function dom() {
    (<any>global).HTMLElement = class {
        public innerHTML: string = '';
        private attributes = {};

        constructor() {
        }

        connectedCallback() {
            
        }

        setAttribute(attr, value) {
            this.attributes[attr] = value;
        }

        getAttribute(attr) {
            return this.attributes[attr];
        }

        removeAttribute(attr) {
            delete this.attributes[attr];
        }

        hasAttribute(attr) {
            return Object.keys(this.attributes).includes(attr);
        }
    };

    //generate mocks form element types
    [
        'FileList',
        'HTMLAnchorElement', 
        'HTMLInputElement', 
        'HTMLFormElement',
        "HTMLButtonElement"
    ].forEach(s => {
        (<any>global)[s] = class {
            constructor() {
    
            }
        };
    });
    
    

    (<any>global).location = {
        pathname: '/'
    };

    (<any>global).fetch = fetch;
}