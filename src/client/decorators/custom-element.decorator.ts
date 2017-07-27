export interface ICustomElementOptions {
    template?: (element: any) => HTMLElement[],
    selector: string,
    css?: string,
    requires?: any[],
    options?: ElementDefinitionOptions
}

let templates = {};

export function render(element: any, attributes: any, ...children: any[]) {
    if (element === 'template') {
        return children;
    }

    const childElements = [];
    for (let child of children) {
        if (typeof (child) === 'string' || typeof (child) === 'number') {
            childElements.push(document.createTextNode(<string>child));
        } else if (Array.isArray(child)) {
            for (let subChild of child) {
                if (typeof (subChild) === 'string') {
                    childElements.push(document.createTextNode(subChild));
                } else {
                    childElements.push(subChild);
                }
            }
        } else if (child) {
            childElements.push(child);
        }
    }

    let el;
    if (typeof (element) === 'string') {
        el = document.createElement(element);
        for(let child of childElements) {
            el.appendChild(child);
        }

    } else {
        el = document.createElement(element.selector);

        el.contentSlot = childElements;

        if (el.inputProperties) {
            for (let input of el.inputProperties) {
                el[input] = attributes[input];
                delete attributes[input];
            }
        }
    }

    for (let attr in attributes) {
        el.setAttribute(attr, attributes[attr]);
    }

    return el;
}

export function CustomElement(props: ICustomElementOptions) {
    return function (target) {
        target.whenDefined = window.customElements.whenDefined(props.selector);
        target.selector = props.selector;
        let func = target.prototype.connectedCallback;

        if (props.css) {
            document.head.innerHTML += `<style id="${props.selector}">${props.css.toString()}</style>`;
        }

        target.prototype.connectedCallback = function () {
            if (this._propertiesToBind) {
                for (let property of this._propertiesToBind) {
                    this[property] = this[property].bind(this);
                }
            }

            const processChildren = () => {
                const children = props.template(this);

                let child;
                while ((child = this.firstChild)) {
                    this.removeChild(this.firstChild);
                }

                for (child of children) {
                    if (typeof (child) === 'string') {
                        this.appendChild(document.createTextNode(child));
                    } else if (child) {
                        this.appendChild(child);
                    }
                }
            }

            if (props.template) {
                processChildren();
            }

            let connectedCallbackPromise = Promise.resolve();
            let shouldRefresh = false;

            if (func) {
                shouldRefresh = true;

                let result = func.call(this, arguments);
                if (result && result.then) {
                    connectedCallbackPromise = result;
                }
            }

            if (props.template && shouldRefresh) {
                connectedCallbackPromise = connectedCallbackPromise.then(() => {
                    processChildren();
                });
            }

            connectedCallbackPromise.then(() => {
                if (this.childSelectors) {
                    for (let selector of this.childSelectors) {
                        let element = this.querySelector(`[ref="${selector}"]`);

                        if (!element) {
                            throw `Could not find element for property ${target.selector}.${selector}`;
                        }
                        element.removeAttribute('ref');
                        this[selector] = element;
                    }
                }

                if (this.afterConnectedCallback) {
                    this.afterConnectedCallback();
                }
            });
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
