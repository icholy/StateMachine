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
         * create a function for invoking an event
         *
         * @method _makeEventMethodfn
         * @private
         * @param {string} event - event name
         * @return {function}
         */
        private _makeEventMethodFn(event);
        /**
         * convert an event handler parameter to a function
         *
         * @method _makeEventHandlerFn
         * @private
         * @param {function|string|undefined} x - handler
         * @return {function}
         */
        private _makeEventHandlerFn(x);
        /**
         * register a state event and add the event method
         * to the state machine instance
         *
         * Note:
         *
         *  `enter` and `exit` are special events.
         *  event methods do not get defined for them.
         *  they are executed when the state machine is
         *  entering or exiting that state.
         *
         * @method on
         * @param {string} event - event name
         * @param {function|string} handler - event callback function or state name
         * @return {State} state
         */
        on(event: any, handler: any): State;
    }
    interface Options {
        name?: string;
        verbose?: boolean;
        logExceptions?: boolean;
    }
    class StateMachine {
        _states: {
            [name: string]: State;
        };
        _current: State;
        _options: Options;
        /**
         * Simple State Machine
         *
         * @class StateMachine
         * @param {object}  options
         * @param {boolean} options.verbose
         * @param {string}  options.name
         */
        constructor(options: Options);
        /**
         * Initializes the state machine to an initial state.
         * trying to invoke event methods before initializing
         * will result in an `Error` being thrown
         *
         * @method initialize
         * @param {string} name - initial state name
         * @return {StateMachine} state machine
         */
        initialize(name: any): StateMachine;
        /**
         * Creates or gets existing State
         *
         * @method state
         * @param {string} name - state name
         * @return {State} state specified by name
         */
        state(name: any): State;
        /**
         * Gets the name of the current State
         *
         * @method current
         * @return {string} name - current state name
         */
        current(): string;
        /**
         * Go to another state
         *
         * @method go
         * @param {string} name - state to transition to
         * @return {StateMachine} state machine
         */
        go(name: any): StateMachine;
    }
}
