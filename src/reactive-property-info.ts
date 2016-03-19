import "reflect-metadata";

/**
 * Defines a class that represents information for a property in a ReactiveObject.
 */
export class ReactivePropertyInfo {
    
    /**
     * The name of the property.
     */
    public name: string;
    
    /**
     * The constructor for the property type.
     */
    public type: Function;
    
    constructor(name: string, type: Function) {
        this.name = name;
        this.type = type;
    }   
}

export var Types = {
    number: () => 0,
    string: () => "",
    boolean: () => false,
    object: () => null,
    function: () => () => {}    
};