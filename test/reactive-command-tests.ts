import {ReactiveCommand} from "../src/reactive-command";
import {TestScheduler} from "rxjs/testing/TestScheduler";
import {Observable} from "rxjs/Rx";
import {expect} from "chai";
import {MyObject} from "./models/my-object";
import {MyOtherObject} from "./models/my-other-object";

describe("ReactiveCommand", () => {
    describe(".createFromTask()", () => {
        it("should return a command that resolves with values from the promise", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromTask((a) => {
                return Promise.resolve(true);
            });

            command.executeAsync().take(1).subscribe(result => {
                expect(result).to.be.true;
                done();
            }, err => done(err));
        });
        it("should return a command that resolves with errors from the promise", (done) => {
            var command: ReactiveCommand<void> = ReactiveCommand.createFromTask((a) => {
                return Promise.reject("Error");
            });

            command.executeAsync().take(1).subscribe(null, err => {
                expect(err).to.equal("Error");
                done()
            });
        });
        it("should return a command that resolves with errors from the task execution", (done) => {
            var error = new Error("Error");
            var task: any = (arg) => {
                throw error;
            };
            var command: ReactiveCommand<void> = ReactiveCommand.createFromTask<void>(task);

            command.executeAsync().take(1).subscribe(null, err => {
                expect(err).to.equal(error);
                done();
            });
        });
    });
    describe(".create()", () => {
        it("should return a command that resolves with returned values from the task", (done) => {
            var command: ReactiveCommand<string> = ReactiveCommand.create((a) => {
                return "value";
            });

            command.executeAsync().take(1).subscribe(result => {
                expect(result).to.equal("value");
                done();
            }, err => done(err));
        });
    });
    describe("#canExecute", () => {
        it("should default to false", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable((a) => Observable.of(true), Observable.empty());

            command.canExecute.take(1).subscribe(can => {
                expect(can).to.be.false;
                done();
            }, err => done(err));
        });
        it("should use what the given canRun observable observes", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable((a) => Observable.of(false), Observable.of(true).delay(5));

            command.canExecute.bufferTime(10).take(1).subscribe((can: boolean[]) => {
                expect(can.length).to.equal(2);
                expect(can[0]).to.be.false;
                expect(can[1]).to.be.true;
                done();
            }, err => done(err));
        });
        it("should be false while the command is executing", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable((a) => {
                return Observable.of(false);
            }, Observable.of(true));

            command.canExecute.bufferCount(3).take(1).subscribe((can: boolean[]) => {
                expect(can.length).to.equal(3);
                expect(can[0]).to.be.true;
                expect(can[1]).to.be.false; // Cannot Execute While Running. 
                expect(can[2]).to.be.true;
                done();
            }, err => done(err));

            command.executeAsync(null);
        });
    });

    describe("#isExecuting", () => {
        it("should default to false", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable((a) => Observable.of(true), Observable.empty());

            command.isExecuting.take(1).subscribe(executing => {
                expect(executing).to.be.false;
                done();
            }, err => done(err));
        });
        it("should be true while the command is executing", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable((a) => Observable.of(true), Observable.of(true));

            command.isExecuting.bufferCount(3).take(1).subscribe((executing: boolean[]) => {
                expect(executing.length).to.equal(3);
                expect(executing[0]).to.be.false;
                expect(executing[1]).to.be.true;
                expect(executing[2]).to.be.false;
                done();
            });

            command.executeAsync(null);
        });
    });

    describe("#executeAsync()", () => {
        it("should run the configured task on the given scheduler", (done) => {
            var scheduler = new TestScheduler((actual, expected) => {
                expect(actual).to.deep.equal(expected);
            });

            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable((a) => Observable.of(true), Observable.of(true), scheduler);

            var work = result => {
                expect(result).to.be.true;
                done();
            };

            var sub = command.executeAsync().subscribe(work);

            // Expect two actions to be scheduled.
            // One for the results of the execution, one for the results of the command. 
            expect(scheduler.actions.length).to.equal(2);
            sub.unsubscribe();
            done();
        });
        it("should pipe errors from the task's observable to the subscribers", (done) => {
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable(a => Observable.create(sub => sub.error("error")));

            command.executeAsync().bufferCount(1).take(1).subscribe(null, err => {
                expect(err).to.not.be.null;
                expect(err).to.equal("error");
                done();
            });
        });
        it("should pipe errors from the task's execution to the subscribers", (done) => {
            var error = new Error("error");
            var task: any = (arg) => {
                throw error;
            };
            var command: ReactiveCommand<boolean> = ReactiveCommand.createFromObservable<boolean>(task);

            command.executeAsync().bufferCount(1).take(1).subscribe(null, err => {
                expect(err).to.equal(error);
                done();
            })
        });
        it("should call the task only once for multiple subscribers", (done) => {
            var num = 0;
            var command: ReactiveCommand<number> = ReactiveCommand.create(a => {
                return ++num;
            });

            command.executeAsync().subscribe(n => {
                expect(n).to.equal(1);
                command.executeAsync().subscribe(n => {
                    try {
                        expect(n).to.equal(2);
                        done();
                    } catch (ex) {
                        done(ex);
                    }
                }, err => done(err));
            }, err => done(err));
        });
    });

    it("should not hang when using canRun and an observable built from whenAnyValue", (done) => {
        var obj: MyObject = new MyObject();
        var run = false;
        var command = ReactiveCommand.create(() => {
            return true;
        }, obj.canAddNewTodo());

        command.executeAsync().subscribe(result => {
            expect(result).to.be.true;
            done();
        }, err => done(err));
    });

    // it("Be able to instantiate TodoViewModel", (done) => {
    //     var todos: Todo[] = [
    //         new Todo("Todo", false)
    //     ];
    //     var store: any = {
    //         getTodos: () => Promise.resolve(todos),
    //         putTodos: null
    //     };
    //     var obj: TodoViewModel = new TodoViewModel(store);
    // });
});