
var StateMachine = (function () {

  var reserved = ["state", "go", "initialize", "current"];

  var isDefined   = function (x) { return typeof x !== "undefined"; },
      isUndefined = function (x) { return !isDefined(x); };

  /**
   * a single state
   *
   * @class State
   * @param {StateMachine} sm - state machine
   * @param {string} name - state name
   */
  var State = function State(sm, name) {
    this._sm     = sm;
    this._name   = name;
    this._events = {};
    this._enter  = [];
    this._exit   = [];
  };

  /**
   * create a function for invoking an event
   *
   * @method _makeEventMethodfn
   * @private
   * @param {string} event - event name
   * @return {function}
   */
  State.prototype._makeEventMethodFn = function (event) {
    var sm      = this._sm,
        verbose = sm._options.verbose,
        name    = sm._options.name,
        logEx   = sm._options.logExceptions;
    return function () {
      var state = sm._current,
          args  = arguments,
          events;
      if (state === null) {
        throw new Error("the state machine has not been initialized");
      }
      events = state._events;
      if (isUndefined(events[event])) {
        throw new Error(
          event + " event not defined for " + state._name + " state"
        );
      }
      if (verbose) {
        console.log(name + ": " + state._name + "." + event);
      }
      if (logEx) {
        try {
          events[event].forEach(function (fn) {
            fn.apply(sm, args);
          });
        } catch (e) {
          console.log(name + ": " + state._name + " ! " + e.message);
          throw e;
        }
      } else {
        events[event].forEach(function (fn) {
          fn.apply(sm, args);
        });
      }
      return sm;
    };
  };

  /**
   * convert an event handler parameter to a function
   *
   * @method _makeEventHandlerFn
   * @private
   * @param {function|string|undefined} x - handler
   * @return {function}
   */
  State.prototype._makeEventHandlerFn = function (x) {
    var sm       = this._sm,
        toString = Object.prototype.toString;
    if (toString.call(x) === '[object Function]') {
      return x;
    }
    if (typeof x === "string") {
      return () => sm.go(x);
    }
    if (typeof x === "undefined") {
      return () => undefined;
    }
    throw new Error("invalid event handler");
  };

  /**
   * register a state event and add the event method
   * to the state machine instance
   *
   * Note:
   *
   *  `enter` and `exit` are special events.
   *  event methods do not get defined for them.
   *  they are executed when the state machine is
   *  entering or exiting that state.
   *
   * @method on
   * @param {string} event - event name
   * @param {function|string} handler - event callback function or state name
   * @return {State} state 
   */
  State.prototype.on = function (event, handler) {
    var events = this._events,
        sm     = this._sm,
        fn     = this._makeEventHandlerFn(handler);
    switch (event) {
      case "enter":
        this._enter.push(fn);
        break;
      case "exit":
        this._exit.push(fn);
        break;
      default:
        if (reserved.indexOf(event) !== -1) {
          throw new Error(event + " method is reserved for the api");
        };
        if (isUndefined(events[event])) {
          events[event] = [];
        }
        events[event].push(fn);
        if (isUndefined(sm[event])) {
          sm[event] = this._makeEventMethodFn(event);
        }
        break;
    }
    return this;
  };

  /**
   * See StateMachine#initialize method
   *
   * @method initialize
   * @param {string} name - initial state name
   * @return {StateMachine} state machine
   */
  State.prototype.initialize = function (name) {
    return this._sm.initialize(name);
  };

  /**
   * See StateMachine#state method
   *
   * @method state
   * @param {string} name - state name
   * @return {State} state specified by name parameter
   */
  State.prototype.state = function (name) {
    return this._sm.state(name);
  };

  /**
   * Simple State Machine
   *
   * @class StateMachine
   * @param {object}  options
   * @param {boolean} options.verbose
   * @param {string}  options.name
   */
  var StateMachine = function StateMachine(options) {
    this._states  = {};
    this._current = null;

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
    this._options = options;
  };

  /**
   * Initializes the state machine to an initial state.
   * trying to invoke event methods before initializing
   * will result in an `Error` being thrown
   *
   * @method initialize
   * @param {string} name - initial state name
   * @return {StateMachine} state machine
   */
  StateMachine.prototype.initialize = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      throw new Error(name + " state is not defined");
    }
    this._current = states[name];
    return this;
  };

  /**
   * Creates or gets existing State
   *
   * @method state
   * @param {string} name - state name
   * @return {State} state specified by name
   */
  StateMachine.prototype.state = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      states[name] = new State(this, name);
    }
    return states[name];
  };

  /**
   * Gets the name of the current State
   *
   * @method current
   * @return {string} name - current state name
   */
  StateMachine.prototype.current = function () {
    var current = this._current;
    if (current === null) {
      throw new Error(
          "the state machine has not been initialized");
    }
    return current._name;
  };

  /**
   * Go to another state
   *
   * @method go
   * @param {string} name - state to transition to
   * @return {StateMachine} state machine
   */
  StateMachine.prototype.go = function (name) {
    var state   = this._states[name],
        current = this._current,
        execute = fn => fn.call(this);
    if (isUndefined(state)) {
      throw new Error(name + " state does not exist");
    }
    if (current._name !== name) {
      if (this._options.verbose) {
        console.log(this._options.name + ": " + current._name + " -> " + name);
      }
      current._exit.forEach(execute);
      this._current = state;
      state._enter.forEach(execute);
    }
    return this;
  };

  return StateMachine;

}).call(this);
