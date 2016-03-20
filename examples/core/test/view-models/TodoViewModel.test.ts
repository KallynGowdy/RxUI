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
                    new Todo("Todo", false)
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

        describe("#newTodo", () => {
            it("should never be null", () => {
                var viewModel = new TodoViewModel(<any>{});

                expect(viewModel.newTodo).not.to.be.null;
            });
        });

        describe("#addTodo()", () => {
            it("should not do anything if newTodo does not have a title", () => {
                var viewModel = new TodoViewModel(<any>{});
                viewModel.todos = [];
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo();
                expect(viewModel.todos.length).to.equal(0);
            });
            it("should add the newTodo if it has a non-empty title", (done) => {
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = [];
                viewModel.newTodo.title = "Title";

                viewModel.addTodo().first().subscribe(() => {
                    expect(viewModel.todos.length).to.equal(1);
                    expect(viewModel.todos[0].title).to.equal("Title");
                    expect(service.putTodos.callCount).to.equal(1);
                    done();
                }, err => done(err));
            });
        });

        describe("#toggleTodo()", () => {
            it("should call putTodos() on the TodoStorage service after call", () => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var service = {
                    putTodos: Sinon.spy()
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.toggleTodo(todos[0]);
                expect(service.putTodos.callCount).to.equal(1);
                expect(service.putTodos.firstCall.calledWith(todos)).to.be.true;
            });

            it("should switch completed to true from false for the given TODO", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                viewModel.todos = todos;

                viewModel.toggleTodo(todos[0]).take(1).subscribe(() => {
                    expect(todos[0].completed).to.be.true;
                    done();
                }, err => done(err));
            });
            it("should switch completed to false from true for the given TODO", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true)
                ];
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                viewModel.todos = todos;

                viewModel.toggleTodo(todos[0]).take(1).subscribe(() => {
                    expect(todos[0].completed).to.be.false;
                    done();
                }, err => done(err));
            });
        });

        describe("#deleteTodo", () => {
            it("should do nothing if the given TODO does not exist in the view model", (done) => {
                var missingTodo = new Todo("Missing", true);
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(false))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.deleteTodo(missingTodo).first().subscribe(deleted => {
                    expect(deleted).to.be.false;
                    expect(service.putTodos.called).to.be.false;
                    done();
                });
            });

            it("should remove the given TODO from the array of TODOS", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.deleteTodo(todos[0]).first().subscribe(deleted => {
                    expect(deleted).to.be.true;
                    expect(todos.length).to.equal(1);
                    expect(todos[0].title).to.equal("Other");
                    expect(service.putTodos.called).to.be.true;
                    done();
                });
            });
        });

        describe("#save()", () => {
            it("should call putTodos() on the service with the current array of TODOs", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.save().first().subscribe(saved => {
                    expect(saved).to.equal(true);
                    expect(service.putTodos.called).to.be.true;
                    expect(service.putTodos.firstCall.calledWithExactly(todos)).to.be.true;
                    done();
                }, err => done(err));
            });
        });
    });
}
