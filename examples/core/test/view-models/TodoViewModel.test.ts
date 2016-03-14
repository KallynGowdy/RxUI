import * as Sinon from "sinon";
import {TodoStorage} from "../../src/services/TodoStorage";
import {Todo} from "../../src/models/Todo";
import {TodoViewModel} from "../../src/view-models/TodoViewModel";
import {expect} from "chai";

export function register() {
    describe("TodoViewModel", () => {
        describe("#loadTodos()", () => {
            it("should load TODOs from the given TodoService", (done) => {
                var todos: Todo[] = [
                    {
                        title: "Todo",
                        completed: false,
                        editing: false
                    }
                ];
                var store: TodoStorage = {
                    getTodos: Sinon.stub().returns(Promise.resolve(todos)),
                    putTodos: null
                };
                
                var viewModel = new TodoViewModel(store);
                
                viewModel.loadTodos().take(1).subscribe(t => {
                    expect(t).to.equal(todos);
                    done();
                }, err => done(err));
            });
        });
        
        describe("#addTodo()", () => {
           it("should set editedTodo to the new TODO", () => {
               var viewModel = new TodoViewModel(<any>{});
               
               expect(viewModel.editedTodo).to.be.null;
               viewModel.addTodo();
               expect(viewModel.editedTodo).not.to.be.null;               
           });
        });
        
        // describe("#editTodo", () => {
        //     it("should trigger isEditing to be true after a TODO is added", () => {
                
        //     });
        // });
    });
}
