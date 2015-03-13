"use strict";

var StateMachine;
(function (_StateMachine) {
    function isUndefined(x) {
        return typeof x === "undefined";
    }
    var State = (function () {
        /**
         * A single state
         *
         * @param sm - state machine
         * @param name - state name
         */
        function State(sm, name) {
            this._sm = sm;
            this.name = name;
            this._events = {};
            this._enter = [];
            this._exit = [];
        }
        /**
         * Convert an event handler parameter to a function
         *
         * @param x Handler parameter
         * @return Event handler
         */
        State.prototype._makeEventHandler = function (x) {
            var _this = this;
            if (typeof x === "function") {
                return x;
            }
            if (typeof x === "string") {
                return function () {
                    return _this._sm.go(x);
                };
            }
            if (typeof x === "undefined") {
                return function () {
                    return undefined;
                };
            }
            throw new Error("invalid event handler");
        };
        /**
         * Register a state event and add the event method
         * to the state machine instance
         *
         * Note:
         *
         *  `enter` and `exit` are special events.
         *  event methods do not get defined for them.
         *  they are executed when the state machine is
         *  entering or exiting that state.
         *
         * @param event Event name
         * @param handler Event callback function or state name
         * @return State
         */
        State.prototype.on = function (event, handler) {
            var events = this._events,
                sm = this._sm,
                fn = this._makeEventHandler(handler);
            switch (event) {
                case "enter":
                    this._enter.push(fn);
                    break;
                case "exit":
                    this._exit.push(fn);
                    break;
                default:
                    if (!events.hasOwnProperty(event)) {
                        events[event] = [];
                    }
                    events[event].push(fn);
            }
            return this;
        };
        State.prototype.emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var sm = this._sm,
                verbose = sm.options.verbose,
                name = sm.options.name,
                logEx = sm.options.logExceptions,
                state = this,
                events;
            if (state === null) {
                throw new Error("the state machine has not been initialized");
            }
            events = state._events;
            if (!events.hasOwnProperty(event)) {
                throw new Error(event + " event not defined for " + state.name + " state");
            }
            if (verbose) {
                console.log(name + ": " + state.name + "." + event);
            }
            if (logEx) {
                try {
                    events[event].forEach(function (fn) {
                        return fn.apply(sm, args);
                    });
                } catch (e) {
                    console.log(name + ": " + state.name + " ! " + e.message);
                    throw e;
                }
            } else {
                events[event].forEach(function (fn) {
                    return fn.apply(sm, args);
                });
            }
        };
        return State;
    })();
    _StateMachine.State = State;
    var StateMachine = (function () {
        /**
         * @param options Options
         */
        function StateMachine(options) {
            this._states = {};
            this.current = null;
            if (isUndefined(options)) {
                options = {};
            }
            if (isUndefined(options.verbose)) {
                options.verbose = false;
            }
            if (isUndefined(options.name)) {
                options.name = "StateMachine";
            }
            if (isUndefined(options.logExceptions)) {
                options.logExceptions = false;
            }
            this.options = options;
        }
        /**
         * Initializes the state machine to an initial state.
         * trying to invoke event methods before initializing
         * will result in an `Error` being thrown
         *
         * @param name Initial state name
         * @return State machine
         */
        StateMachine.prototype.initialize = function (name) {
            var states = this._states;
            if (isUndefined(states[name])) {
                throw new Error(name + " state is not defined");
            }
            this.current = states[name];
        };
        /**
         * Creates or gets existing State
         *
         * @param Name - state name
         * @return State specified by name
         */
        StateMachine.prototype.state = function (name) {
            var states = this._states;
            if (!states.hasOwnProperty(name)) {
                states[name] = new State(this, name);
            }
            return states[name];
        };
        /**
         * Emit an event
         *
         * @param event Event name
         * @param args Arguments to pass to event handler
         */
        StateMachine.prototype.emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var state = this.current;
            if (state === null) {
                throw new Error("the state machine has not been initialized");
            }
            state.emit.apply(state, arguments);
        };
        /**
         * Go to another state
         *
         * @param name State to transition to
         */
        StateMachine.prototype.go = function (name) {
            var _this = this;
            var state = this._states[name],
                current = this.current,
                execute = function execute(fn) {
                return fn.call(_this);
            };
            if (isUndefined(state)) {
                throw new Error(name + " state does not exist");
            }
            if (current.name !== name) {
                if (this.options.verbose) {
                    console.log(this.options.name + ": " + current.name + " -> " + name);
                }
                current._exit.forEach(execute);
                this.current = state;
                state._enter.forEach(execute);
            }
        };
        return StateMachine;
    })();
    _StateMachine.StateMachine = StateMachine;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=StateMachine.js.map