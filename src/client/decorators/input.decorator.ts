export function Input(target: any, propertyKey: string) {
    if(!target.inputProperties) {
        target.inputProperties = [];
    }

    target.inputProperties.push(propertyKey);
}