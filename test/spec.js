
var ConsoleLogStub = function () {
  this.logFn = console.log;
  this.lines = [];
  var _this = this;
  console.log = function () {
    _this.lines.push(
        [].slice(arguments).map(function (a) {
          return a.toString();
        }).join(' '));
    _this.logFn.apply(console, arguments);
  };
};

ConsoleLogStub.prototype.outputContains = function (query) {
  return this.lines.some(function (line) {
    return line.indexOf(query);
  });
};

ConsoleLogStub.prototype.restore = function () {
  console.log = this.logFn;
};

describe("StateMachine", function () {

  it("should invoke the transition function", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", done);
    sm.initialize("state1");
    sm.emit("event1");
  });

  it("should correctly transition between states", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", function () {
      this.go("state2");
    });
    sm.state("state2").on("event1", done);
    sm.initialize("state1");
    sm.emit("event1");
    sm.emit("event1");
  });

  it("should error if trying to transition to a non-existing state", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", function () { this.go("non-existing-state"); });
    sm.initialize("state1");
    try {
      sm.emit("event1"); 
    } catch (e) {
      done();
    }
  });

  it("should error if trying to register a reserved api", function (done) {
    var sm = new StateMachine.StateMachine();
    try {
      sm.state("foo").event("go"); 
    } catch (e) {
      done(); 
    }
  });

  it("should error if event is not defined on the current state", function (done) {
    var sm   = new StateMachine.StateMachine(),
        dummy = function () {};
    sm.state("state1").on("event1", dummy);
    sm.state("state2").on("event2", dummy);
    sm.initialize("state1");
    try {
      sm.emit("event2");  
    } catch (e) {
      done(); 
    }
  });

  it("should error if trying to initialize to a non-existing state", function (done) {
    var sm = new StateMachine.StateMachine();
    try {
      sm.initialize("state1");
    } catch (e) {
      done();
    }
  });

  it("should not error if trying to redefine the same event on the same state", function () {
    var sm   = new StateMachine.StateMachine(),
        dummy = function () {};
    sm.state("state1").on("event1", dummy);
    sm.state("state1").on("event1", dummy);
  });

  it("should work with multiple callbacks on the same event", function (done) {
    var count = 0,
        sm   = new StateMachine.StateMachine(),
        cb    = function () { if (++count === 2) { done(); } };

    sm.state("state1").on("event1", cb).on("event1", cb);
    sm.initialize("state1");
    sm.emit("event1");
  });

  it("should invoke the enter event when entering a state", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", function () { this.go("state2"); });
    sm.state("state2").on("enter", done);
    sm.initialize("state1");
    sm.emit("event1");
  });

  it("should invoke the exit event when entering a state", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", function () { this.go("state2"); });
    sm.state("state1").on("exit", done);
    sm.state("state2").on("enter", function () {});
    sm.initialize("state1");
    sm.emit("event1");
  });

  it("should not invoke the enter event if the state didn't actually change", function () {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("enter", function () {
      throw Error("state did not change");
    });
    sm.initialize("state1");
    sm.go("state1");
  });

  it("should not invoke the exit event if the state didn't actually change", function () {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("exit", function () {
      throw Error("state did not change");
    });
    sm.initialize("state1");
    sm.go("state1");
  });

  it("should work with multiple enter events", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state2");
    var callCount = 0;
    sm.state("state1").on("enter", function () { ++callCount === 2 && done(); });
    sm.state("state1").on("enter", function () { ++callCount === 2 && done(); });
    sm.initialize("state2");
    sm.go("state1");
  });

  it("should work with multiple exit events", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state2");
    var callCount = 0;
    sm.state("state1").on("exit", function () { ++callCount === 2 && done(); });
    sm.state("state1").on("exit", function () { ++callCount === 2 && done(); });
    sm.initialize("state1");
    sm.go("state2");
  });

  it("should recieve parameters from event invokations", function (done) {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", function (arg1, arg2) {
      if (arg1 !== "foo" || arg2 !== "bar") {
        throw Error("parameters were not passed correctly");
      } else {
        done();
      }
    })
    sm.initialize("state1");
    sm.emit("event1", "foo", "bar");
  });

  it("should return the correct current state name", function () {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", function () {
      this.go("state2");
    });
    sm.state("state2");
    sm.initialize("state1");
    sm.emit("event1");
    if (sm.current() !== "state2") {
      throw Error("incorrect state");
    }
  });

  it("should work with the simple transition rules", function () {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", "state2");
    sm.state("state2").on("event1", "state1");
    sm.initialize("state1");
    sm.emit("event1");
    if (sm.current() !== "state2") {
      throw Error("incorrect state");
    }
    sm.emit("event1");
    if (sm.current() !== "state1") {
      throw Error("incorrect state");
    }
  });

  it("should allow a state event with no second parameter", function () {
    var sm = new StateMachine.StateMachine();
    sm.state("state1").on("event1", "state2");
    sm.state("state2").on("event1", undefined);
    sm.initialize("state1");
    sm.emit("event1");
    sm.emit("event1");
    if (sm.current() !== "state2") {
      throw Error("incorrect state");
    }
  });

  it("should provide the StateMachine instance as this in enter and exit", function () {
    var sm = new StateMachine.StateMachine();

    sm.state("state1")

      .on("exit", function () {
        if (this !== sm) {
          throw Error("this does not equal sm");
        }
      })

      .on("event1", "state2");

    sm.state("state2")

      .on("enter", function () {
        if (this !== sm) {
          throw Error("this does not equal sm");
        }
      });

    sm.initialize("state1");
    sm.emit("event1");

  });

  it("should log exceptions when the logExceptions option is set", function () {

    var sm = new StateMachine.StateMachine({ logExceptions: true });

    // stub the console
    var stub = new ConsoleLogStub();

    var errMessage = "this_should_be_logged_and_rethrown",
        wasRethrown = false;

    try {

      sm.state("state")
        .on("event", function () {
          throw Error(errMessage);
        });

      sm.initialize("state");
      sm.emit("event");

    } catch (e) {
      wasRethrown = true;
    }

    stub.restore();

    if (!wasRethrown) {
      throw Error("exception was not rethrown");
    }

    if (!stub.outputContains(errMessage)) {
      throw Error("exception was not logged");
    }

  });

});
