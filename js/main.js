window.onload = function onWindowLoaded () {
    enchant();

    var game = new Game(640, 960);
    game.fps = 60;
    var logger = new jam.Logger({console: console});
    var app = new jam.Application({game: game, logger: logger});
    var topLevel = new jam.Level({
        name: 'top',
        preload: function (context) {
            context.app.log(context.game);
            context.app.log("Preloading topLevel...");
            context.game.preload('img/mikoto.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            app.log("params=", params, "context=", context);

            var scene = (function () {
                var label1 = new Label('ああ' + jam.guid());
                label1.x = 50;
                label1.y = 100;
                label1.color = '#ff0000';
                label1.font = '12px';
                label1.opacity = 0.8;
                label1.text += 'fuga';

                var sprite = new Sprite(32, 32);
                sprite.image = game.assets['img/mikoto.png'];
                sprite.x = 50;
                sprite.y = 50;
                sprite.addEventListener('touchstart', function () {
                    app.log(window);
                    window.alert("test");
                    app.loadLevel('two', {foo:"bar"});
                });
                sprite.addEventListener('touchend', function () {
                });

                // use a Canvas element as a Sprite's drawing element
                //var sprite2 = new Sprite(64, 64);
                //var surface = new Surface(320, 320);
                //sprite2.image = surface;
                //sprite2.x = 64;
                //sprite2.y = 128;

                var scene = new Scene();
                scene.backgroundColor = '#eeeeee';
                scene.addEventListener('touchstart', function(e) {
                    console.log('touchstart', e);
                });
                scene.addEventListener('touchmove', function(e) {
                    console.log('touchmove', e);
                });

                scene.addChild(sprite);
                //scene.addChild(sprite2);
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

    var template = new jam.Level({
        name: "template",
        preload: function (context) {
            // context.game.preload('img/mikoto.png');
        },
        load: function (context, params) {
            // var scene = new Scene();
            // return { scene: scene };
        },
        unload: function (context) {

        }
    });

    var selectStage = new jam.Level({
        name: "selectStage",
        preload: function (context) {
            // context.game.preload('img/mikoto.png');
        },
        load: function (context, params) {
            var app = context.app;

            var scene = new Scene();

            scene.backgroundColor = "#eeeeee";

            var game = context.game;
            var w = game.width / 2;
            var h = game.height / Math.ceil(window.assets.stages.length / 2);

            var colors = ["#56ADFB", "#19436F", "#15141D"];

            window.assets.stages.forEach(function (stage, i) {
                var components = stage.name.replace("）", "").split("（");
                var charaName = components[0];
                var categoryName = components[1];

                var group = new Group();
                group.width = w;
                group.height = h;
                group.x = w * (i % 2);
                group.y = h * Math.floor(i / 2);

                var charaLabel = new Label(charaName);
                charaLabel.font = "bold 70px serif";
                charaLabel.color = "#ffffff";
                charaLabel.opacity = 0.6;
                charaLabel.touchEnabled = true;

                var categoryLabel = new Label(categoryName);
                categoryLabel.font = "30px sans-serif";
                categoryLabel.color = "#ffffff";
                categoryLabel.opacity = 0.3;
                categoryLabel.y = 80;
                categoryLabel.touchEnabled = true;

                var touchArea = new Sprite();
                touchArea.width = w;
                touchArea.height = h;
                touchArea.opacity = 0.8;
                touchArea.touchEnabled = true;
                touchArea.backgroundColor = colors[(i % colors.length)];

                group.addChild(touchArea);
                group.addChild(charaLabel);
                group.addChild(categoryLabel);

                group.addEventListener('touchstart', function (e) {
                    touchArea.backgroundColor = scene.backgroundColor;
                });

                group.addEventListener('touchend', function (e) {
                    touchArea.backgroundColor = colors[(i % colors.length)];
                    var stage = window.assets.stages[i];
                    app.loadLevel('playStage', { stage: stage })
                });

                scene.addChild(group);
            });

            return { scene: scene };
        },
        unload: function (context) {

        }
    });

    var playStage = new jam.Level({
        name: "playStage",
        preload: function (context) {
            // context.game.preload('img/mikoto.png');
        },
        load: function (context, params) {
            var stage = params.stage;

            var ySkipping = 30;

            var scene = new Scene();

            var label = new Label("プレイ中: " + stage.name);
            label.font = '30px sans';
            scene.addChild(label);

            console.log(stage.quizzes);

            stage.quizzes.forEach(function (quiz, i) {
               var quizLabel = new Label("問題番号:" + i + ", 問題文:" + quiz.text);
                quizLabel.y = ySkipping * i;
                scene.addChild(quizLabel);
            });

            return { scene: scene };
        },
        unload: function (context) {

        }
    });

    var playRoulette = new jam.Level({
        name: "playRoulette",
        preload: function (context) {
            context.game.preload('img/roulette.png');
            context.game.preload('img/stage_roulette.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;
            var stage = params.stage;

            var scene = new Scene();

            var rotationForce = 5 + Math.random() * 2;
            var unitTime = 10;
            var rotationTime = unitTime * rotationForce;

            var background = new Sprite();
            background.image = game.assets['img/stage_roulette.png'];
            background.width = game.width;
            background.height = game.height;

            var roulette = new Sprite();
            roulette.image = game.assets['img/roulette.png']
            roulette.width = 203;
            roulette.height = 199;
            roulette.scaleX = 2;
            roulette.scaleY = 2;
            roulette.x = 200;
            roulette.y = 330;

            roulette.addEventListener('touchend', function () {
                roulette.tl.rotateBy(360 * rotationForce, rotationTime);
                roulette.tl.then(function () {
                    var earnedLifePoints = Math.floor(Math.random() * 1.9999 + 1);

                    var scoreBackground = new Sprite();
                    scoreBackground.backgroundColor = "#666666";
                    scoreBackground.opacity = 0.8;
                    scoreBackground.width = game.width;
                    scoreBackground.height = game.height;

                    var scoreX = 100;
                    var scoreY = 500;
                    var scoreColor = '#66ee66';

                    var scoreDisplay = new Label("+ " + earnedLifePoints);
                    scoreDisplay.font = 'bold 150px sans'
                    scoreDisplay.color = scoreColor;
                    scoreDisplay.x = scoreX;
                    scoreDisplay.y = scoreY;

                    var scoreSuffix = new Label("コビ");
                    scoreSuffix.font = 'bold 50px sans';
                    scoreSuffix.color = scoreColor;
                    scoreSuffix.x = scoreX + 250;
                    scoreSuffix.y = scoreY + 90;

                    var group = new Group();
                    group.addChild(scoreBackground);
                    group.addChild(scoreDisplay);
                    group.addChild(scoreSuffix);

                    scene.addChild(group);

                    roulette.tl.delay(100);
                    roulette.tl.then(function () {
                        app.loadLevel('playStage', { stage: stage });
                    });
                });
            });

            this.enterFrame = function () {
                ticks ++;
                if (ticks % 100 == 0) {
                    console.log(ticks);
                }
            }

            var ticks = 0;
            game.addEventListener('enterframe', this.enterFrame);

            scene.addChild(background);
            scene.addChild(roulette);

            return { scene: scene };
        },
        unload: function (context) {
            context.game.removeEventListener('enterframe', this.enterFrame);
        }
    });

    app.registerLevel(topLevel);
    app.registerLevel(levelTwo);
    app.registerLevel(selectStage);
    app.registerLevel(playStage);
    app.registerLevel(playRoulette);

    app.loadLevel('playRoulette', { stage: window.assets.stages[0] });
};
