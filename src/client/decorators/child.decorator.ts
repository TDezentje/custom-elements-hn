export function Child(target: any, propertyKey: string) {
    if(!target.childSelectors) {
        target.childSelectors = [];
    }

    target.childSelectors.push(propertyKey);
}