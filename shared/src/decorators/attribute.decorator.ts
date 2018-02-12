export function Attribute(attributeName?: string) {
    return function (target: any, propertyKey: string) {
        const privatePropertyName = `_${propertyKey}`;
        attributeName = attributeName || propertyKey;

        Object.defineProperty(target, propertyKey, {
            get: function () {
                if (this[privatePropertyName] === undefined) {
                    if (this.hasAttribute(attributeName)) {
                        let val = this.getAttribute(attributeName);
                        if (val !== '') {

                            if (val && val.indexOf && val.indexOf('-') === -1) {
                                const intVal = parseInt(val);
                                if (!isNaN(intVal)) {
                                    val = intVal;
                                }
                            }

                            this[privatePropertyName] = val;
                        } else {
                            this[privatePropertyName] = true;
                        }
                    }
                }

                return this[privatePropertyName];
            },
            set: function (value) {
                if (value) {
                    this.setAttribute(attributeName, value);
                } else {
                    this.removeAttribute(attributeName);
                }

                this[privatePropertyName] = value;
            }
        });
    }
}

export enum AttributeType {
    number,
    boolean
}