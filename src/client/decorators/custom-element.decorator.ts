export interface ICustomElementOptions {
    template?: string,
    selector: string,
    css?: string,
    requires?: any[],
    options?: ElementDefinitionOptions
}

let templates = {};

export function CustomElement(props: ICustomElementOptions) {
    return function(target) {
        target.whenDefined = window.customElements.whenDefined(props.selector);
        target.selector = props.selector;
        let func = target.prototype.connectedCallback;

        if(props.css) {
            document.head.innerHTML += `<style id="${props.selector}">${props.css.toString()}</style>`;
        }

        target.prototype.connectedCallback = function() {
            if(this._propertiesToBind) {
                for(let property of this._propertiesToBind) {
                    this[property] = this[property].bind(this);
                }
            }

            if (props.template) {
                if(!templates[props.template]) {
                    let node = document.createElement('div');
                    node.innerHTML = props.template;
                    templates[props.template] = node;
                }

                let elementContainer = templates[props.template].cloneNode(true);
                let el;
                while((el = elementContainer.firstChild)) {
                    this.appendChild(el);
                }

                let items = this.querySelectorAll('[bind]');
                this.$ = {};

                for (let item of items) {
                    let property = item.getAttribute('bind');
                    let parts = property.split('-');

                    for (let i = 1; i < parts.length; i++) {
                        let part = parts[i];
                        parts[i] = part.charAt(0).toUpperCase() + part.slice(1);
                    }
                    this.$[parts.join('')] = item;
                }
            }

            if (func) {
                func.call(this, arguments);
            }
        }

        let promises = [];
        if (props.requires) {
            for (let requirement of props.requires) {
                promises.push(requirement.whenDefined);
            }
        }

        Promise.all(promises).then(() => {
            window.customElements.define(props.selector, target, props.options);
        });

        return target;
    }
}
