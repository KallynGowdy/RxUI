(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require(undefined), require("rxjs/Observable"), require("rxjs/Subject"));
	else if(typeof define === 'function' && define.amd)
		define(["rxjs/Rx", "rxjs/Observable", "rxjs/Subject"], factory);
	else if(typeof exports === 'object')
		exports["RxUI"] = factory(require("rxjs/Rx"), require("rxjs/Observable"), require("rxjs/Subject"));
	else
		root["RxUI"] = factory(root["Rx"], root["rxjs/Observable"], root["rxjs/Subject"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_8__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(1));
	__export(__webpack_require__(3));
	__export(__webpack_require__(7));
	__export(__webpack_require__(9));
	__export(__webpack_require__(5));
	//# sourceMappingURL=main.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Rx_1 = __webpack_require__(2);
	var property_changed_event_args_1 = __webpack_require__(3);
	var invoke_command_1 = __webpack_require__(5);
	/**
	 * Defines a class that represents a reactive object.
	 * This is the base class for View Model classes, and it implements an event system that
	 * allows notification of property changes, which is the basis of the observable pipeline.
	 */
	var ReactiveObject = (function () {
	    /**
	     * Creates a new reactive object.
	     */
	    function ReactiveObject() {
	        this._propertyChanged = new Rx_1.Subject();
	        this.__data = {};
	    }
	    Object.defineProperty(ReactiveObject.prototype, "propertyChanged", {
	        /**
	         * Gets the observable that represents the stream of "propertyChanged" events from this object.
	         */
	        get: function () {
	            return this._propertyChanged;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    ReactiveObject.prototype.createPropertyChangedEventArgs = function (propertyName, value) {
	        return new property_changed_event_args_1.PropertyChangedEventArgs(this, propertyName, value);
	    };
	    /**
	     * Emits a new property changed event for the given property from this object.
	     */
	    ReactiveObject.prototype.emitPropertyChanged = function (propertyName, newPropertyValue) {
	        var propValue = newPropertyValue != null ? newPropertyValue : this.get(propertyName);
	        this._propertyChanged.next(this.createPropertyChangedEventArgs(propertyName, propValue));
	    };
	    /**
	     * Gets the value of the given property from this object.
	     * @param property The name of the property whose value should be retrieved.
	     */
	    ReactiveObject.prototype.get = function (property) {
	        return this.__data[property] || null;
	    };
	    /**
	     * Sets the value of the given property on this object and emits the "propertyChanged" event.
	     * @param property The name of the property to change.
	     * @param value The value to give the property.
	     */
	    ReactiveObject.prototype.set = function (property, value) {
	        this.__data[property] = value;
	        this.emitPropertyChanged(property, value);
	    };
	    /**
	     * Runs the given function against a dummy version of this
	     * object that builds a string that represents the properties that should be watched.
	     * @param expr The function that represents the lambda expression.
	     */
	    ReactiveObject.prototype.evaluateLambdaExpression = function (expr) {
	        var path = [];
	        var ghost = this.buildGhostObject(path, this);
	        expr(ghost);
	        return path.join(".");
	    };
	    ReactiveObject.prototype.buildGhostObject = function (arr, obj) {
	        if (!obj || typeof obj !== "object" || obj.__data === null) {
	            return null;
	        }
	        else {
	            var vm = {};
	            var builder = this;
	            function declareProperty(currentGhost, propertyName) {
	                Object.defineProperty(currentGhost, propertyName, {
	                    get: function () {
	                        arr.push(propertyName);
	                        return builder.buildGhostObject(arr, obj.__data[propertyName]);
	                    }
	                });
	            }
	            for (var prop in obj.__data) {
	                // underscored properties should be ignored, because they are private
	                if (prop.indexOf("_") !== 0) {
	                    var val = obj.__data[prop];
	                    var type = typeof val;
	                    var ghost = {};
	                    if (type !== "function" && type !== "undefined") {
	                        declareProperty(vm, prop);
	                    }
	                }
	            }
	            return vm;
	        }
	    };
	    /**
	     * Gets an observable that resolves with the related property changed event whenever the given property updates.
	     */
	    ReactiveObject.prototype.whenSingle = function (expression, emitCurrentVal) {
	        if (emitCurrentVal === void 0) { emitCurrentVal = false; }
	        var prop;
	        if (typeof expression === "function") {
	            prop = this.evaluateLambdaExpression(expression);
	        }
	        else {
	            prop = expression;
	        }
	        var children = prop.split(".");
	        if (children.length === 1) {
	            var child = this;
	            var observable = child.propertyChanged.filter(function (e) {
	                return e.propertyName == prop;
	            });
	            if (emitCurrentVal) {
	                return Rx_1.Observable.of(this.createPropertyChangedEventArgs(prop, this.get(prop))).concat(observable);
	            }
	            else {
	                return observable;
	            }
	        }
	        else {
	            // Assuming prop = "first.second.third"
	            var firstProp = children[0]; // = "first"
	            // All of the other properties = "second.third"
	            var propertiesWithoutFirst = prop.substring(firstProp.length + 1);
	            // Get the object/value that is at the "first" key of this object.
	            var firstChild = this.get(firstProp);
	            if (typeof firstChild.whenSingle === "function") {
	                // Watch for changes to the "first" property on this object,
	                // and subscribe to the rest of the properties on that object.
	                // Switch between the observed values, so that only the most recent object graph
	                // property changes are observed.
	                // Store the number of times that the property has been changed at this level.
	                // This way, we can be sure about whether to emit the current value or not, based on whether
	                // we have observed 2 or more events at this level.
	                var observationCount = 0;
	                return this.whenSingle(firstProp, true).map(function (change) {
	                    var obj = change.newPropertyValue;
	                    observationCount++;
	                    return obj.whenSingle(propertiesWithoutFirst, emitCurrentVal || observationCount > 1);
	                }).switch();
	            }
	            else {
	                throw new Error("Not all of the objects in the chain of properties are Reactive Objects. Specifically, the property '" + firstProp + "', is not a Reactive Object when it should be.");
	            }
	        }
	    };
	    /**
	     * Gets an observable that resolves with the related property changed event whenever the given properties update.
	     * @param properties The names of the properties.
	     * @param map A function that, given the event arguments for the properties, maps to the desired return values.
	     */
	    ReactiveObject.prototype.whenAny = function () {
	        var _this = this;
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        var finalProperties = [];
	        var map = this.getMapFunction(args);
	        function iterateProperties(properties) {
	            properties.forEach(function (p, i) {
	                var type = typeof p;
	                if (type === "string" || type === "function") {
	                    finalProperties.push(p);
	                }
	                else if (Array.isArray(p)) {
	                    iterateProperties(p);
	                }
	            });
	        }
	        iterateProperties(map ? args.slice(0, args.length - 1) : args);
	        var observableList = finalProperties.map(function (prop) {
	            return _this.whenSingle(prop);
	        }).filter(function (o) { return o != null; });
	        if (map) {
	            return Rx_1.Observable.combineLatest.apply(Rx_1.Observable, observableList.concat([map]));
	        }
	        else {
	            return Rx_1.Observable.combineLatest.apply(Rx_1.Observable, observableList.concat([function () {
	                var events = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    events[_i - 0] = arguments[_i];
	                }
	                if (events.length == 1) {
	                    return events[0];
	                }
	                else {
	                    return events;
	                }
	            }]));
	        }
	    };
	    ReactiveObject.prototype.getMapFunction = function (values) {
	        var mapFunction = null;
	        var lastArg = values[values.length - 1];
	        if (values.length > 1 && typeof lastArg === "function") {
	            try {
	                var propName = this.evaluateLambdaExpression(lastArg);
	                if (!propName || typeof propName !== "string") {
	                    mapFunction = lastArg;
	                }
	            }
	            catch (ex) {
	                mapFunction = lastArg;
	            }
	        }
	        return mapFunction;
	    };
	    /**
	     * Gets an observable that resolves with the related property value(s) whenever the given properties update.
	     * @map A function that, given the values for the properties, maps to the desired return value.
	     */
	    ReactiveObject.prototype.whenAnyValue = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        var mapFunction = this.getMapFunction(args);
	        var whenAnyArgs = mapFunction ? args.slice(0, args.length - 1) : args;
	        var whenAny = this.whenAny.bind(this);
	        return whenAny.apply(void 0, whenAnyArgs.concat([function () {
	            var events = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                events[_i - 0] = arguments[_i];
	            }
	            var eventValues = events.map(function (e) { return e.newPropertyValue; });
	            if (mapFunction) {
	                return mapFunction.apply(void 0, eventValues);
	            }
	            else if (eventValues.length == 1) {
	                return eventValues[0];
	            }
	            else {
	                return eventValues;
	            }
	        }]));
	    };
	    ReactiveObject.prototype.when = function (observable) {
	        if (typeof observable === "string") {
	            return this.whenSingle(observable, true).map(function (e) { return e.newPropertyValue; }).switch();
	        }
	        else {
	            return observable;
	        }
	    };
	    /**
	     * Attempts to invoke the given command when the given Observable resolves with a new value.
	     * The command will not be invoked unless it can execute.
	     * Returns a cold Observable that resolves with the results of the executions.
	     * The returned Observable MUST be subscribed to in order for the command to execute.
	     *
	     * @param observable The Observable object that should be used as the trigger for the command.
	     *                   Additionally, if a property name is passed in, the most recent Observable stored at that property is used.
	     * @param command The ReactiveCommand object that should be executed.
	     *                If a property name is passed in, the most recent command stored at that property is used.
	     */
	    ReactiveObject.prototype.invokeCommandWhen = function (observable, command) {
	        return invoke_command_1.invokeCommand(this.when(observable), this, command);
	    };
	    return ReactiveObject;
	}());
	exports.ReactiveObject = ReactiveObject;
	//# sourceMappingURL=reactive-object.js.map

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var event_args_1 = __webpack_require__(4);
	/**
	 * Defines a class that represents the arguments for events that notify when properties change.
	 */
	var PropertyChangedEventArgs = (function (_super) {
	    __extends(PropertyChangedEventArgs, _super);
	    /**
	     * Creates a new object that represents the event arguments for a property changed event.
	     * @param sender The object whose property has changed.
	     * @param propertyName The name of the property that changed.
	     * @param newPropertyValue The new value that the property now possesses.
	     */
	    function PropertyChangedEventArgs(sender, propertyName, newPropertyValue) {
	        _super.call(this, sender);
	        this._propertyName = propertyName;
	        this._newPropertyValue = newPropertyValue;
	    }
	    Object.defineProperty(PropertyChangedEventArgs.prototype, "propertyName", {
	        /**
	         * Gets the name of the property that changed.
	         */
	        get: function () {
	            return this._propertyName;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(PropertyChangedEventArgs.prototype, "newPropertyValue", {
	        /**
	         * Gets the value that the property now has.
	         */
	        get: function () {
	            return this._newPropertyValue;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return PropertyChangedEventArgs;
	}(event_args_1.EventArgs));
	exports.PropertyChangedEventArgs = PropertyChangedEventArgs;
	//# sourceMappingURL=property-changed-event-args.js.map

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * Defines a base class that represents event arguments for an event.
	 */
	var EventArgs = (function () {
	    /**
	     * Creates a new event args object.
	     * @param sender The object that is emitting the event.
	     */
	    function EventArgs(sender) {
	        this._sender = sender;
	    }
	    Object.defineProperty(EventArgs.prototype, "sender", {
	        /**
	         * Gets the object that emitted the event.
	         */
	        get: function () {
	            return this._sender;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return EventArgs;
	}());
	exports.EventArgs = EventArgs;
	//# sourceMappingURL=event-args.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(6);
	/**
	 * Creates a new cold observable that maps values observed from the source Observable to values resolved from a ReactiveCommand.
	 * Essentially, this means that the command is executed whenever the source Observable resolves a new value, so long as the command is executable at the moment.
	 * @param source The Observable that should be used as the trigger for the command.
	 * @param obj The Reactive Object that the command exists on.
	 * @param command The name of the property that holds the ReactiveCommand that should be subscribed to.
	 *                Alternatively, the actual command object that should be executed can be passed in.
	 */
	function invokeCommand(source, obj, command) {
	    var commandObservable;
	    var canExecute;
	    var isExecuting;
	    if (typeof command === "string") {
	        // Make sure that the current command is observed
	        commandObservable = obj.whenSingle(command, true).map(function (e) { return e.newPropertyValue; });
	        canExecute = commandObservable.map(function (c) { return c.canExecute; }).switch();
	    }
	    else {
	        commandObservable = Observable_1.Observable.of(command);
	        canExecute = command.canExecute;
	    }
	    var results = source
	        .withLatestFrom(commandObservable, canExecute, function (v1, command, canExecute) {
	        return {
	            canExecute: canExecute,
	            command: command,
	            observedValue: v1
	        };
	    })
	        .filter(function (o) { return o.canExecute && o.command != null; })
	        .distinctUntilChanged()
	        .map(function (o) {
	        return o.command.executeAsync(o.observedValue);
	    }).merge();
	    return results;
	}
	exports.invokeCommand = invokeCommand;
	//# sourceMappingURL=invoke-command.js.map

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(6);
	var Subject_1 = __webpack_require__(8);
	var rx_app_1 = __webpack_require__(9);
	/**
	 * Defines a class that represents a command that can run operations in the background.
	 */
	var ReactiveCommand = (function () {
	    /**
	     * Creates a new Reactive Command.
	     * @param canRun An observable that determines whether the given task is allowed to run at a given moment.
	     * @param task A function that returns an observable that represents the asynchronous operation.
	     * @param scheduler The scheduler that all of the results should be observed on.
	     */
	    function ReactiveCommand(task, canRun, scheduler) {
	        this.task = task;
	        this.canRun = canRun;
	        this.scheduler = scheduler;
	        if (!task) {
	            throw new Error("The task parameter must be supplied");
	        }
	        if (!canRun) {
	            throw new Error("The canRun parameter must be supplied");
	        }
	        if (!scheduler) {
	            throw new Error("The scheduler parameter must be supplied");
	        }
	        this.subject = new Subject_1.Subject();
	        this.executing = new Subject_1.Subject();
	        this._isExecuting = this.executing.startWith(false).distinctUntilChanged();
	        this._canExecute = this.canRun
	            .startWith(false)
	            .combineLatest(this._isExecuting, function (canRun, isExecuting) {
	            return canRun && !isExecuting;
	        })
	            .distinctUntilChanged();
	        this._results = this.subject.observeOn(scheduler);
	    }
	    Object.defineProperty(ReactiveCommand.prototype, "isExecuting", {
	        /**
	         * Gets an observable that represents whether the command is currently executing.
	         */
	        get: function () {
	            return this._isExecuting;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(ReactiveCommand.prototype, "canExecute", {
	        /**
	         * Gets an observable that represents whether this command can execute.
	         */
	        get: function () {
	            return this._canExecute;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    ReactiveCommand.defaultScheduler = function (scheduler) {
	        return scheduler || rx_app_1.RxApp.mainThreadScheduler;
	    };
	    ReactiveCommand.defaultCanRun = function (canRun) {
	        return canRun || Observable_1.Observable.of(true);
	    };
	    /**
	     * Creates a new Reactive Command that can run the given synchronous task when executed.
	     * @param task A function that executes some synchronous task and returns an optional value.
	     * @param canRun An Observable whose stream of values determine whether the command is allowed to run at a certain time.
	     * @param scheduler The scheduler that all of the results from the task should be observed on.
	     */
	    ReactiveCommand.create = function (task, canRun, scheduler) {
	        return new ReactiveCommand(function (args) {
	            var result = task(args);
	            if (typeof result !== "undefined") {
	                return Observable_1.Observable.of(result);
	            }
	            else {
	                // TODO: replace with Unit
	                return Observable_1.Observable.of(null);
	            }
	        }, ReactiveCommand.defaultCanRun(canRun), ReactiveCommand.defaultScheduler(scheduler));
	    };
	    /**
	     * Creates a new Reactive Command that can run the given task when executed.
	     * @param task A function that returns a promise that completes when the task has finished executing.
	     * @param canRun An Observable whose stream of values determine whether the command is allowed to run at a certain time.
	     * @param scheduler The scheduler that all of the results from the task should be observed on.
	     */
	    ReactiveCommand.createFromTask = function (task, canRun, scheduler) {
	        return new ReactiveCommand(function (args) { return Observable_1.Observable.fromPromise(task(args)); }, ReactiveCommand.defaultCanRun(canRun), ReactiveCommand.defaultScheduler(scheduler));
	    };
	    /**
	     * Creates a new Reactive Command that can run the given task when executed.
	     * @param task A function that returns an observable that completes when the task has finished executing.
	     * @param canRun An Observable whose stream of values determine whether the command is allowed to run at a certain time.
	     * @param scheduler The scheduler that all of the results from the task should be observed on.
	     */
	    ReactiveCommand.createFromObservable = function (task, canRun, scheduler) {
	        return new ReactiveCommand(task, ReactiveCommand.defaultCanRun(canRun), ReactiveCommand.defaultScheduler(scheduler));
	    };
	    /**
	     * Executes this command asynchronously.
	     * Note that this method does not check whether the command is currently executable.
	     * Use ReactiveObject methods such as `invokeCommandWhen()` to take advantage of canExecute.
	     */
	    ReactiveCommand.prototype.executeAsync = function (arg) {
	        var _this = this;
	        if (arg === void 0) { arg = null; }
	        this.executing.next(true);
	        var o = null;
	        var observable = Observable_1.Observable.create(function (sub) {
	            try {
	                if (o == null) {
	                    o = _this.task(arg);
	                }
	                var subscription = o.subscribe(sub);
	                return function () {
	                    subscription.unsubscribe();
	                };
	            }
	            catch (error) {
	                sub.error(error);
	                sub.complete();
	            }
	        });
	        observable.subscribe(function (result) {
	            _this.subject.next(result);
	        }, function (err) {
	            _this.subject.error(err);
	            _this.executing.next(false);
	        }, function () {
	            _this.executing.next(false);
	        });
	        return observable.observeOn(this.scheduler);
	    };
	    Object.defineProperty(ReactiveCommand.prototype, "results", {
	        /**
	         * Gets the observable that represents the results of this command's operations.
	         */
	        get: function () {
	            return this._results;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return ReactiveCommand;
	}());
	exports.ReactiveCommand = ReactiveCommand;
	//# sourceMappingURL=reactive-command.js.map

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_8__;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Rx_1 = __webpack_require__(2);
	/**
	 * Defines a class that contains static properties that are useful for a Reactive Application.
	 */
	var RxApp = (function () {
	    function RxApp() {
	    }
	    Object.defineProperty(RxApp, "mainThreadScheduler", {
	        /**
	         * Gets a scheduler that can be used to scheduler work on the main UI thread.
	         */
	        get: function () {
	            return Rx_1.Scheduler.queue;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(RxApp, "immediateScheduler", {
	        /**
	         * Gets a scheduler that executes work as soon as it is scheduled.
	         */
	        get: function () {
	            return Rx_1.Scheduler.asap;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return RxApp;
	}());
	exports.RxApp = RxApp;
	//# sourceMappingURL=rx-app.js.map

/***/ }
/******/ ])
});
;