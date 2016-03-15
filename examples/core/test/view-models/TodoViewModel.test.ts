import * as Sinon from "sinon";
import {TodoStorage} from "../../src/services/TodoStorage";
import {Todo} from "../../src/models/Todo";
import {TodoViewModel} from "../../src/view-models/TodoViewModel";
import {expect} from "chai";

export function register() {
    describe("TodoViewModel", () => {
        describe("#loadTodos()", () => {
            it("should load TODOs from the given TodoService", () => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var store: TodoStorage = {
                    getTodos: Sinon.stub().returns(Promise.resolve(todos)),
                    putTodos: null
                };

                var viewModel = new TodoViewModel(store);

                // viewModel.loadTodos().take(1).subscribe(t => {
                //     expect(t).to.equal(todos);
                //     done();
                // }, err => done(err));
            });
        });

        // describe("#newTodo", () => {
        //    it("should never be null", () => {
        //        var viewModel = new TodoViewModel(<any>{});

        //         expect(viewModel.newTodo).not.to.be.null;
        //    });
        // });

        // describe("#addTodo()", () => {
        //     it("should not do anything if newTodo does not have a title", () => {
        //         var viewModel = new TodoViewModel(<any>{});

        //         expect(viewModel.editedTodo).to.be.null;
        //         viewModel.addTodo();
        //         expect(viewModel.editedTodo).not.to.be.null;
        //     });
        // });

        // describe("#toggleTodo()", () => {
        //     it("should call putTodos() on the TodoStorage service after call", () => {
        //         var todos: Todo[] = [
        //             new Todo("Todo", false)
        //         ];
        //         var service = {
        //             putTodos: Sinon.spy()
        //         };
        //         var viewModel = new TodoViewModel(<any>service);
        //         viewModel.todos = todos;

        //         viewModel.toggleTodo(todos[0]);
        //         expect(service.putTodos.callCount).to.equal(1);
        //         expect(service.putTodos.firstCall.calledWith(todos)).to.be.true;
        //     });

        //     it("should switch completed to true from false for the given TODO", (done) => {
        //         var todos: Todo[] = [
        //             new Todo("Todo", false)
        //         ];
        //         var viewModel = new TodoViewModel(<any>{
        //             putTodos: () => Promise.resolve(true)
        //         });
        //         viewModel.todos = todos;

        //         viewModel.toggleTodo(todos[0]).take(1).subscribe(() => {
        //             expect(todos[0].completed).to.be.true;
        //             done();
        //         }, err => done(err));
        //     });
        //     it("should switch completed to false from true for the given TODO", (done) => {
        //         var todos: Todo[] = [
        //             new Todo("Todo", true)
        //         ];
        //         var viewModel = new TodoViewModel(<any>{
        //             putTodos: () => Promise.resolve(true)
        //         });
        //         viewModel.todos = todos;

        //         viewModel.toggleTodo(todos[0]).take(1).subscribe(() => {
        //             expect(todos[0].completed).to.be.false;
        //             done();
        //         }, err => done(err));
        //     });
        // });

        // describe("#deleteTodo", () => {
        //     it("should do nothing if the given TODO does not exist in the view model", (done) => {
        //         var missingTodo = new Todo("Missing", true);
        //         var todos: Todo[] = [
        //                 new Todo("Todo", true),
        //                 new Todo("Other", true)
        //         ];
        //         var service = {
        //             putTodos: Sinon.stub().returns(Promise.resolve(false))
        //         };
        //         var viewModel = new TodoViewModel(<any>service);
        //         viewModel.todos = todos;

        //         viewModel.deleteTodo(missingTodo).take(1).subscribe(deleted => {
        //             expect(deleted).to.be.false;
        //             expect(service.putTodos.called).to.be.false;
        //             done();
        //         }, err => done(err));
        //     });

        //     it("should remove the given TODO from the array of TODOS", (done) => {
        //         var todos: Todo[] = [
        //             new Todo("Todo", true),
        //             new Todo("Other", true)
        //         ];
        //         var service = {
        //             putTodos: Sinon.stub().returns(Promise.resolve(true))
        //         };
        //         var viewModel = new TodoViewModel(<any>service);
        //         viewModel.todos = todos;

        //         viewModel.deleteTodo(todos[0]).take(1).subscribe(deleted => {
        //             expect(deleted).to.be.true;
        //             expect(todos).to.deep.equal([
        //                 {
        //                     title: "Other",
        //                     completed: true
        //                 }
        //             ]);
        //             expect(service.putTodos.called).to.be.true;
        //             done();
        //         }, err => done(err));
        //     });
        // });

        // describe("#save()", () => {
        //     it("should call putTodos() on the service with the current array of TODOs", (done) => {
        //         var todos: Todo[] = [
        //             new Todo("Todo", true)
        //         ];
        //         var service = {
        //             putTodos: Sinon.stub().returns(Promise.resolve(true))
        //         };
        //         var viewModel = new TodoViewModel(<any>service);
        //         viewModel.todos = todos;

        //         viewModel.save().take(1).subscribe(saved => {
        //             expect(saved).to.equal(true);
        //             expect(service.putTodos.called).to.be.true;
        //             expect(service.putTodos.firstCall.calledWithExactly(todos)).to.be.true;
        //             done();
        //         }, err => done(err));
        //     });
        // });
    });
}
