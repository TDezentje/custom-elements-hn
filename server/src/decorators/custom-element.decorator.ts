import { PermanentRedirectError } from "errors/permanent-redirect.error";

export interface ICustomElementOptions {
    selector: string,
    css?: any,
    requires?: any[],
    options?: ElementDefinitionOptions,
    args?: string[]
}

export class StyleRegistry {
    private static registry = {};

    public static register(selector: string, style: string) {
        this.registry[selector] = style;
    }

    public static get(selector: string) {
        return this.registry[selector];
    }
}

async function processChildren(children, requestContext, responseContext) {
    children = await Promise.all(children);
    let content = '';
    for (let child of children) {
        if (!child) {
            child = '';
        } else if (typeof (child) !== 'string' && child.connectedCallback) {
            child.requestContext = requestContext;
            child.responseContext = responseContext;
            addElementId(child, requestContext);

            await child.connectedCallback();
            child = `<${child.selector} _el-id="${child._elId}" ssr>${child.innerHTML}</${child.selector}>`;
        } else if (Array.isArray(child)) {
            child = await processChildren(child, requestContext, responseContext);
        } else if (child.isRaw) {
            child = child.content;
        }

        content += child;
    }

    return content;
}

function addElementId(element, requestContext) {
    if(!requestContext.elId) {
        requestContext.elId = 1;
    }

    element._elId = requestContext.elId;
    requestContext.elId++;
}

export function raw(content: string) {
    return {
        isRaw: true,
        content: content
    };
}

export async function createElement(element: any, attributes: any, ...children: any[]) {
    attributes = attributes || {};

    if(element === 'slot') {
        return this._contentSlot;
    }

    //escape html
    for (let [index, child] of children.entries()) {
        if (typeof(child) === 'string') {
            children[index] = child.replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    }

    let content = await processChildren(children, this.requestContext, this.responseContext);

    if(attributes.class && this._css) {
        const classes = attributes.class.split(' ');
        let newClasses = '';

        for(const c of classes) {
            newClasses += (this._css[c] || c) + ' ';
        }

        attributes.class = newClasses;
    }

    const createAttributeString = () => {
        let attributeString = '';
        for (let attr in attributes) {
            let val = attributes[attr];

            if(attr === 'ref') {
                val = `${this._elId}.${val}`;
            }

            if(typeof(val) === 'boolean') {
                attributeString += ` ${attr}`;
            } else if(val !== undefined){
                attributeString += ` ${attr}="${val}"`;
            }
        }
        return attributeString;
    }

    if (typeof (element) === 'string') {
        if(element !== 'input') {
            return `<${element}${createAttributeString()}>${content}</${element}>`;
        } else {
            return `<${element}${createAttributeString()}/>`;
        }
    } else {
        const args = [];

        if(element.args) {
            for(const arg of element.args) {
                args.push(attributes[arg]);
                delete attributes[arg];
            }
        }

        const el = new element(...args);
        el.requestContext = this.requestContext;
        el.responseContext = this.responseContext;
        el._contentSlot = raw(content);

        addElementId(el, this.requestContext);

        for (let attr in attributes) {
            el.setAttribute(attr, attributes[attr]);
        }

        await el.connectedCallback();
        return `<${element.selector}${createAttributeString()} _el-id="${el._elId}" ssr>${el.innerHTML}</${element.selector}>`;
    }
}

export function CustomElement(props: ICustomElementOptions) {
    return function (target) {
        target.whenDefined = Promise.resolve();
        target.selector = props.selector;

        if (props.css) {
            StyleRegistry.register(props.selector, `<style id="${props.selector}">${props.css.toString()}</style>`);
        }
        
        if(props.args) {
            target.args = props.args;
        }

        target.prototype.connectedCallback = async function () {
            this.createElement = createElement.bind(this);
            this.selector = target.selector;

            if (props.css) {
                this._css = props.css.locals;
            }

            if (this._propertiesToBind) {
                for (let property of this._propertiesToBind) {
                    this[property] = this[property].bind(this);
                }
            }

            if (this._injectedServices) {
                for (let service of this._injectedServices) {
                    service.requestContext = this.requestContext;
                    service.responseContext = this.responseContext;
                }
            }

            let promise = Promise.resolve();

            if (this.requestContext.method === 'POST' && this.onPost) {
                const result = this.onPost();
                if (result && result.then) {
                    promise = result.catch(error => {
                        if (error instanceof PermanentRedirectError) {
                            this.responseContext.redirect(301, error.path);
                        }
                    });
                }
            }

            if (this.init) {
                const result = this.init();
                if (result && result.then) {
                    promise = promise.then(() => result);
                }
            }

            if (!this.render) {
                return Promise.resolve();
            }

            return promise.then(() => {
                const result : Array<string> = [];
                //The render function returns either an element directly or an array.
                const child = this.render();

                //The array can be an infinite tree. Lets make 1 big array
                const processChild = (c) => {
                    if (!Array.isArray(c)) {
                        result.push(c);
                    } else {
                        for(const c1 of c) {
                            processChild(c1);
                        }
                    }
                };
                processChild(child);

                return Promise.all(result) as any;
            }).then((innerHTMLS) => {
                this.innerHTML = innerHTMLS.join('');
            });
        }

        return target;
    }
}

