# SSM: [![Build Status](https://travis-ci.org/icholy/SSM.png?branch=master)](https://travis-ci.org/icholy/SSM)

> Simple State Machine 

**Usage:**

``` js

// create instance
var ssm = new SSM();

// define states
var state1 = ssm.state("state1");

state1.on("event1", function () {
  // do something
  this.go("state2");
});

state1.on("event2", function (x, y, z) {
  // do something
  console.log("x:", x, "y:", y, "z:", z);
});

state1.on("enter", function () {
  // special event that gets run when the state is entered
});

ssm.state("state2")
  .on("event2", function () {
    // do something else
    this.go("state1");
  })
  .on("exit", function () {
    // special event that gets run when the state is exited
  });

// set initial state
ssm.initialize("state1");

// invoke events
ssm.event1();
ssm.event2("foo", "bar", "baz");

//get current state name
var name = ssm.current();
console.log(name);

```

**Note:** the api is completely chainable
