window.onload = function onWindowLoaded () {
    enchant();
    
    var game = new Game(320, 320);
    game.fps = 15;
    
    var logger = new jam.Logger({console: console});
    
    var app = new jam.Application({game: game, logger: logger});
        
    var topLevel = new jam.Level({
        name: 'top',
        preload: function (context) {
            context.app.log("Preloading topLevel...");
            context.game.preload('http://jsrun.it/assets/l/4/0/X/l40Xg.png');
        },
        load: function (context, params) {
            var game = context.game,
                    app = context.app;
            
            app.log("params=", params, "context=", context);
            
            var scene = (function () {
                var label1 = new Label('hoge' + jam.guid());
                label1.x = 50;
                label1.y = 100;
                label1.color = '#ff0000';
                label1.font = '8px cursive';
                label1.opacity = 0.8;
                label1.text += 'fuga';
                
                var sprite = new Sprite(32, 32);
                sprite.image = game.assets['http://jsrun.it/assets/l/4/0/X/l40Xg.png'];
                sprite.addEventListener('touchstart', function () {
                    window.alert("test");
                    app.loadLevel('two', {foo:"bar"});
                });
                sprite.addEventListener('touchend', function () {
                });
                
                // use a Canvas element as a Sprite's drawing element
                var sprite2 = new Sprite(64, 64);
                var surface = new Surface(320, 320);
                sprite2.image = surface;
                sprite2.x = 64;
                sprite2.y = 128;
                
                var scene = new Scene();
                scene.backgroundColor = '#eeeeee';
                scene.addEventListener('touchstart', function(e) {
                    console.log('touchstart', e);
                });
                scene.addEventListener('touchmove', function(e) {
                    console.log('touchmove', e);
                });

                scene.addChild(sprite);
                scene.addChild(sprite2);
                scene.addChild(label1);
                
                return scene;
            })();
            
            var frameCount = 0;
            this.onEnterFrame = function () {
                frameCount ++;
                
                if (frameCount % 100 == 0) {
                    context.app.log(frameCount + " frames has passed until now.");
                }
            };
            game.addEventListener('enterframe', this.onEnterFrame);
            
            return { scene: scene };
        },
        unload: function (context) {
            var game = context.game;
            game.removeEventListener('enterframe', this.onEnterFrame);
            this.onEnterFrame = null;
        }
    });
    
    var levelTwo = new jam.Level({
        name: "two",
        load: function (context, params) {
            var scene = new Scene();
            
            var label = new Label("Level 2: params=" + params);
            label.x = 32;
            label.y = 32;
            
            var ball = new Sprite(50, 50);
            var surface = new Surface(50, 50);
            surface.context.beginPath();
            surface.context.arc(25, 25, 25, 0, Math.PI*2, true);
            surface.context.fill();
            ball.image = surface;
            
            scene.addChild(label);
            scene.addChild(ball);
            return { scene: scene };
        },
        unload: function (context, params) {
        }
    });
    
    app.registerLevel(topLevel);
    app.registerLevel(levelTwo);
    
    app.loadLevel('top', { test: 1 });
};
