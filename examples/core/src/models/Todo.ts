import {ReactiveObject} from "rxui";

/**
 * Defines an interface that represents objects that are TODOs.
 */
export class Todo extends ReactiveObject {
    
    public toJson(): string {
        return JSON.stringify({
            title: this.title,
            completed: this.completed
        });
    }
    
    public static fromJson(json: string): Todo {
        var obj = JSON.parse(json);
        if(obj) {
            var todo = new Todo();
            todo.title = obj.title;
            todo.completed = obj.completed;
            return todo;
        }
        return null;
    }
    
    constructor(title?: string, completed?: boolean) {
        super();
        this.title = title;
        this.completed = completed;
    }
    
    /**
     * The title of the TODO.
     */
    public get title(): string {
        return this.get("title") || "";
    }
    
    /**
     * The title of the TODO.
     */
    public set title(title: string) {
        this.set("title", title);
    }
    
    /**
     * Gets whether the TODO has been completed. 
     */
    public get completed(): boolean {
        return this.get("completed") || false;
    }
    
    /**
     * Sets whether this todo has been completed.
     */
    public set completed(completed: boolean) {
        this.set("completed", completed);
    }
}