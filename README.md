# SSM: Shitty State Machine

**Usage:**


``` js

// create instance
var ssm = new SSM();

// define states
ssm.state("state1").on("event1", function () {
  // do something
  this.goto("state2");
});

ssm.state("state1").on("event2", function () {
  // do something
});

ssm.state("state2").on("event2", function () {
  // do something else
  this.goto("state1");
});

// set initial state
ssm.initialize("state1");

// invoke events
ssm.event1();
ssm.event2();

```
