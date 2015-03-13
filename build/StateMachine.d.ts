declare module StateMachine {
    interface EventHandler {
        (...any: any[]): any;
    }
    class State {
        name: string;
        _enter: Array<EventHandler>;
        _exit: Array<EventHandler>;
        private _sm;
        private _events;
        /**
         * A single state
         *
         * @param sm - state machine
         * @param name - state name
         */
        constructor(sm: StateMachine, name: string);
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
        on(event: string, handler?: EventHandler | string): State;
        /**
         * Emit an event
         *
         * @param event Event name
         * @param args Arguments to pass to event handler
         */
        emit(event: string, ...args: Array<any>): void;
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
        private _states;
        current: State;
        options: Options;
        /**
         * @param options Options
         */
        constructor(options?: Options);
        /**
         * Initializes the state machine to an initial state.
         * trying to invoke event methods before initializing
         * will result in an `Error` being thrown
         *
         * @param name Initial state name
         * @return State machine
         */
        init(name: string): void;
        /**
         * Creates or gets existing State
         *
         * @param Name - state name
         * @return State specified by name
         */
        state(name: string): State;
        /**
         * Emit an event
         *
         * @param event Event name
         * @param args Arguments to pass to event handler
         */
        emit(event: string, ...args: Array<any>): void;
        /**
         * Go to another state
         *
         * @param name State to transition to
         */
        go(name: string): void;
    }
}
