
var FSM = (function () {

  var reserved = ["state", "goto", "initialize"];

  var isDefined   = function (x) { return typeof x !== "undefined"; },
      isUndefined = function (x) { return !isDefined(x); }

  var State = function (fsm, name) {
    this._fsm    = fsm;
    this._name   = name;
    this._events = {};
  };

  State.prototype._makeEventFn = function (event) {
    var fsm = this._fsm;
    return function () {
      var state  = fsm._current,
          events = state._events;
      if (state == null) {
        throw new Error("the state machine has not been initialized");
      }
      if (isUndefined(events[event])) {
        throw new Error(
          event + " event not defined for " + state._name + " state"
        );
      }
      events[event].call(fsm);
    };
  };

  State.prototype.on = function (event, fn) {
    var events = this._events,
        fsm    = this._fsm;
    if (reserved.indexOf(event) !== -1) {
      throw new Error(event + " method is reserved for the api");
    };
    if (isDefined(events[event])) {
      throw new Error(
        event + " event already defined for " + this._name + " state"
      );
    }
    events[event] = fn;
    if (isUndefined(fsm[event])) {
      fsm[event] = this._makeEventFn(event);
    }
  };

  var FSM = function () {
    this._states  = {};
    this._current = null;
  };

  FSM.prototype.initialize = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      throw new Error(name + " state is not defined");
    }
    this._current = states[name];
  };

  FSM.prototype.state = function (name) {
    var states = this._states;
    if (isUndefined(states[name])) {
      states[name] = new State(this, name);
    }
    return states[name];
  };

  FSM.prototype.goto = function (name) {
    var state  = this._current,
        events = state._events;
    if (isUndefined(events[name])) {
      throw new Error("no transition from " + state._name + " to " + name);
    }
    this._current = events[name];
  };

  return FSM;

}).call(this);


