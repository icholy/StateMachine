
var SSM = (function () {

  var reserved = ["state", "goto", "initialize"];

  var isDefined   = function (x) { return typeof x !== "undefined"; },
      isUndefined = function (x) { return !isDefined(x); }

  var State = function (sm, name) {
    this._sm     = sm;
    this._name   = name;
    this._events = {};
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
  };

  SSM.prototype.state = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      states[name] = new State(this, name);
    }
    return states[name];
  };

  SSM.prototype.goto = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      throw new Error(name + " state does not exist");
    }
    this._current = states[name];
  };


  return SSM;

}).call(this);

if (typeof module !== "undefined") {
  module.exports = SSM;
}
