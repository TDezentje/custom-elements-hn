
export function Bind(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if(!target._propertiesToBind) {
        target._propertiesToBind = [];
    }

    target._propertiesToBind.push(propertyKey);
}
