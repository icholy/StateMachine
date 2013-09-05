# SSM: Shitty State Machine

**Usage:**


``` js

// create instance
var ssm = new SSM();

// define states
var state1 = ssm.state("state1")

state1.on("event1", function () {
  // do something
  this.goto("state2");
});

state1.on("event2", function () {
  // do something
});

state1.on("enter", function () {
  // special event that gets run when the state is entered
});

ssm.state("state2")
  .on("event2", function () {
    // do something else
    this.goto("state1");
  })
  .on("exit", function () {
    // special event that gets run when the state is exited
  });

// set initial state
ssm.initialize("state1");

// invoke events
ssm.event1();
ssm.event2();

```
