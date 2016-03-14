
/**
 * Defines an interface that represents objects that are TODOs.
 */
export interface Todo {
    /**
     * The title of the TODO.
     */
    title: string;
    
    /**
     * Whether the TODO has been completed.
     */
    completed: boolean;
    
    /**
     * Whether the TODO is currently being edited.
     */
    editing: boolean;
}