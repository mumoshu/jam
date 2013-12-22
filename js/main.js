var controller = (function () {
    function Module() {}

    var controller = new Module();

    controller.GaugeController = (function () {
        function GaugeController(args) {
            this.group = args.group;
            this.sprites = args.sprites;
        }
        GaugeController.prototype.setValue = function (value) {
            this.value = value;
            if (this.group.firstChild != null) {
                this.group.removeChild(this.group.firstChild);
            }
            this.group.addChild(this.sprites[value]);
        };
        GaugeController.prototype.getValue = function () {
            return this.value;
        };
        GaugeController.prototype.setRandom = function () {
            var value = Math.floor(Math.random() * this.sprites.length);
            this.setValue(value);
        };
        GaugeController.getMaxValue = function () {
            return this.sprites.length;
        };

        return GaugeController;
    })();

    return controller;
})();

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
            context.game.preload('img/top_background.png');
            context.game.preload('img/top_list_button.png');
            context.game.preload('img/mikoto.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            app.log("params=", params, "context=", context);

            var scene = (function () {
                var background = new Sprite();
                background.image = game.assets['img/top_background.png'];
                background.width = game.width;
                background.height = game.height;

                var listButton = new Sprite();
                listButton.image = game.assets['img/top_list_button.png'];
                listButton.width = 637
                listButton.height = 346;
                listButton.y = 500;

                listButton.tl
                    .hide()
                    .and()
                    .scaleTo(0, 0)
                    .fadeIn(50, enchant.Easing.BOUNCE_EASEOUT)
                    .and()
                    .scaleTo(1, 50, enchant.Easing.BOUNCE_EASEOUT);

                listButton.addEventListener('touchstart', function () {
                    app.log(window);

                    listButton.tl
                        .fadeOut(5)
                        .fadeIn(5)
                        .fadeOut(5)
                        .fadeIn(5)
                        .fadeOut(5)
                        .fadeIn(5);

                    background.tl
                        .fadeOut(50)
                        .then(function () {
                            app.loadLevel('selectStage', {foo:"bar"});
                        });
                });
                listButton.addEventListener('touchend', function () {
                });

                var scene = new Scene();
                scene.addChild(background);
                scene.addChild(listButton);

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

    var stageImagePaths = [];

    for (var i=0; i<7; i++) {
        stageImagePaths.push('img/stage_' + i + '.png');
    }

    var selectStage = new jam.Level({
        name: "selectStage",
        preload: function (context) {
            stageImagePaths.forEach(function (path) {
               context.game.preload(path);
            });
        },
        load: function (context, params) {
            var app = context.app;
            var game = context.game;

            var scene = new Scene();

            var overlay = new Sprite();
            overlay.backgroundColor = '#eeeeee';
            overlay.width = game.width;
            overlay.height = game.height;
            overlay.opacity = 0;
            overlay.touchEnabled = false;

            scene.backgroundColor = "#eeeeee";

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

                var touchAreaBackgroundColor = colors[(i % colors.length)];

                var background = new Sprite();
                background.width = w;
                background.height = h;
                background.opacity = 0.8;
                background.touchEnabled = true;
                background.backgroundColor = touchAreaBackgroundColor;
                background.image = game.assets[stageImagePaths[i]];

                var touchArea = new Sprite();
                touchArea.width = w;
                touchArea.height = h;
                touchArea.opacity = 0.8;
                touchArea.touchEnabled = true;
                touchArea.backgroundColor = touchAreaBackgroundColor;

                group.addChild(background);
                group.addChild(touchArea);
                group.addChild(charaLabel);
                group.addChild(categoryLabel);

                group.addEventListener('touchstart', function (e) {
                    function flashOn () {
                        touchArea.backgroundColor = scene.backgroundColor;
                    }
                    function flashOff () {
                        touchArea.backgroundColor = touchAreaBackgroundColor;
                    }
                    group.tl
                        .delay(5).then(flashOn).delay(5).then(flashOff)
                        .delay(5).then(flashOn).delay(5).then(flashOff)
                        .delay(5).then(flashOn).delay(5).then(flashOff)
                        .then(function () {
                            overlay.tl
                                .tween({ opacity: 1, time: 30 }, enchant.Easing.EXPO_EASEOUT)
                                .then(function () {
                                    touchArea.backgroundColor = colors[(i % colors.length)];
                                    var stage = window.assets.stages[i];
                                    app.loadLevel('playStage', { stage: stage })

                                });
                        });
                });

                group.addEventListener('touchend', function (e) {
                });

                scene.addChild(group);
                scene.addChild(overlay);
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
            roulette.width = 300;
            roulette.height = 300;
            roulette.scaleX = 1.5;
            roulette.scaleY = 1.5;
            roulette.x = 170;
            roulette.y = 300;

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

    var finishStage = new jam.Level({
        name: "finishStage",
        preload: function (context) {
            context.game.preload('img/stage_finish.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            var scene = new Scene();

            var background = new Sprite();
            background.image = game.assets['img/stage_finish.png'];
            background.width = game.width;
            background.height = game.height;

            background.addEventListener('touchstart', function () {
                background.tl
                    .fadeOut(50)
                    .then(function () {
                        app.loadLevel('ending');
                    });
            });

            scene.addChild(background);

            return { scene: scene };
        },
        unload: function (context) {

        }
    });

    var ending = new jam.Level({
        name: "ending",
        preload: function (context) {
            context.game.preload('img/ending.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            var scene = new Scene();

            var background = new Sprite();
            background.image = game.assets['img/ending.png'];
            background.width = game.width;
            background.height = game.height;

            background.addEventListener('touchstart', function () {
                background.tl
                    .fadeOut(50)
                    .then(function () {
                        app.loadLevel('top');
                    });
            });

            scene.addChild(background);

            return { scene: scene };
        },
        unload: function (context) {

        }
    });

    var timeImagePaths = [];
    var lifeImagePaths = [];

    for (var i=0; i<6; i++) {
        lifeImagePaths.push('img/life_' + i + '.png');
    }
    for (var i=0; i<9; i++) {
        timeImagePaths.push('img/time_' + i + '.png');
    }

    var gauges = new jam.Level({
        name: "gauges",
        preload: function (context) {
            lifeImagePaths.forEach(function (path) {
               context.game.preload(path);
            });
            timeImagePaths.forEach(function (path) {
                context.game.preload(path);
            });
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            var scene = new Scene();

            var lifeSprites = [];
            var timeSprites = [];

            lifeImagePaths.forEach(function (path) {
                var lifeSprite = new Sprite();
                lifeSprite.image = game.assets[path];
                lifeSprite.width = 179;
                lifeSprite.height = 334;
                lifeSprites.push(lifeSprite);
            });
            timeImagePaths.forEach(function (path) {
                var timeSprite = new Sprite();
                timeSprite.image = game.assets[path];
                timeSprite.width = 814;
                timeSprite.height = 209;
                timeSprites.push(timeSprite);
            });

            var lifeGroup = new Group();
            lifeGroup.width = game.width;
            lifeGroup.height = game.height;

            var timeGroup = new Group();
            timeGroup.width = game.width;
            timeGroup.height = game.height;

            var lifeController = new controller.GaugeController({group: lifeGroup, sprites: lifeSprites});
            var timeController = new controller.GaugeController({group: timeGroup, sprites: timeSprites});

            var elapsedFrame = 0;
            this.enterFrame = function () {
                if (elapsedFrame % 30 == 0) {
                    lifeController.setRandom();
                    timeController.setRandom();
                }
                elapsedFrame ++;
            };

            game.addEventListener('enterframe', this.enterFrame);

            scene.addChild(lifeGroup);
            scene.addChild(timeGroup);

            return { scene: scene };
        },
        unload: function (context) {
            context.game.removeEventListener(this.enterFrame);
            window.clearInterval(this.interval);
        }
    });

    var getFired = new jam.Level({
        name: "getFired",
        preload: function (context) {
            context.game.preload('img/get_fired.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            var scene = new Scene();

            var background = new Sprite();
            background.image = game.assets['img/get_fired.png'];
            background.width = game.width;
            background.height = game.height;

            var speech = new Label("お前はクビだ！");
            speech.y = 640;
            speech.width = 640;
            speech.height = 320;
            speech.textAlign = 'center';
            speech.font = "bold 60pt sans";
            speech.color = "#ff0000";

            speech.tl
                .scaleTo(8, 8)
                .scaleTo(1, 1, 6)
                .rotateBy(10, 5)
                .rotateBy(-20, 5)
                .rotateBy(10, 5);

            background.tl
                .rotateBy(20, 5)
                .rotateBy(-40, 5)
                .rotateBy(20, 5);

            background.addEventListener('touchstart', function () {
                background.tl
                    .fadeOut(200)
                    .then(function () {
                        app.loadLevel('top', {});
                    });
            });

            scene.addChild(background);
            scene.addChild(speech);

            return { scene: scene };
        },
        unload: function (context) {

        }
    });

    app.registerLevel(topLevel);
    app.registerLevel(levelTwo);
    app.registerLevel(selectStage);
    app.registerLevel(playStage);
    app.registerLevel(playRoulette);
    app.registerLevel(finishStage);
    app.registerLevel(ending);
    app.registerLevel(gauges);
    app.registerLevel(getFired);

    app.loadLevel('selectStage', { stage: window.assets.stages[0] });
};
