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
    private _editCommand: ReactiveCommand<boolean>;
    private _undoCommand: ReactiveCommand<boolean>;
    
    private _originalTodo: Todo;

    /**
     * Gets the array of TODOs that are being presented by this view model.
     */
    public get todos(): Todo[] {
        return this.get("todos");
    }

    /**
     * Sets the array of TODOs that are being presented by this view model.
     */
    public set todos(todos: Todo[]) {
        this.set("todos", todos);
    }

    /**
     * Gets the TODO that is currently being edited.
     */
    public get editedTodo(): Todo {
        return this.get("editedTodo");
    }

    /**
     * Sets the TODO that is currently being edited.
     */
    public set editedTodo(todo: Todo) {
        this.set("editedTodo", todo);
    }

    /**
     * Gets the TODO that is being created.
     */
    public get newTodo(): Todo {
        var todo = this.get("newTodo");
        if (!todo) {
            todo = new Todo();
            this.newTodo = todo;
        }
        return todo;
    }

    /**
     * Sets the TODO that is being created.
     */
    public set newTodo(todo: Todo) {
        this.set("newTodo", todo);
    }

    /**
     * Gets an observable that resolves with whenever a TODO is being edited.
     */
    public isEditingAsync(): Observable<boolean> {
        return this.whenAnyValue(vm => vm.editedTodo).map(todo => todo != null);
    }

    private isValidTitle(title: string): boolean {
        var valid = !!title.trim();
        return valid;
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

        var canAddTodo = this.whenAnyValue(vm => {
            return vm.newTodo.title;
        }).map(title => {
            return this.isValidTitle(title)
        });

        this._addCommand = ReactiveCommand.createFromObservable((a) => {
            this.todos.push(this.newTodo);
            this.resetNewTodo();
            return this.save();
        }, canAddTodo);

        this._editCommand = ReactiveCommand.createFromObservable(a => {
            return this.save().do(saved => {
                if (saved) {
                    this._originalTodo = null;
                    this.editedTodo = null;
                }
            });
        });
        
        var canUndo = this.whenAnyValue(vm => vm.editedTodo, vm => vm.todos, (e, todos) => e !== null && todos !== null);
        
        this._undoCommand = ReactiveCommand.create(a => {
            var index = this.todos.indexOf(this.editedTodo);
            this.todos[index] = this._originalTodo;
            this._originalTodo = null;
            this.editedTodo = null;
            return true;
        }, canUndo);
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
        return this._addCommand.canExecuteNow().filter(canExecute => canExecute).flatMap(canExecute => {
            return this._addCommand.executeAsync();
        });
    }

    public toggleTodo(todo: Todo): Observable<boolean> {
        return this._toggleTodo.executeAsync(todo);
    }

    public editTodo(todo: Todo): void {
        this._originalTodo = todo.copy();
        this.editedTodo = todo;
    }

    public doneEditing(): Observable<boolean> {
        return this._editCommand.executeAsync();
    }
}