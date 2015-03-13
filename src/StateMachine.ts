module StateMachine {

  var reserved = ["state", "go", "initialize", "current"];

  function isUndefined(x) {
    return typeof x === "undefined";
  }

  export interface EventHandler {
    (...any): any;
  }

  export class State {

    _sm:     StateMachine;
    _name:   string;
    _events: any;
    _enter:  Array<EventHandler>;
    _exit:   Array<EventHandler>;

    /**
     * a single state
     *
     * @class State
     * @param sm - state machine
     * @param name - state name
     */
    constructor(sm: StateMachine, name: string) {
      this._sm     = sm;
      this._name   = name;
      this._events = {};
      this._enter  = [];
      this._exit   = [];
    }

    /**
     * create a function for invoking an event
     *
     * @method _makeEventMethodfn
     * @private
     * @param {string} event - event name
     * @return {function}
     */
    private _makeEventMethodFn(event: string): { (): void } {
      var sm      = this._sm,
          verbose = sm._options.verbose,
          name    = sm._options.name,
          logEx   = sm._options.logExceptions;
      return () => {
        var state = sm._current,
            args  = arguments,
            events;
        if (state === null) {
          throw new Error("the state machine has not been initialized");
        }
        events = state._events;
        if (!events.hasOwnProperty(event)) {
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
    }

    /**
     * convert an event handler parameter to a function
     *
     * @method _makeEventHandlerFn
     * @private
     * @param {function|string|undefined} x - handler
     * @return {function}
     */
    private _makeEventHandlerFn(x) {
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
    }

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
    on(event, handler) {
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
          if (!events.hasOwnProperty(event)) {
            events[event] = [];
          }
          events[event].push(fn);
          if (!sm.hasOwnProperty(event)) {
            sm[event] = this._makeEventMethodFn(event);
          }
          break;
      }
      return this;
    }

  }

  export interface Options {
    name?:          string;
    verbose?:       boolean;
    logExceptions?: boolean;
  }

  export class StateMachine {

    _states:  { [name: string]: State };
    _current: State;
    _options: Options;

    /**
     * Simple State Machine
     *
     * @class StateMachine
     * @param {object}  options
     * @param {boolean} options.verbose
     * @param {string}  options.name
     */
    constructor(options: Options) {
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
    }

    /**
     * Initializes the state machine to an initial state.
     * trying to invoke event methods before initializing
     * will result in an `Error` being thrown
     *
     * @method initialize
     * @param {string} name - initial state name
     * @return {StateMachine} state machine
     */
    initialize(name) {
      var states = this._states;
      if (isUndefined(states[name])) {
        throw new Error(name + " state is not defined");
      }
      this._current = states[name];
      return this;
    }

    /**
     * Creates or gets existing State
     *
     * @method state
     * @param {string} name - state name
     * @return {State} state specified by name
     */
    state(name) {
      var states = this._states;
      if (!states.hasOwnProperty(name)) {
        states[name] = new State(this, name);
      }
      return states[name];
    }

    /**
     * Gets the name of the current State
     *
     * @method current
     * @return {string} name - current state name
     */
    current() {
      var current = this._current;
      if (current === null) {
        throw new Error(
            "the state machine has not been initialized");
      }
      return current._name;
    }

    /**
     * Go to another state
     *
     * @method go
     * @param {string} name - state to transition to
     * @return {StateMachine} state machine
     */
    go(name) {
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
    }
  }

}
