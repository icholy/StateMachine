# SSM: [![Build Status](https://travis-ci.org/icholy/SSM.png?branch=master)](https://travis-ci.org/icholy/SSM)

> Simple State Machine 

**Usage:**

``` js

// create instance
var machine = new SSM({ verbose: true, name: "MyStateMachine" });

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
machine.initialize("state1");

// invoke events
machine.event1();
machine.event2("foo", "bar", "baz");

//get current state name
var name = machine.current();
console.log(name);
```

**Note:** the api is completely chainable
