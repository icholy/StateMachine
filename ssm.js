
var SSM = (function () {

  var reserved = ["state", "goto", "initialize"];

  var isDefined   = function (x) { return typeof x !== "undefined"; },
      isUndefined = function (x) { return !isDefined(x); }

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
      if (state == null) {
        throw new Error("the state machine has not been initialized");
      }
      events = state._events;
      if (isUndefined(events[event])) {
        throw new Error(
          event + " event not defined for " + state._name + " state"
        );
      }
      events[event].call(sm);
    };
  };

  State.prototype.on = function (event, fn) {
    var events = this._events,
        sm     = this._sm;
    switch (event) {
      case "enter":
        if (this._enter !== null) {
          throw new Error(
            "enter event already defined for " + this._name + "state"
          );
        }
        this._enter = fn;
        break;
      case "exit":
        if (this._exit !== null) {
          throw new Error(
            "exit event already defined for " + this._name + "state"
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

  State.prototype.initialize = function (name) {
    return this._sm.initialize(name);
  };

  State.prototype.state = function (name) {
    return this._sm.state(name);
  };

  var SSM = function () {
    this._states  = {};
    this._current = null;
  };

  SSM.prototype.initialize = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      throw new Error(name + " state is not defined");
    }
    this._current = states[name];
    return this;
  };

  SSM.prototype.state = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      states[name] = new State(this, name);
    }
    return states[name];
  };

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
  };

  return SSM;

}).call(this);

if (typeof module !== "undefined") {
  module.exports = SSM;
}
