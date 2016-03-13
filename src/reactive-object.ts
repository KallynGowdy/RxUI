import {Observable, Subject, Subscription} from "rxjs/Rx";
import {PropertyChangedEventArgs} from "./events/property-changed-event-args";
import {invokeCommand} from "./operator/invoke-command";
import {ReactiveCommand} from "./reactive-command";

/**
 * Defines a class that represents a reactive object.
 * This is the base class for View Model classes, and it implements an event system that 
 * allows notification of property changes, which is the basis of the observable pipeline.
 */
export class ReactiveObject {

    private _propertyChanged: Subject<PropertyChangedEventArgs<any>>;

    /**
     * Creates a new reactive object.
     */
    constructor() {
        this._propertyChanged = new Subject<PropertyChangedEventArgs<any>>();
    }

    /**
     * Gets the observable that represents the stream of "propertyChanged" events from this object.
     */
    public get propertyChanged(): Observable<PropertyChangedEventArgs<any>> {
        return this._propertyChanged;
    }

    protected createPropertyChangedEventArgs(propertyName: string, value: any): PropertyChangedEventArgs<any> {
        return new PropertyChangedEventArgs(this, propertyName, value)
    }

    /**
     * Emits a new property changed event for the given property from this object.
     */
    protected emitPropertyChanged(propertyName: string, newPropertyValue?: any): void {
        var propValue = newPropertyValue != null ? newPropertyValue : this.get(propertyName);
        this._propertyChanged.next(this.createPropertyChangedEventArgs(propertyName, propValue));
    }

    /**
     * Gets the value of the given property from this object.
     * @param property The name of the property whose value should be retrieved. 
     */
    public get<T>(property: string): T | any {
        return this[property] || null;
    }

    /**
     * Sets the value of the given property on this object and emits the "propertyChanged" event.
     * @param property The name of the property to change.
     * @param value The value to give the property.
     */
    public set<T>(property: string, value: T): void {
        this[property] = value;
        this.emitPropertyChanged(property, value);
    }

    /**
     * Gets an observable that resolves with the related property changed event whenever the given property updates.
     */
    public whenSingle(prop: string, emitCurrentVal: boolean = false): Observable<PropertyChangedEventArgs<any>> {
        var children = prop.split(".");

        if (children.length === 1) {
            var child: ReactiveObject = this;
            var observable = child.propertyChanged.filter(e => {
                return e.propertyName == prop;
            });
            if (emitCurrentVal) {
                return Observable.of(this.createPropertyChangedEventArgs(prop, this.get(prop))).concat(observable);
            } else {
                return observable;
            }
        } else {
            // Assuming prop = "first.second.third"
            var firstProp = children[0]; // = "first"
            // All of the other properties = "second.third"
            var propertiesWithoutFirst = prop.substring(firstProp.length + 1);
            // Get the object/value that is at the "first" key of this object.
            var firstChild: ReactiveObject = this.get(firstProp);
            if (typeof firstChild.whenSingle === "function") {
                // Watch for changes to the "first" property on this object,
                // and subscribe to the rest of the properties on that object.
                // Switch between the observed values, so that only the most recent object graph
                // property changes are observed.

                // Store the number of times that the property has been changed at this level.
                // This way, we can be sure about whether to emit the current value or not, based on whether
                // we have observed 2 or more events at this level.
                var observationCount: number = 0;
                return this.whenSingle(firstProp, true).map(change => {
                    var obj: ReactiveObject = change.newPropertyValue;

                    observationCount++;
                    return obj.whenSingle(propertiesWithoutFirst, emitCurrentVal || observationCount > 1);
                }).switch();
            } else {
                throw new Error(`Not all of the objects in the chain of properties are Reactive Objects. Specifically, the property '${firstProp}', is not a Reactive Object when it should be.`);
            }
        }
    }

