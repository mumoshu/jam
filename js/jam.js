window.jam = (function () {
    
    function Module () {};
    
    var jam = new Module();

    function noop () {
    }
    
    jam.noop = noop;
    
    function guid () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    
    jam.guid = guid;
    
    var Logger = jam.Logger = (function () {
        function Logger (args) {
            this.console = args.console;
        }
        
        Logger.prototype.log = function () {
            this.console.log.apply(this.console, arguments);
        };
        
        return Logger;
    })();
    
    var Application = jam.Application = (function () {
        function Application (args) {
            var context = {};
            for (var name in args) {
                if (args.hasOwnProperty(name)) {
                    context[name] = args[name];
                }
            }
            context.app = this;
            
            this.context = context;
            this.game = context.game;
            this.logger = context.logger;
            this.registeredLevels = {};
            this.preloaded = false;
            this.started = false;
        }
        Application.prototype.registerLevel = function (level) {
            this.registeredLevels[level.getName()] = level;
        };
        Application.prototype.loadLevel = function (levelName, params) {
            function throwLevelDoesNotExistError () {
                throw "The level named '" + levelName + "' does not exist in registered levels(=" + this.registeredLevels+ ")";
            }
            
            var context = this.context;
            if (this.currentLevel != null) {
                this.currentLevel.unload(context);
                this.currentLEvel = null;
            }
            var level = this.registeredLevels[levelName] || throwLevelDoesNotExistError();
            this.ensurePreloaded();
            this.ensureStarted(function() {
                level.load(context, params || {});
                this.currentLevel = level;
            });
        };
        Application.prototype.ensurePreloaded = function () {
            if (!this.preloaded) {
                var context = this.context;
                var registeredLevels = this.registeredLevels;
                for (var levelName in registeredLevels) {
                    if (registeredLevels.hasOwnProperty(levelName)) {
                        var level = registeredLevels[levelName];
                        level.preload(context);
                    }
                }
                this.preloaded = true;
            }
        };
        Application.prototype.ensureStarted = function (callback) {
            var app = this;
            var game = app.game;
            
            try {
                if (!app.started) {
                    game.onload = function () {
                        app.log("Game#onload");
                        app.started = true;
                        callback.call(app);
                    };
                    game.start();
                } else {
                    callback.call(app);
                }
            } catch (e) {
                app.log(e, e.message, e.stack);
                app.log("app=", app, "game=", game);
                throw new Error("Application#ensureLoaded(): Catched an unexpected error. Logging variables");
            }
        };
        Application.prototype.log = function () {
            this.logger.log.apply(this.logger, arguments);
        };
        return Application;
    })();
    
    var Level = jam.Level = (function () {
        function Level (args) {
            function throwMissingLevelNameError () {
                throw "Missing the level name in the Level class' constructor args(=" + args + ")"
            }
            
            this._name = args.name || throwMissingLevelNameError();
            this._preload = args.preload || noop;
            this._load = args.load || function (context, params) { context.game.pushScene(new Scene()) };
            this._unload = args.unload || function (context) { context.game.popScene(); };
        }
        Level.prototype.getName = function () {
            return this._name;
        };
        Level.prototype.preload = function (context) {
            console.log("Preloading the level named " + this._name);
            this._preload(context);
        };
        Level.prototype.load = function (context, params) {
            var result = this._load(context, params);
            context.game.pushScene(result.scene);
        };
        Level.prototype.unload = function (context) {
            this._unload(context);
            context.game.popScene();
        };
        return Level;
    })();
    
    return jam;
    
})();
