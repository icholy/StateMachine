
var SSM = (function () {

  var reserved = ["state", "goto", "initialize"];

  var isDefined   = function (x) { return typeof x !== "undefined"; },
      isUndefined = function (x) { return !isDefined(x); }

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
    this._enter  = null;
    this._exit   = null;
  };

  State.prototype._makeEventFn = function (event) {
    var sm = this._sm;
    return function () {
      var state = sm._current,
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
      events[event].apply(sm, arguments);
      return sm;
    };
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
   * @param {Function} fn - event callback function
   * @return {State} state 
   */
  State.prototype.on = function (event, fn) {
    var events = this._events,
        sm     = this._sm;
    switch (event) {
      case "enter":
        if (this._enter !== null) {
          throw new Error(
            "enter event already defined for " + this._name + " state"
          );
        }
        this._enter = fn;
        break;
      case "exit":
        if (this._exit !== null) {
          throw new Error(
            "exit event already defined for " + this._name + " state"
          );
        }
        this._exit = fn;
        break;
      default:
        if (reserved.indexOf(event) !== -1) {
          throw new Error(event + " method is reserved for the api");
        };
        if (isDefined(events[event])) {
          throw new Error(
            event + " event already defined for " + this._name + " state"
          );
        }
        events[event] = fn;
        if (isUndefined(sm[event])) {
          sm[event] = this._makeEventFn(event);
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
   * Shitty State Machine
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
    if (this._current === null) {
      throw new Error(
        "the state machine has not been initialized"
      );
    }
    return this._current._name;
  };

  /**
   * Go to another state
   *
   * @method goto
   * @param {String} name - state to transition to
   * @return {SSM} state machine
   */
  SSM.prototype.goto = function (name) {
    var states = this._states,
        state  = states[name],
        isNew;
    if (isUndefined(state)) {
      throw new Error(name + " state does not exist");
    }
    if (this._current._name !== name) {
      if (this._current._exit !== null) {
        this._current._exit.call(this._sm);
      }
      this._current = state;
      if (state._enter !== null) {
        state._enter.call(this._sm);
      }
    }
    return this;
  };

  return SSM;

}).call(this);

if (typeof module !== "undefined") {
  module.exports = SSM;
}
