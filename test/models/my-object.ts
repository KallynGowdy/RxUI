import {ReactiveObject} from "../../src/reactive-object";
import {ReactiveCommand} from "../../src/reactive-command";
import {MyOtherObject} from "./my-other-object";
import {Observable} from "rxjs/Observable";

export class MyObject extends ReactiveObject {
    public get child(): MyOtherObject {
        return this.get("child");
    }
    public set child(val: MyOtherObject) {
        this.set("child", val);
    }

    public get otherProp(): string {
        return this.get("otherProp");
    }
    public set otherProp(val: string) {
        this.set("otherProp", val);
    }

    public get prop1(): string {
        return this.get("prop1");
    }
    public set prop1(val: string) {
        this.set("prop1", val);
    }

    public get prop2(): string {
        return this.get("prop2");
    }
    public set prop2(val: string) {
        this.set("prop2", val);
    }

    public get prop3(): string {
        return this.get("prop3");
    }
    public set prop3(val: string) {
        this.set("prop3", val);
    }

    public get newTodo(): MyOtherObject {
        return this.get("newTodo") || new MyOtherObject();
    }
    public set newTodo(todo: MyOtherObject) {
        this.set("newTodo", todo);
    }

    public canAddNewTodo(): Observable<boolean> {
        // TODO: Work on Why The Constructor is blocking right here: 
        return this.whenAnyValue(vm => {
            return vm.newTodo;   
        }).map(todo => {
            todo.prop = todo.prop.trim();
            return !!todo.prop;
        }).startWith(false);
    }
    
    private command: ReactiveCommand<boolean>;

    constructor() {
        super();
        // Set all the properties to their default values.
        // Required for lambdas to work properly.
        this.otherProp = null;
        this.prop1 = null;
        this.prop2 = null;
        this.prop3 = null;
        this.newTodo = new MyOtherObject();
        
        this.command = ReactiveCommand.createFromObservable(() => {
            return Observable.of(true);
        }, this.canAddNewTodo());
    }
}