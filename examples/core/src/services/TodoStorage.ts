import {Todo} from "../models/Todo";

/**
 * Defines an interface for objects that can store TODOs.
 */
export interface TodoStorage {
    /**
     * Retrieves the array of TODOs from this storage location.
     */
    getTodos(): Promise<Todo[]>;

    /**
     * Stores the given array of TODOs in this storage location.
     */
    putTodos(todos: Todo[]): Promise<boolean>;
}

/**
 * Defines a class that represents a service that stores TODOs in memory.
 */
export class InMemoryTodoStorage implements TodoStorage {

    private todos: Todo[] = null;

    constructor() {
    }

    getTodos(): Promise<Todo[]> {
        return Promise.resolve(this.todos);
    }

    putTodos(todos: Todo[]): Promise<boolean> {
        this.todos = todos;
        return Promise.resolve(true);
    }
}

/**
 * Defines a class that represents a service that stores TODOs in local storage.
 */
export class LocalTodoStorage implements TodoStorage {
    private static STORAGE_ID: string = "rxui-todos-example";

    constructor() {
    }

    getTodos(): Promise<Todo[]> {
        return new Promise((resolve, reject) => {
            resolve(JSON.parse(localStorage.getItem(LocalTodoStorage.STORAGE_ID) || "[]"));
        });
    }

    putTodos(todos: Todo[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            localStorage.setItem(LocalTodoStorage.STORAGE_ID, JSON.stringify(todos));
            resolve(true);
        });
    }
}