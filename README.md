# StateMachine: [![Build Status](https://travis-ci.org/icholy/StateMachine.svg?branch=1.0.0)](https://travis-ci.org/icholy/StateMachine)

> State Machine

**Usage:**

``` js

// create instance
var machine = new StateMachine.StateMachine({
  verbose: true,
  name:    "MyStateMachine"
});

// define states
machine.state("state1")

  .on("event1", function () {
    // do something
    this.go("state2");
  })

  .on("event2", function (x, y, z) {
    // do something
    console.log("x:", x, "y:", y, "z:", z);
  })

  .on("enter", function () {
    // special event that gets run when the state is entered
  });

machine.state("state2")

  .on("event2", function () {
    // do something else
    this.go("state1");
  })

  .on("exit", function () {
    // special event that gets run when the state is exited
  });

// set initial state
machine.init("state1");

// invoke events
machine.emit("event1");
machine.emit("event2", "foo", "bar", "baz");

//get current state name
console.log(machine.current.name);
```

