import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Scheduler} from "rxjs/Scheduler";
import {Subscription} from "rxjs/Subscription";
import {RxApp} from "./rx-app";

/**
 * Defines a class that represents a command that can run operations in the background.
 */
export class ReactiveCommand<TArgs, TResult> {

    private subject: Subject<TResult>;
    private executing: Subject<boolean>;
    private _results: Observable<TResult>;
    private _canExecute: Observable<boolean>;
    private _isExecuting: Observable<boolean>;
    private _canExecuteSubscription: Subscription;

    /**
     * Gets an observable that represents whether the command is currently executing.
     */
    public get isExecuting(): Observable<boolean> {
        return this._isExecuting;
    }

    /**
     * Gets an observable that represents whether this command can execute.
     */
    public get canExecute(): Observable<boolean> {
        return this._canExecute;
    }

    /**
     * Creates a new Reactive Command.
     * @param canRun An observable that determines whether the given task is allowed to run at a given moment.
     * @param task A function that returns an observable that represents the asynchronous operation.
     * @param scheduler The scheduler that all of the results should be observed on.
     */
    constructor(private task: (args: TArgs) => Observable<TResult>, private canRun: Observable<boolean>, private scheduler: Scheduler) {
        if (!task) {
            throw new Error("The task parameter must be supplied");
        }
        if (!canRun) {
            throw new Error("The canRun parameter must be supplied");
        }
        if (!scheduler) {
            throw new Error("The scheduler parameter must be supplied");
        }
        this.subject = new Subject<TResult>();
        this.executing = new Subject<boolean>();
        
        // Implementation mostly taken from:
        // https://github.com/reactiveui/ReactiveUI/blob/rxui7-master/ReactiveUI/ReactiveCommand.cs#L628
        this._isExecuting = this.executing
            .startWith(false)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();
        this._canExecute = this.canRun
            .startWith(false)
            .combineLatest(this._isExecuting, (canRun, isExecuting) => {
                return canRun && !isExecuting;
            })
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();
        this._results = this.subject.observeOn(scheduler);
        
        // Make sure that can execute is triggered to be a hot observable.
        this._canExecuteSubscription = this._canExecute.subscribe();
    }

    private static defaultScheduler(scheduler: Scheduler): Scheduler {
        return scheduler || RxApp.mainThreadScheduler;
    }

    private static defaultCanRun(canRun: Observable<boolean>): Observable<boolean> {
        return canRun || Observable.of(true);
    }

    /**
     * Creates a new Reactive Command that can run the given synchronous task when executed.
     * @param task A function that executes some synchronous task and returns an optional value.
     * @param canRun An Observable whose stream of values determine whether the command is allowed to run at a certain time.
     * @param scheduler The scheduler that all of the results from the task should be observed on.
     */
    public static create<TArgs, TResult>(task: (args: TArgs) => (TResult | void), canRun?: Observable<boolean>, scheduler?: Scheduler): ReactiveCommand<TArgs, TResult> {
        return new ReactiveCommand<TArgs, TResult>((args) => {
            var result = task(args);
            if(typeof result !== "undefined") {
                return Observable.of(result);
            } else {
                // TODO: replace with Unit
                return Observable.of(null);
            }
        }, ReactiveCommand.defaultCanRun(canRun), ReactiveCommand.defaultScheduler(scheduler));
    }

    /**
     * Creates a new Reactive Command that can run the given task when executed.
     * @param task A function that returns a promise that completes when the task has finished executing.
     * @param canRun An Observable whose stream of values determine whether the command is allowed to run at a certain time.
     * @param scheduler The scheduler that all of the results from the task should be observed on.
     */
    public static createFromTask<TArgs, TResult>(task: (args: TArgs) => Promise<TResult>, canRun?: Observable<boolean>, scheduler?: Scheduler): ReactiveCommand<TArgs, TResult> {
        return new ReactiveCommand<TArgs, TResult>((args) => Observable.fromPromise(task(args)), ReactiveCommand.defaultCanRun(canRun), ReactiveCommand.defaultScheduler(scheduler));
    }

    /**
     * Creates a new Reactive Command that can run the given task when executed.
     * @param task A function that returns an observable that completes when the task has finished executing.
     * @param canRun An Observable whose stream of values determine whether the command is allowed to run at a certain time.
     * @param scheduler The scheduler that all of the results from the task should be observed on.
     */
    public static createFromObservable<TArgs, TResult>(task: (args: TArgs) => Observable<TResult>, canRun?: Observable<boolean>, scheduler?: Scheduler): ReactiveCommand<TArgs, TResult> {
        return new ReactiveCommand<TArgs, TResult>(task, ReactiveCommand.defaultCanRun(canRun), ReactiveCommand.defaultScheduler(scheduler));
    }

    /**
     * Executes this command asynchronously.
     * Note that this method does not check whether the command is currently executable.
     */
    public executeAsync(arg: TArgs = null): Observable<TResult> {
        this.executing.next(true);
        var o = null;
        var observable = Observable.create(sub => {
            try {
                if(o == null) {
                    o = this.task(arg);
                }
                var subscription = o.subscribe(sub);
                return () => {
                    subscription.unsubscribe();
                };
            } catch (error) {
                sub.error(error);
                sub.complete();
            }
        });
        observable.subscribe(result => {
            this.subject.next(result);
        }, err => {
            this.subject.error(err);
            this.executing.next(false);
        }, () => {
            this.executing.next(false);
        });
        return observable.observeOn(this.scheduler);
    }
    
    /**
     * Executes this command asynchronously if the latest observed value from canExecute is true.
     */
    public invokeAsync(arg: TArgs = null): Observable<TResult> {
        return this.canExecuteNow().filter(canExecute => canExecute).flatMap(c => {
            return this.executeAsync(arg);
        });
    }

    /**
     * Gets an observable that determines whether the command is able to execute at the moment it is subscribed to.
     */
    public canExecuteNow(): Observable<boolean> {
        return this.canExecute.first();
    }

    /**
     * Gets the observable that represents the results of this command's operations.
     */
    public get results(): Observable<TResult> {
        return this._results;
    }
}