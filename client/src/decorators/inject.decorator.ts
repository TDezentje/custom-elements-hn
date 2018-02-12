import { BaseService } from 'services/base.service';

class ServiceInstance {
    key: any;
    value: any;

    constructor(key:any, value: any) {
        this.key = key;
        this.value = value;
    }
}
const services:ServiceInstance[] = [];

export function Inject(service: any) {
    return function(target: any, propertyKey: string) {
        let serviceInstance = services.find(s => s.key === service);
        
        if(serviceInstance) {
            target[propertyKey] = serviceInstance.value;
        } else {
            target[propertyKey] = new service();
            services.push(new ServiceInstance(service, target[propertyKey]));
        }
    }
}