    /**
     * Gets an observable that resolves with the related property changed event whenever the given property updates.
     * @param properties The name of the property.
     * @param map A function that, given the event arguments for the property, maps to the desired return values.
     */
    public whenAny<T1, TResult>(
        first: string | ((o: this) => T1),
        map?: (_1: PropertyChangedEventArgs<T1>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<T1, T2, TResult>(
        first: string | ((o: this) => T1),
        second: string | ((o: this) => T2),
        map?: (_1: PropertyChangedEventArgs<T1>, _2: PropertyChangedEventArgs<T2>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<T1, T2, T3, TResult>(
        first: string | ((o: this) => T1),
        second: string | ((o: this) => T2),
        third: string | ((o: this) => T3),
        map?: (_1: PropertyChangedEventArgs<T1>, _2: PropertyChangedEventArgs<T2>, _3: PropertyChangedEventArgs<T3>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<T1, T2, T3, T4, TResult>(
        first: string | ((o: this) => T1),
        second: string | ((o: this) => T2),
        third: string | ((o: this) => T3),
        fourth: string | ((o: this) => T4),
        map?: (_1: PropertyChangedEventArgs<T1>, _2: PropertyChangedEventArgs<T2>, _3: PropertyChangedEventArgs<T3>, _4: PropertyChangedEventArgs<T4>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<T1, T2, T3, T4, T5, TResult>(
        first: string | ((o: this) => T1),
        second: string | ((o: this) => T2),
        third: string | ((o: this) => T3),
        fourth: string | ((o: this) => T4),
        fifth: string | ((o: this) => T5),
        map?: (_1: PropertyChangedEventArgs<T1>, _2: PropertyChangedEventArgs<T2>, _3: PropertyChangedEventArgs<T3>, _4: PropertyChangedEventArgs<T4>, _5: PropertyChangedEventArgs<T5>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<T1, T2, T3, T4, T5, T6, TResult>(
        first: string | ((o: this) => T1),
        second: string | ((o: this) => T2),
        third: string | ((o: this) => T3),
        fourth: string | ((o: this) => T4),
        fifth: string | ((o: this) => T5),
        sixth: string | ((o: this) => T6),
        map?: (_1: PropertyChangedEventArgs<T1>, _2: PropertyChangedEventArgs<T2>, _3: PropertyChangedEventArgs<T3>, _4: PropertyChangedEventArgs<T4>, _5: PropertyChangedEventArgs<T5>, _6: PropertyChangedEventArgs<T6>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<T1, T2, T3, T4, T5, T6, T7, TResult>(
        first: string | ((o: this) => T1),
        second: string | ((o: this) => T2),
        third: string | ((o: this) => T3),
        fourth: string | ((o: this) => T4),
        fifth: string | ((o: this) => T5),
        sixth: string | ((o: this) => T6),
        seventh: string | ((o: this) => T7),
        map?: (_1: PropertyChangedEventArgs<T1>, _2: PropertyChangedEventArgs<T2>, _3: PropertyChangedEventArgs<T3>, _4: PropertyChangedEventArgs<T4>, _5: PropertyChangedEventArgs<T5>, _6: PropertyChangedEventArgs<T6>, _7: PropertyChangedEventArgs<T7>) => TResult
    ): Observable<TResult | PropertyChangedEventArgs<any>>;
    /**
     * Gets an observable that resolves with the related property changed event whenever the given properties update.
     * @param properties The names of the properties.
     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
     */
    public whenAny<TResult>(
        ...args: (((o: this) => any) | string | ((...a: PropertyChangedEventArgs<any>[]) => TResult))[]
    ): Observable<TResult | PropertyChangedEventArgs<any>> {
        var finalProperties: string[] = [];
        var map: Function = this.getMapFunction(args);

        function iterateProperties(properties: any[]) {
            properties.forEach((p, i) => {
                var type = typeof p;
                if (type === "string") {
                    finalProperties.push(p);
                } else if (type === "function") {
                    // handle lambda function
                } else if (Array.isArray(p)) {
                    iterateProperties(p);
                }
            });
        }
        iterateProperties(map ? args.slice(0, args.length) : args);
        var observableList = finalProperties.map(prop => {
            return this.whenSingle(prop);
        }).filter(o => o != null);
        if (map) {
            return Observable.combineLatest(...observableList, map);
        } else {
            return Observable.combineLatest(...observableList, (...events: PropertyChangedEventArgs<any>[]): any => {
                if (events.length == 1) {
                    return events[0];
                } else {
                    return events;
                }
            });
        }
    }

    private getMapFunction(values: any[]): Function {
        var mapFunction: Function = null;
        var lastArg: any = values[values.length - 1];
        if (typeof lastArg === "function") {
            try {
                var propName = lastArg();
                if (!propName || typeof propName !== "string") {
                    mapFunction = lastArg;
                }
            } catch (ex) {
                mapFunction = lastArg;
            }
        }
        return mapFunction;
    }

    /**
     * Gets an observable that resolves with the related property value(s) whenever the given properties update.
     * @param properties The names of the properties to watch.
     * @map A function that, given the values for the properties, maps to the desired return value.
     */
    public whenAnyValue<TResult>(
        ...args: (((o: this) => any) | string | ((...a: any[]) => TResult))[]
    ): Observable<TResult> {

        var mapFunction = this.getMapFunction(args);
        var whenAnyArgs: any = mapFunction ? args.slice(0, args.length) : args;

        return this.whenAny(whenAnyArgs, (...events: PropertyChangedEventArgs<any>[]) => {
            var eventValues = events.map(e => e.newPropertyValue);
            if(mapFunction) {
                return mapFunction(...eventValues);
            } else if(eventValues.length == 1) {
                return eventValues[0];
            } else {
                return eventValues;
            }
        });
    }

    public when<T>(observable: string | Observable<T>): Observable<T> {
        if (typeof observable === "string") {
            return this.whenSingle(observable, true).map(e => <Observable<T>>e.newPropertyValue).switch();
        } else {
            return observable;
        }
    }

    /**
     * Attempts to invoke the given command when the given Observable resolves with a new value.
     * The command will not be invoked unless it can execute.
     * Returns a cold Observable that resolves with the results of the executions.
     * The returned Observable MUST be subscribed to in order for the command to execute. 
     * 
     * @param observable The Observable object that should be used as the trigger for the command. 
     *                   Additionally, if a property name is passed in, the most recent Observable stored at that property is used.
     * @param command The ReactiveCommand object that should be executed. 
     *                If a property name is passed in, the most recent command stored at that property is used.
     */
    public invokeCommandWhen<T>(observable: string | Observable<any>, command: string | ReactiveCommand<T>): Observable<T> {
        return invokeCommand(this.when(observable), this, command);
    }
}