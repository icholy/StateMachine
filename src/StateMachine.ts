module StateMachine {

  function isUndefined(x) {
    return typeof x === "undefined";
  }

  export interface EventHandler {
    (...any): any;
  }

  export class State {

    name:   string;
    _enter: Array<EventHandler>;
    _exit:  Array<EventHandler>;

    private _sm:     StateMachine;
    private _events: any;

    /**
     * A single state
     *
     * @param sm - state machine
     * @param name - state name
     */
    constructor(sm: StateMachine, name: string) {
      this._sm     = sm;
      this.name    = name;
      this._events = {};
      this._enter  = [];
      this._exit   = [];
    }

    /**
     * Convert an event handler parameter to a function
     *
     * @param x Handler parameter
     * @return Event handler
     */
    private _makeEventHandler(x?: EventHandler|string): EventHandler {
      if (typeof x === "function") {
        return x;
      }
      if (typeof x === "string") {
        return () => this._sm.go(x);
      }
      if (typeof x === "undefined") {
        return () => undefined;
      }
      throw new Error("invalid event handler");
    }

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
    on(event: string, handler: EventHandler|string): State {
      var events = this._events,
          sm     = this._sm,
          fn     = this._makeEventHandler(handler);
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
    }

    emit(event: string, ...args: Array<any>): void {
      var sm      = this._sm,
          verbose = sm.options.verbose,
          name    = sm.options.name,
          logEx   = sm.options.logExceptions,
          state   = this,
          events;

      if (state === null) {
        throw new Error("the state machine has not been initialized");
      }
      events = state._events;
      if (!events.hasOwnProperty(event)) {
        throw new Error(
          event + " event not defined for " + state.name + " state"
        );
      }
      if (verbose) {
        console.log(name + ": " + state.name + "." + event);
      }
      if (logEx) {
        try {
          events[event].forEach(
              (fn) => fn.apply(sm, args))
        } catch (e) {
          console.log(name + ": " + state.name + " ! " + e.message);
          throw e;
        }
      } else {
        events[event].forEach(
            (fn) => fn.apply(sm, args));
      }
    }

  }

  export interface Options {
    name?:          string;
    verbose?:       boolean;
    logExceptions?: boolean;
  }

  export interface EventMethod {
    (...any): any;
  }

  export class StateMachine {

    private _states:  { [name: string]: State };

    current: State;
    options: Options;

    /**
     * @param options Options
     */
    constructor(options: Options) {
      this._states  = {};
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
    initialize(name: string) {
      var states = this._states;
      if (isUndefined(states[name])) {
        throw new Error(name + " state is not defined");
      }
      this.current = states[name];
    }

    /**
     * Creates or gets existing State
     *
     * @param Name - state name
     * @return State specified by name
     */
    state(name: string): State {
      var states = this._states;
      if (!states.hasOwnProperty(name)) {
        states[name] = new State(this, name);
      }
      return states[name];
    }

    /**
     * Emit an event
     *
     * @param event Event name
     * @param args Arguments to pass to event handler
     */
    emit(event: string, ...args: Array<any>): void {
      var state = this.current;
      if (state === null) {
        throw new Error("the state machine has not been initialized");
      }
      state.emit.apply(state, arguments);
    }

    /**
     * Go to another state
     *
     * @param name State to transition to
     */
    go(name: string): void {
      var state   = this._states[name],
          current = this.current,
          execute = fn => fn.call(this);
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
    }
  }

}
