import {ReactiveObject, ReactiveCommand} from "rxui";
import {Todo} from "../models/Todo";
import {TodoStorage} from "../services/TodoStorage";
import {Observable} from "rxjs/Observable";

/**
 * Defines a view model that provides functionality for viewing and editing TODOs.
 */
export class TodoViewModel extends ReactiveObject {

    private _store: TodoStorage;
    private _saveCommand: ReactiveCommand<boolean>;
    private _loadCommand: ReactiveCommand<Todo[]>;
    private _deleteCommand: ReactiveCommand<boolean>;
    private _toggleTodo: ReactiveCommand<boolean>;
    private _addCommand: ReactiveCommand<boolean>;

    public get todos(): Todo[] {
        return this.get("todos");
    }
    public set todos(todos: Todo[]) {
        this.set("todos", todos);
    }

    public get editedTodo(): Todo {
        return this.get("editedTodo");
    }
    public set editedTodo(todo: Todo) {
        this.set("editedTodo", todo);
    }

    public get newTodo(): Todo {
        return this.get("newTodo") || new Todo();
    }
    public set newTodo(todo: Todo) {
        this.set("newTodo", todo);
    }

    public get isEditing(): Observable<boolean> {
        return this.whenAnyValue(vm => vm.editedTodo).map(todo => todo != null);
    }

    public canAddNewTodo(): Observable<boolean> {
        console.log("can Add");
        // TODO: Work on Why The Constructor is blocking right here: 
        return this.whenAnyValue(vm => {
            console.log("test");
            return vm.newTodo;   
        }).map(todo => {
            console.log("Map");
            todo.title = todo.title.trim();
            return !!todo.title;
        }).startWith(false);
    }

    constructor(todoStore: TodoStorage) {
        super();
        this._store = todoStore;
        this.editedTodo = null;
        this.newTodo = new Todo();

        this._saveCommand = ReactiveCommand.createFromTask((a) => {
            if (this.editedTodo) {
                this.todos.push(this.editedTodo);
                this.editedTodo = null;
            }
            return this._store.putTodos(this.todos);
        });

        this._loadCommand = ReactiveCommand.createFromTask((a) => {
            return this._store.getTodos();
        });

        this._deleteCommand = ReactiveCommand.createFromObservable((a) => {
            var todoIndex = this.todos.indexOf(a);
            if (todoIndex >= 0) {
                this.todos.splice(todoIndex, 1);
                return this._saveCommand.executeAsync();
            }

            return Observable.of(false);
        });

        this._toggleTodo = ReactiveCommand.createFromObservable((todo: Todo) => {
            todo.completed = !todo.completed;
            return this._saveCommand.executeAsync();
        });

        this._addCommand = ReactiveCommand.createFromObservable((a) => {
            this.todos.push(this.newTodo);
            return this.save();
        }, this.canAddNewTodo());
    }

    public resetNewTodo(): Todo {
        return this.newTodo = new Todo();
    }

    public save(): Observable<boolean> {
        return this._saveCommand.executeAsync();
    }

    public deleteTodo(todo: Todo): Observable<boolean> {
        return this._deleteCommand.executeAsync(todo);
    }

    public loadTodos(): Observable<Todo[]> {
        return this._loadCommand.executeAsync();
    }

    public addTodo(): Observable<boolean> {
        return this._addCommand.canExecute.first().filter(canExecute => canExecute).flatMap(canExecute => {
            return this._addCommand.executeAsync();
        });
    }

    public toggleTodo(todo: Todo): Observable<boolean> {
        return this._toggleTodo.executeAsync(todo);
    }
}