declare module StateMachine {
    interface EventHandler {
        (...any: any[]): any;
    }
    class State {
        _sm: StateMachine;
        _name: string;
        _events: any;
        _enter: Array<EventHandler>;
        _exit: Array<EventHandler>;
        /**
         * a single state
         *
         * @class State
         * @param sm - state machine
         * @param name - state name
         */
        constructor(sm: StateMachine, name: string);
        /**
         * Create a function for invoking an event
         *
         * @param event - Event name
         * @return Event method
         */
        private _makeEventMethod(event);
        /**
         * Convert an event handler parameter to a function
         *
         * @param x Handler parameter
         * @return Event handler
         */
        private _makeEventHandler(x?);
        /**
         * Register a state event and add the event method
         * to the state machine instance
         *
         * Note:
         *
         *  `enter` and `exit` are special events.
         *  event methods do not get defined for them.
         *  they are executed when the state machine is
         *  entering or exiting that state.
         *
         * @param event Event name
         * @param handler Event callback function or state name
         * @return State
         */
        on(event: string, handler: EventHandler | string): State;
    }
    interface Options {
        name?: string;
        verbose?: boolean;
        logExceptions?: boolean;
    }
    interface EventMethod {
        (...any: any[]): any;
    }
    class StateMachine {
        _states: {
            [name: string]: State;
        };
        _current: State;
        _options: Options;
        /**
         * @param options Options
         */
        constructor(options: Options);
        /**
         * Initializes the state machine to an initial state.
         * trying to invoke event methods before initializing
         * will result in an `Error` being thrown
         *
         * @param name Initial state name
         * @return State machine
         */
        initialize(name: string): void;
        /**
         * Creates or gets existing State
         *
         * @param Name - state name
         * @return State specified by name
         */
        state(name: string): State;
        /**
         * Gets the name of the current State
         *
         * @return name Current state name
         */
        current(): string;
        /**
         * Go to another state
         *
         * @param name State to transition to
         */
        go(name: string): void;
    }
}
