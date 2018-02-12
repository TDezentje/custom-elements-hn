import { BaseService } from 'services/base.service';

export function Inject(service: any) {
    return function(target: any, propertyKey: string) {
        const newService = new service();

        if(!target._injectedServices) {
            target._injectedServices = [];
        }
        
        target._injectedServices.push(newService);

        target[propertyKey] = newService;
    }
}

