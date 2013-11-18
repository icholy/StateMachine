
var SSM = (function () {

  var reserved = ["state", "go", "initialize", "current"];

  var isDefined   = function (x) { return typeof x !== "undefined"; },
      isUndefined = function (x) { return !isDefined(x); };

  /**
   * a single state
   *
   * @class State
   * @param {SSM} sm - state machine
   * @param {String} name - state name
   */
  var State = function (sm, name) {
    this._sm     = sm;
    this._name   = name;
    this._events = {};
    this._enter  = [];
    this._exit   = [];
  };

  /**
   * create a function for invoking an event
   *
   * @method _makeEventMethodFn
   * @private
   * @param {String} event - event name
   * @return {Function}
   */
  State.prototype._makeEventMethodFn = function (event) {
    var sm = this._sm;
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
      events[event].forEach(function (fn) {
        fn.apply(sm, args);
      });
      return sm;
    };
  };

  /**
   * convert an event handler parameter to a function
   *
   * @method _makeEventHandlerFn
   * @private
   * @param {Function|String|Undefined} x - handler
   * @return {Function}
   */
  State.prototype._makeEventHandlerFn = function (x) {
    var sm = this._sm;
    switch (Object.prototype.toString.call(x)) {
      case '[object Function]' : return x;
      case '[object String]'   : return sm.go.bind(sm, x);
      case '[object Undefined]': return function () {};
      default:
        throw new Error("invalid event handler");
    }
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
   * @param {String} event - event name
   * @param {Function|String} handler - event callback function or state name
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
   * See SSM#initialize method
   *
   * @method initialize
   * @param {String} name - initial state name
   * @return {SSM} state machine
   */
  State.prototype.initialize = function (name) {
    return this._sm.initialize(name);
  };

  /**
   * See SSM#state method
   *
   * @method state
   * @param {String} name - state name
   * @return {State} state specified by name parameter
   */
  State.prototype.state = function (name) {
    return this._sm.state(name);
  };

  /**
   * Simple State Machine
   *
   * @class SSM
   */
  var SSM = function () {
    this._states  = {};
    this._current = null;
  };

  /**
   * Initializes the state machine to an initial state.
   * trying to invoke event methods before initializing
   * will result in an `Error` being thrown
   *
   * @method initialize
   * @param {String} name - initial state name
   * @return {SSM} state machine
   */
  SSM.prototype.initialize = function (name) {
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
   * @param {String} name - state name
   * @return {State} state specified by name
   */
  SSM.prototype.state = function (name) {
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
   * @return {String} name - current state name
   */
  SSM.prototype.current = function () {
    var current = this._current;
    if (current === null) {
      throw new Error(
        "the state machine has not been initialized"
      );
    }
    return current._name;
  };

  /**
   * Go to another state
   *
   * @method go
   * @param {String} name - state to transition to
   * @return {SSM} state machine
   */
  SSM.prototype.go = function (name) {
    var state   = this._states[name],
        current = this._current,
        execute = function (fn) { fn.call(this._sm); }.bind(this);
    if (isUndefined(state)) {
      throw new Error(name + " state does not exist");
    }
    if (current._name !== name) {
      current._exit.forEach(execute);
      this._current = state;
      state._enter.forEach(execute);
    }
    return this;
  };

  return SSM;

}).call(this);

if (typeof module !== "undefined") {
  module.exports = SSM;
}
