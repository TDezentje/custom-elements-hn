export interface ICustomElementOptions {
    template?: (element: any) => string,
    selector: string,
    css?: any,
    requires?: any[],
    options?: ElementDefinitionOptions
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

async function processChildren(children) {
    children = await Promise.all(children);
    let content = '';
    for (let child of children) {
        if (!child) {
            child = '';
        } else if (typeof (child) !== 'string' && child.connectedCallback) {
            await child.connectedCallback();
            child = `<${child.selector} ssr>${child.innerHTML}</${child.selector}>`;
        } else if (Array.isArray(child)) {
            child = await processChildren(child);
        } else if(child.isRaw) {
            child = child.content;
        }

        content += child;
    }

    return content;
}

export function raw(content: string) {
    return {
        isRaw: true,
        content: content
    };
}

export async function render(element: any, attributes: any, ...children: any[]) {
    //escape html
    for (let [index, child] of children.entries()) {
        if (typeof (child) === 'string') {
            children[index] = child.replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    }

    let content = await processChildren(children);

    if (element === 'template') {
        return content;
    }

    const createAttributeString = () => {
        let attributeString = '';
        for (let attr in attributes) {
            attributeString += ` ${attr}="${attributes[attr]}"`;
        }
        return attributeString;
    }

    if (typeof (element) === 'string') {
        return `<${element}${createAttributeString()}>${content}</${element}>`;
    } else {
        const el = new element();

        el.contentSlot = raw(content);
        if (el.inputProperties) {
            for (let input of el.inputProperties) {
                el[input] = attributes[input];
                delete attributes[input];
            }
        }
        await el.connectedCallback();
        return `<${element.selector}${createAttributeString()} ssr>${el.innerHTML}</${element.selector}>`;
    }
}

export function CustomElement(props: ICustomElementOptions) {
    return function (target) {
        target.whenDefined = Promise.resolve();
        target.selector = props.selector;
        let func = target.prototype.connectedCallback;

        if (props.css) {
            StyleRegistry.register(props.selector, `<style id="${props.selector}">${props.css.toString()}</style>`);
        }
        target.prototype.connectedCallback = async function () {
            this.selector = target.selector;

            if (this._propertiesToBind) {
                for (let property of this._propertiesToBind) {
                    this[property] = this[property].bind(this);
                }
            }

            let promise = Promise.resolve();
            const result = func.call(this, arguments);
            if (result && result.then) {
                promise = result;
            }

            return promise.then(() => {
                return props.template(this);
            }).then((innerHTML) => {
                if (innerHTML && props.css && props.css.locals) {
                    innerHTML = innerHTML.replace(/class="([^"]+)"/g, (toReplace: string, classesString: string, index) => {
                        const classes = classesString.split(' ');
                        const newClasses = [];

                        for (let className of classes) {
                            if (className in props.css.locals) {
                                newClasses.push(props.css.locals[className]);
                            } else {
                                newClasses.push(className);
                            }
                        }

                        return `class="${newClasses.join(' ')}"`;
                    });
                }
                this.innerHTML = innerHTML;
            });
        }

        return target;
    }
}
