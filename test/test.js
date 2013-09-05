
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
    ssm.state("state1").on("event1", function () { this.goto("state2"); });
    ssm.state("state2").on("event1", done);
    ssm.initialize("state1");
    ssm.event1();
    ssm.event1();
  });

  it("should error if trying to transition to a non-existing state", function (done) {
    var ssm = new SSM();
    ssm.state("state1").on("event1", function () { this.goto("non-existing-state"); });
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
      ssm.state("foo").event("goto"); 
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

  it("should error if trying to redefine the same event on the same state", function (done) {
    var ssm   = new SSM(),
        dummy = function () {};
    ssm.state("state1").on("event1", dummy);
    try {
      ssm.state("state1").on("event1", dummy);
    } catch (e) {
      done();
    }
  });

});
