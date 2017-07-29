export interface ICustomElementOptions {
    template?: (element: any) => Element[],
    selector: string,
    css?: any,
    requires?: any[],
    options?: ElementDefinitionOptions
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

export function render(element: any, attributes: any, ...children: any[]) {
    if (element === 'template') {
        return children;
    }

    const childElements = [];

    const addChildrenToChildElements = (children) => {
        for (let child of children) {
            if (typeof (child) === 'string' || typeof (child) === 'number') {
                childElements.push(document.createTextNode(<string>child));
            } else if (Array.isArray(child)) {
                addChildrenToChildElements(child);
            } else if(child && child.isRaw) {
                addChildrenToChildElements(convertToHTML(child.content));
            } else if (child) {
                childElements.push(child);
            }
        }
    };
    addChildrenToChildElements(children);

    let el;
    if (typeof (element) === 'string') {
        el = document.createElement(element);
        for (let child of childElements) {
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

        if (props.css && !document.querySelector(`style#${props.selector}`)) {
            document.head.innerHTML += `<style id="${props.selector}">${props.css.toString()}</style>`;
        }

        target.prototype.connectedCallback = function () {
            if (this._propertiesToBind) {
                for (let property of this._propertiesToBind) {
                    this[property] = this[property].bind(this);
                }
            }

            const replaceClassNames = (children: Element[]) => {
                for (let child of children) {
                    if (!child) {
                        continue;
                    }

                    const classAttribute = child.getAttribute('class');
                    if (classAttribute) {
                        const classes = classAttribute.split(' ');

                        for (let className of classes) {
                            if (props.css.locals[className]) {
                                child.classList.remove(className);
                                child.classList.add(props.css.locals[className]);
                            }
                        }
                    }

                    if (child.children) {
                        replaceClassNames(Array.from(child.children));
                    }
                }
            }

            const processChildren = () => {
                const children = props.template(this);

                if (props.css) {
                    //loop children to replace classes
                    replaceClassNames(children);
                }

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

            let connectedCallbackPromise = Promise.resolve();

            if(!this.hasAttribute('ssr')) {
                if (props.template) {
                    processChildren();
                }

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
            }
            
            connectedCallbackPromise.then(() => {
                if (this.childSelectors) {
                    for (let selector of this.childSelectors) {
                        let element = this.querySelector(`[ref="${selector}"]`);

                        if (!element) {
                            throw `Could not find element for property ${target.selector}.${selector}`;
                        }
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
