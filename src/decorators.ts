/**
 * Defines a Decorator that can be used to define a property on a type.
 * @param type The type 
 */
export function prop() {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        let type = Reflect.getMetadata("design:type", target);
        Reflect.defineMetadata(`rxui:property:${propertyKey}:type`, type, target);
    }
}