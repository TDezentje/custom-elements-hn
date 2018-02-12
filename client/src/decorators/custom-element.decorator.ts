export interface ICustomElementOptions {
    selector: string,
    css?: any,
    requires?: any[],
    options?: ElementDefinitionOptions,
    args?: string[]
}

function convertToHTML(string) {
    const div = document.createElement('div');
    div.innerHTML = string;
    return div.children;
}

export function raw(content: string) {
    return {
        isRaw: true,
        content: content
    };
}

let _elId = 1;

export function createElement(element: any, attributes: any, ...children: any[]) {
    if(element === 'slot') {
        return this._contentSlot;
    }
    
    const childElements = [];

    const addChildrenToChildElements = (children) => {
        for (let child of children) {
            if (typeof (child) === 'string' || typeof (child) === 'number') {
                childElements.push(document.createTextNode(<string>child));
            } else if (Array.isArray(child)) {
                addChildrenToChildElements(child);
            } else if (child && child.isRaw) {
                addChildrenToChildElements(convertToHTML(child.content));
            } else if (child) {
                childElements.push(child);
            }
        }
    };
    addChildrenToChildElements(children);

    if (attributes && attributes.class && this._css) {
        const classes = attributes.class.split(' ');
        let newClasses = '';

        for (const c of classes) {
            newClasses += (this._css[c] || c) + ' ';
        }

        attributes.class = newClasses;
    }

    let el;
    if (typeof (element) === 'string') {
        el = document.createElement(element);
        for (let child of childElements) {
            el.appendChild(child);
        }
    } else {
        const args = [];

        if (element.args) {
            for (const arg of element.args) {
                args.push(attributes[arg]);
                delete attributes[arg];
            }
        }

        el = new element(...args);
        el._contentSlot = childElements;

        if (el.inputProperties) {
            for (let input of el.inputProperties) {
                el[input] = attributes[input];
                delete attributes[input];
            }
        }
    }

    for (let attr in attributes) {
        if(attributes[attr] !== undefined) {
            if(attr === 'ref') {
                attributes[attr] = `${this._elId}.${attributes[attr]}`;
            }

            el.setAttribute(attr, attributes[attr]);
        }
    }

    return el;
};

export function CustomElement(props: ICustomElementOptions) {
    return function (target) {
        target.whenDefined = window.customElements.whenDefined(props.selector);
        target.selector = props.selector;

        if (props.css && !document.querySelector(`style#${props.selector}`)) {
            document.head.innerHTML += `<style id="${props.selector}">${props.css.toString()}</style>`;
        }

        if (props.args) {
            target.args = props.args;
        }

        target.prototype.connectedCallback = function () {
            this.createElement = createElement.bind(this);

            if (props.css) {
                this._css = props.css.locals;
            }

            if (this._propertiesToBind) {
                for (let property of this._propertiesToBind) {
                    this[property] = this[property].bind(this);
                }
            }

            const appendChildren = (children) => {
                for (let child of children) {
                    if (typeof (child) === 'string') {
                        this.appendChild(document.createTextNode(child));
                    } else if (Array.isArray(child)) {
                        appendChildren(child);
                    } else if (child) {
                        this.appendChild(child);
                    }
                }
            }

            const processChildren = (children) => {
                if (!children) {
                    return;
                } else if (!Array.isArray(children)) {
                    children = [children];
                }

                let child;
                while ((child = this.firstChild)) {
                    this.removeChild(this.firstChild);
                }

                appendChildren(children);
            }

            let connectedCallbackPromise = Promise.resolve();

            if (!this.hasAttribute('ssr')) {
                this._elId = _elId;
                this.setAttribute('_el-id', _elId);
                _elId++;
                
                if (this.init) {
                    let result = this.init();
                    if (result && result.then) {
                        if(this.renderLoader) {
                            processChildren(this.renderLoader());
                        }

                        connectedCallbackPromise = result.then(() => {
                            if(this.clearLoader) {
                                this.clearLoader();
                            }
                        });
                    }
                }

                connectedCallbackPromise = connectedCallbackPromise.then(() => {
                    if(this.render) {
                        processChildren(this.render());
                    }
                });
            }

            connectedCallbackPromise.then(() => {
                const references = this.querySelectorAll('[ref]');
                const elId = this.getAttribute('_el-id');

                for(let i = 0; i < references.length; i++) {
                    const reference = references.item(i);
                    const value = reference.getAttribute('ref').split('.');
                    if(elId === value[0]) {
                        this[value[1]] = reference;
                    }
                }

                if (this.afterRender) {
                    this.afterRender();
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