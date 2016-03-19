import {ReactiveObject} from "../../src/reactive-object";
import {MyObject} from "./my-object";

export class MyOtherObject extends ReactiveObject {
    public get prop(): string {
        return this.get("prop");
    }
    public set prop(val: string) {
        this.set("prop", val);
    }

    public get child(): MyOtherObject {
        return this.get("child");
    }
    public set child(val: MyOtherObject) {
        this.set("child", val);
    }

    constructor() {
        super();
        this.set("prop", null);
    }
}