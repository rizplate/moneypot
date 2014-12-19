define([
    'lib/react',
    'strategies/strategies',
    'lib/lodash',
    'lib/clib',
    'stores/EngineVirtualStore',
    'stores/StrategyEditorStore',
    'actions/StrategyEditorActions'
],function(
    React,
    Strategies,
    _,
    Clib,
    EngineVirtualStore,
    StrategyEditorStore,
    StrategyEditorActions
){

    var D = React.DOM;

    return React.createClass({
        displayName: 'strategyEditor',

        getState: function() {
            var state = StrategyEditorStore.getState();
            state.engine = EngineVirtualStore.getState();

            return state;
        },

        getInitialState: function() {
            return this.getState();
        },

        componentDidMount: function() {
            EngineVirtualStore.addChangeListener(this._onChange);
            StrategyEditorStore.addChangeListener(this._onChange);
        },

        componentWillUnmount: function() {
            EngineVirtualStore.removeChangeListener(this._onChange);
            StrategyEditorStore.removeChangeListener(this._onChange);
        },

        _onChange: function() {
            //Check if its mounted because when Game view receives the disconnect event from EngineVirtualStore unmounts all views
            //and the views unregister their events before the event dispatcher dispatch them with the disconnect event
            if(this.isMounted())
                this.setState(this.getState());
        },

        _runStrategy: function() {
            StrategyEditorActions.runStrategy();
        },

        _stopStrategy: function() {
            StrategyEditorActions.stopScript();
        },

        _updateScript: function() {
            var script = this.refs.input.getDOMNode().value;
            StrategyEditorActions.updateScript(script);
        },

        _selectStrategy: function() {
            var strategyName = this.refs.strategies.getDOMNode().value;
            StrategyEditorActions.selectStrategy(strategyName);
        },

        render: function() {
            var self = this;

            var strategiesOptions =_.map(Strategies, function(strategy, strategyName) {
                return D.option({ value: strategyName, key: 'strategy_'+strategyName }, Clib.capitaliseFirstLetter(strategyName));
            });

            var WidgetElement;
            //If the strategy is not a script should be a widget function and we mount it
            if(typeof this.state.strategy == 'function'){
                //Send the strategy StrategyEditorStore and StrategyEditorActions to avoid circular dependencies
                var element = React.createFactory(this.state.strategy);
                WidgetElement = element({ StrategyEditorStore: StrategyEditorStore, StrategyEditorActions: StrategyEditorActions });

            } else {
                WidgetElement = D.textarea({ className: 'strategy-input', ref: 'input', value: self.state.strategy, onChange: self._updateScript, disabled: this.state.active });
            }

            return D.div({ className: 'strategy-container' },
                WidgetElement,
                D.button({ className: 'strategy-start', onClick: self._runStrategy, disabled: this.state.active || this.state.invalidData || !this.state.engine.username }, 'RUN!'),
                D.button({ className: 'strategy-stop', onClick: self._stopStrategy, disabled: !this.state.active }, 'STOP'),
                D.select({ className: 'strategy-select', value: this.state.selectedStrategy,  onChange: self._selectStrategy, ref: 'strategies', disabled: this.state.active }, strategiesOptions),
                D.span({ className: 'strategy-invalid-data' }, this.state.invalidData || !this.state.engine.username)
            );
        }
    });

});