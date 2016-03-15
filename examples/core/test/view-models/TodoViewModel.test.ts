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

        describe("#toggleTodo()", () => {
            it("should call putTodos() on the TodoStorage service after call", () => {
                var todos: Todo[] = [
                    {
                        title: "Todo",
                        completed: false,
                        editing: false
                    }
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
                    {
                        title: "Todo",
                        completed: false,
                        editing: false
                    }
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
                    {
                        title: "Todo",
                        completed: true,
                        editing: false
                    }
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
                var missingTodo = {
                    title: "Missing",
                    completed: true,
                    editing: false
                };
                var todos: Todo[] = [
                    {
                        title: "Todo",
                        completed: true,
                        editing: false
                    },
                    {
                        title: "Other",
                        completed: true,
                        editing: false
                    }
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(false))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.deleteTodo(missingTodo).take(1).subscribe(deleted => {
                    expect(deleted).to.be.false;
                    expect(service.putTodos.called).to.be.false;
                    done();
                }, err => done(err));
            });

            it("should remove the given TODO from the array of TODOS", (done) => {
                var todos: Todo[] = [
                    {
                        title: "Todo",
                        completed: true,
                        editing: false
                    },
                    {
                        title: "Other",
                        completed: true,
                        editing: false
                    }
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.deleteTodo(todos[0]).take(1).subscribe(deleted => {
                    expect(deleted).to.be.true;
                    expect(todos).to.deep.equal([
                        {
                            title: "Other",
                            completed: true,
                            editing: false
                        }
                    ]);
                    expect(service.putTodos.called).to.be.true;
                    done();
                }, err => done(err));
            });
        });

        describe("#save()", () => {
            it("should call putTodos() on the service with the current array of TODOs", (done) => {
                var todos: Todo[] = [
                    {
                        title: "Todo",
                        completed: true,
                        editing: false
                    }
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.save().take(1).subscribe(saved => {
                    expect(saved).to.equal(true);
                    expect(service.putTodos.called).to.be.true;
                    expect(service.putTodos.firstCall.calledWithExactly(todos)).to.be.true;
                    done();
                }, err => done(err));
            });
        });
    });
}
