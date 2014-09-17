
var SSM = require("../ssm.js");

describe("SSM", function () {

  it("should invoke the transition function", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", done);
    ssm.initialize("state1");
    ssm.event1();
  });

  it("should correctly transition between states", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function () { this.go("state2"); });
    ssm.state("state2").on("event1", done);
    ssm.initialize("state1");
    ssm.event1();
    ssm.event1();
  });

  it("should error if trying to transition to a non-existing state", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function () { this.go("non-existing-state"); });
    ssm.initialize("state1");
    try {
      ssm.event1(); 
    } catch (e) {
      done();
    }
  });

  it("should error if trying to register a reserved api", function (done) {
    var ssm = new SSM();
    try {
      ssm.state("foo").event("go"); 
    } catch (e) {
      done(); 
    }
  });

  it("should error if event is not defined on the current state", function (done) {
    var ssm   = new SSM(),
        dummy = function () {};
    ssm.state("state1").on("event1", dummy);
    ssm.state("state2").on("event2", dummy);
    ssm.initialize("state1");
    try {
      ssm.event2();  
    } catch (e) {
      done(); 
    }
  });

  it("should error if trying to initialize to a non-existing state", function (done) {
    var ssm = new SSM();
    try {
      ssm.initialize("state1");
    } catch (e) {
      done();
    }
  });

  it("should not error if trying to redefine the same event on the same state", function () {
    var ssm   = new SSM(),
        dummy = function () {};
    ssm.state("state1").on("event1", dummy);
    ssm.state("state1").on("event1", dummy);
  });

  it("should work with multiple callbacks on the same event", function (done) {
    var count = 0,
        ssm   = new SSM(),
        cb    = function () { if (++count === 2) { done(); } };

    ssm.state("state1").on("event1", cb).on("event1", cb);
    ssm.initialize("state1");
    ssm.event1();
  });

  it("should invoke the enter event when entering a state", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function () { this.go("state2"); });
    ssm.state("state2").on("enter", done);
    ssm.initialize("state1");
    ssm.event1();
  });

  it("should invoke the exit event when entering a state", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function () { this.go("state2"); });
    ssm.state("state1").on("exit", done);
    ssm.state("state2").on("enter", function () {});
    ssm.initialize("state1");
    ssm.event1();
  });

  it("should not invoke the enter event if the state didn't actually change", function () {
    var ssm = new SSM();
    ssm.state("state1").on("enter", function () {
      throw "state did not change";
    });
    ssm.initialize("state1");
    ssm.go("state1");
  });

  it("should not invoke the exit event if the state didn't actually change", function () {
    var ssm = new SSM();
    ssm.state("state1").on("exit", function () {
      throw "state did not change";
    });
    ssm.initialize("state1");
    ssm.go("state1");
  });

  it("should work with multiple enter events", function (done) {
    var ssm = new SSM();
    ssm.state("state2");
    var callCount = 0;
    ssm.state("state1").on("enter", function () { ++callCount === 2 && done(); });
    ssm.state("state1").on("enter", function () { ++callCount === 2 && done(); });
    ssm.initialize("state2");
    ssm.go("state1");
  });

  it("should work with multiple exit events", function (done) {
    var ssm = new SSM();
    ssm.state("state2");
    var callCount = 0;
    ssm.state("state1").on("exit", function () { ++callCount === 2 && done(); });
    ssm.state("state1").on("exit", function () { ++callCount === 2 && done(); });
    ssm.initialize("state1");
    ssm.go("state2");
  });

  it("should be chainable", function (done) {
    var ssm = new SSM()
        .state("state1")
          .on("event1", function () {
            this.go("state2");
          })
          .on("exit", function () { })
        .state("state2")
          .on("enter", done)
        .initialize("state1");

    ssm.event1();
  });

  it("should recieve parameters from event invokations", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function (arg1, arg2) {
      if (arg1 !== "foo" || arg2 !== "bar") {
        throw new Error("parameters were not passed correctly");
      } else {
        done();
      }
    })
    ssm.initialize("state1");
    ssm.event1("foo", "bar");
  });

  it("should return the correct current state name", function () {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function () {
      this.go("state2");
    });
    ssm.state("state2");
    ssm.initialize("state1");
    ssm.event1();
    if (ssm.current() !== "state2") {
      throw "incorrect state";
    }
  });

  it("should work with the simple transition rules", function () {
    var ssm = new SSM();
    ssm.state("state1").on("event1", "state2");
    ssm.state("state2").on("event1", "state1");
    ssm.initialize("state1");
    ssm.event1();
    if (ssm.current() !== "state2") {
      throw "incorrect state";
    }
    ssm.event1();
    if (ssm.current() !== "state1") {
      throw "incorrect state";
    }
  });

  it("should allow a state event with no second parameter", function () {
    var ssm = new SSM();
    ssm.state("state1").on("event1", "state2");
    ssm.state("state2").on("event1");
    ssm.initialize("state1");
    ssm.event1();
    ssm.event1();
    if (ssm.current() !== "state2") {
      throw "incorrect state";
    }
  });

  it("should provide the SSM instance as this in enter and exit", function () {
    var ssm = new SSM();

    ssm.state("state1")

      .on("exit", function () {
        if (this !== ssm) {
          throw "this does not equal ssm";
        }
      })

      .on("event1", "state2");

    ssm.state("state2")

      .on("enter", function () {
        if (this !== ssm) {
          throw "this does not equal ssm";
        }
      });

    ssm.initialize("state1");
    ssm.event1()

  });

});
