
var FSM = require("../jsfsm.js");

describe("FSM", function () {
  it("should invoke the transition function", function (done) {
    var fsm = new FSM();
    fsm.state("state1").on("event1", done);
    fsm.initialize("state1");
    fsm.event1();
  });

  it("should correctly transition between states", function (done) {
    var fsm = new FSM();
    fsm.state("state1").on("event1", function () { this.goto("state2"); });
    fsm.state("state2").on("event1", done);
    fsm.initialize("state1");
    fsm.event1();
    fsm.event1();
  });

  it("should error if trying to transition to a non-existing state", function (done) {
    var fsm = new FSM();
    fsm.state("state1").on("event1", function () { this.goto("non-existing-state"); });
    fsm.initialize("state1");
    try {
      fsm.event1(); 
    } catch (e) {
      done();
    }
  });

  it("should error if trying to register a reserved api", function (done) {
    var fsm = new FSM();
    try {
      fsm.state("foo").event("goto"); 
    } catch (e) {
      done(); 
    }
  });

  it("should error if event is not defined on the current state", function (done) {
    var fsm   = new FSM(),
        dummy = function () {};
    fsm.state("state1").on("event1", dummy);
    fsm.state("state2").on("event2", dummy);
    fsm.initialize("state1");
    try {
      fsm.event2();  
    } catch (e) {
      done(); 
    }
  });

  it("should error if trying to initialize to a non-existing state", function (done) {
    var fsm = new FSM();
    try {
      fsm.initialize("state1");
    } catch (e) {
      done();
    }
  });

  it("should error if trying to redefine the same event on the same state", function (done) {
    var fsm   = new FSM(),
        dummy = function () {};
    fsm.state("state1").on("event1", dummy);
    try {
      fsm.state("state1").on("event1", dummy);
    } catch (e) {
      done();
    }
  });

});
