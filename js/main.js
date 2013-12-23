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

var model = (function () {
    function Module() {}

    var model = new Module();

    model.User = (function () {
        function User() {
            this.unlockedStages = [true, true, true, true, true, true];
        }

        User.prototype.unlockStageAt = function(index) {
            this.unlockedStages[index] = true;
        }

        User.prototype.hasUnlockedStageAt = function(index) {
            return this.unlockedStages[index] || false;
        }

        return User;
    })();

    return model;
})();

window.onload = function onWindowLoaded () {
    function wrapText(context, text, x, y, maxWidth, lineHeight, rightMargin) {
        var cars = text.split("\n");

        for (var ii = 0; ii < cars.length; ii++) {

            var line = "";
            var words = cars[ii].split("");

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n];
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > maxWidth - rightMargin) {
                    context.fillText(line, x, y);
                    line = words[n];
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }

            context.fillText(line, x, y);
            y += lineHeight;
        }
    }

    enchant();

    var game = new Game(640, 960);
    game.fps = 60;
    var logger = new jam.Logger({console: console});
    var user = new model.User();
    var app = new jam.Application({game: game, logger: logger, user: user});
    var topLevel = new jam.Level({
        name: 'top',
        bgm: null,
        preload: function (context) {
            context.app.log(context.game);
            context.app.log("Preloading topLevel...");
            context.game.preload('img/top_background.png');
            context.game.preload('img/top_list_button.png');
            context.game.preload('audio/op_bgm.mp3');
            context.game.preload('audio/common_se_button.mp3');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;
            app.log("params=", params, "context=", context);

            var scene = new Scene();
            var background = new Sprite();
            background.image = game.assets['img/top_background.png'];
            background.width = game.width;
            background.height = game.height;

            var listButton = new Sprite();
            listButton.image = game.assets['img/top_list_button.png'];
            listButton.width = 637;
            listButton.height = 346;
            listButton.y = 500;

            var scene = (function () {
                listButton.tl
                    .hide()
                    .and()
                    .scaleTo(0, 0)
                    .fadeIn(50, enchant.Easing.BOUNCE_EASEOUT)
                    .and()
                    .scaleTo(1, 50, enchant.Easing.BOUNCE_EASEOUT);

                listButton.addEventListener('touchstart', function () {
                    app.log(window);

                    game.assets['audio/common_se_button.mp3'].play();
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

                game.assets['audio/op_bgm.mp3'].play();
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
            context.game.preload('img/lock.gif');
            context.game.preload('audio/op_bgm.mp3');
            context.game.preload('audio/common_se_button.mp3');
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
                touchArea.backgroundColor = touchAreaBackgroundColor;

                group.addChild(background);
                group.addChild(touchArea);
                group.addChild(charaLabel);
                group.addChild(categoryLabel);

                if (context.user.hasUnlockedStageAt(i)) {
                    group.addEventListener('touchstart', function (e) {
                        function flashOn () {
                            touchArea.backgroundColor = scene.backgroundColor;
                        }
                        function flashOff () {
                            touchArea.backgroundColor = touchAreaBackgroundColor;
                        }
                        game.assets['audio/common_se_button.mp3'].play();
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
                                        app.loadLevel('prologue', { stage: stage })

                                    });
                            });
                    });
                } else {
                    var lockSprite = new Sprite();
                    lockSprite.width = 462;
                    lockSprite.height = 281;
                    lockSprite.opacity = 0.95;
                    lockSprite.scaleX = 1 / (462.0 / w);
                    lockSprite.scaleY = 1 / (281.0 / h);
                    lockSprite.originX = 0;
                    lockSprite.originY = 0;
                    lockSprite.image = game.assets['img/lock.gif']

                    var lockGroup = new Group();
                    lockGroup.addChild(lockSprite);

                    group.addChild(lockGroup);
                }


                scene.addChild(group);
                scene.addChild(overlay);
            });

            var frameCount = 0;
            this.onEnterFrame = function () {
                game.assets['audio/op_bgm.mp3'].play();
            };
            game.addEventListener('enterframe', this.onEnterFrame);
            return { scene: scene };
        },
        unload: function (context) {
            var game = context.game;
            game.removeEventListener('enterframe', this.onEnterFrame);
            game.assets['audio/op_bgm.mp3'].stop();
            this.onEnterFrame = null;
        }
    });

    var prologue = new jam.Level({
        name: "prologue",
        preload: function (context) {
            context.game.preload('img/prologue_dialogue_box.png');
            context.game.preload('audio/common_se_button.mp3');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;
            var stage = params.stage;

            var scene = new Scene();

            var sceneBackground = new Sprite();
            sceneBackground.image = game.assets[stage.imagePath];
            sceneBackground.width = game.width;
            sceneBackground.height = game.height;

            var dialogueBoxBackground = new Sprite();
            dialogueBoxBackground.image = game.assets['img/prologue_dialogue_box.png'];
            dialogueBoxBackground.width = 428;
            dialogueBoxBackground.height = 340;
            dialogueBoxBackground.opacity = 0.9;

            var dialogueBox = new Group();
            dialogueBox.x = (game.width - dialogueBoxBackground.width) / 2;
            dialogueBox.y = 400;
            dialogueBox.width = 428;
            dialogueBox.height = 340;
            dialogueBox.scaleX = 1.0;
            dialogueBox.scaley = 1.0;

            var messageLabelPadding = 30;
            var messageLabelWidth = dialogueBox.width - (messageLabelPadding * 2);
            var messageLabelHeight = dialogueBox.height - (messageLabelPadding * 2);

            var messageLabelSurface = new Surface(messageLabelWidth, messageLabelHeight);
            messageLabelSurface.width = messageLabelWidth;
            messageLabelSurface.height = messageLabelHeight;
            messageLabelSurface.context.font = "bold 30pt sans-serif";
            messageLabelSurface.context.textBaseline = "top";

            var i = 0;
            function tick() {
                game.assets['audio/common_se_button.mp3'].play();
                if (i >= stage.prologueNarration.length) {
                    messageLabel.tl
                        .fadeOut(50)
                        .and()
                        .scaleTo(5, 5, 50)
                    dialogueBoxBackground.tl
                        .fadeOut(100)
                        .and()
                        .scaleTo(5, 5, 50);
                    sceneBackground.tl
                        .fadeOut(50)
                        .and()
                        .scaleTo(5, 5, 50)
                        .then(function () {
                            app.loadLevel('playStage', { stage: stage });
                        });

                    return;
                }
                messageLabelSurface.context.clearRect(0, 0, messageLabelWidth, messageLabelHeight);
                messageLabelSurface.context.fillStyle = "#eeeeee";
                wrapText(
                    messageLabelSurface.context,
                    stage.prologueNarration[i],
                    messageLabelPadding + 20,
                    messageLabelPadding + 20,
                    messageLabelWidth,
                    50,
                    20
                );
                messageLabel.tl
                    .moveBy(0, 2 * i, 5)
                    .moveBy(0, - 4 * i, 5)
                    .moveBy(0, 4 * i, 5)
                    .moveBy(0, - 2 * i, 5)

                i++;
            }

            var messageLabel = new Sprite();
            messageLabel.width = messageLabelWidth;
            messageLabel.height = messageLabelHeight;
            messageLabel.image = messageLabelSurface;

            dialogueBox.addChild(dialogueBoxBackground);
            dialogueBox.addChild(messageLabel);

            scene.addChild(sceneBackground);
            scene.addChild(dialogueBox);

            scene.addEventListener('touchstart', function () {
                tick();
            });

            tick();

            return { scene: scene };
        },
        unload: function (context) {
        }
    });

    var praiseImages = [
        {
            path: 'img/praise_0.png',
            width: 354,
            height: 148
        },
        {
            path: 'img/praise_1.png',
            width: 225,
            height: 237
        },
        {
            path: 'img/praise_2.png',
            width: 530,
            height: 161
        }
    ];
    
    var blameImages = [
        {
            path: 'img/blame_0.png',
            width: 106,
            height: 484
        },
        {
            path: 'img/blame_1.png',
            width: 379,
            height: 204
        }
    ];

    var lifeImagePaths = [];
    for (var i=0; i<6; i++) {
        lifeImagePaths.push('img/life_' + i + '.png');
    }

    var timeImagePaths = [];
    for (var i=0; i<9; i++) {
        timeImagePaths.push('img/time_' + i + '.png');
    }

    // クイズ画面
    var playStage = new jam.Level({
        name: "playStage",
        preload: function (context) {
            context.app.log(context.game);
            context.app.log('Preloading level...');
            context.game.preload('img/roulette_button.png');
            context.game.preload('img/roulette_button_pressed.png');
            context.game.preload('img/quiz_choice_box.png');
            context.game.preload('img/quiz_text_box.png');
            context.game.preload('img/praise_character.png');
            context.game.preload('img/blame_character.png');
            praiseImages.forEach(function (image) {
                context.game.preload(image.path);
            });
            blameImages.forEach(function (image) {
                context.game.preload(image.path);
            });
            context.game.preload('audio/quiz_bgm.mp3');
            lifeImagePaths.forEach(function (path) {
                context.game.preload(path);
            });
            timeImagePaths.forEach(function (path) {
                context.game.preload(path);
            });
        },
        load: function (context, params) {
            var app = context.app;
            app.log("params=", params, "context=", context);

            var game = context.game;
            var stage = params.stage;
            var lifePoints = params.obj && params.obj.lifePoints || 5;

            var timeKeeper = (function () {
                var timeKeeper = {};

                var trialTime = 120;
                var timeLeft = params.obj && parmas.obj.timeLeft || trialTime;
                var timePoints;

                timeKeeper.elapseTime = function (elapsedTime) {
                    timeLeft -= elapsedTime;
                    timeLeft = Math.max(timeLeft, 0);
                    timePoints = Math.max(Math.ceil(timeLeft / trialTime * (timeImagePaths.length - 1)), 0);
                };

                timeKeeper.getTimePoints = function () {
                    console.log(timePoints);
                    return timePoints;
                }

                timeKeeper.timeIsOver = function () {
                    return ! (timeLeft > 0);
                }

                timeKeeper.elapseTime(0);

                return timeKeeper;
            })();

            var num = 10;
            var pointer = 0;
            var pos_list = [
                [ 15, 720 ],
                [ 325, 720 ],
                [ 15, 840 ],
                [ 325, 840 ]
            ];
            var current = {
                quiz: null,
                index: null,
            };

            var quizzes;
            var stage_quizzes = stage.quizzes;

            var scene = new Scene();
            var sceneBackground = new Sprite();
            sceneBackground.image = game.assets[stage.imagePath];
            sceneBackground.width = game.width;
            sceneBackground.height = game.height;

            var lifeSprites = [];
            var timeSprites = [];

            lifeImagePaths.forEach(function (path) {
                var lifeSprite = new Sprite();
                lifeSprite.image = game.assets[path];
                var lifeSpriteWidth = 179;
                var lifeSpriteHeight = 334;
                lifeSprite.width = lifeSpriteWidth;
                lifeSprite.height = lifeSpriteHeight;
                lifeSprite.scaleX = 0.8;
                lifeSprite.scaleY = 0.8;
                lifeSprite.originX = 0;
                lifeSprite.originY = 0;
                lifeSprites.push(lifeSprite);
            });
            timeImagePaths.forEach(function (path) {
                var timeSprite = new Sprite();
                timeSprite.image = game.assets[path];
                var timeImageWidth = 814;
                var timeImageHeight = 209;
                timeSprite.width = timeImageWidth;
                timeSprite.height = timeImageHeight;
                timeSprite.scaleX = 0.8;
                timeSprite.scaleY = 0.8;
                timeSprite.originX = 0;
                timeSprite.originY = 0;
                timeSprites.push(timeSprite);
            });

            var lifeGroup = new Group();
            lifeGroup.x = 500;
            lifeGroup.y = 80;
            lifeGroup.width = game.width;
            lifeGroup.height = game.height;

            var timeGroup = new Group();
            timeGroup.y = - 20;
            timeGroup.width = game.width;
            timeGroup.height = game.height;

            var lifeController = new controller.GaugeController({group: lifeGroup, sprites: lifeSprites});
            var timeController = new controller.GaugeController({group: timeGroup, sprites: timeSprites});

            lifeController.setValue(lifePoints);
            timeController.setValue(timeKeeper.getTimePoints());

            this.interval = window.setInterval(function () {
                timeKeeper.elapseTime(1);
                timeController.setValue(timeKeeper.getTimePoints());
                if (timeKeeper.timeIsOver()) {
                    app.loadLevel('getFired', {});
                }
            }, 1000);

            var quizTextBoxPadding = 30;
            var quizTextBoxWidth = 640 - (quizTextBoxPadding * 2);
            var quizTextBoxHeight = 155;
            var quizTextBoxLabelPadding = 5;
            var quizTextBoxLabelRightMargin = 50;

            var l_quiz = new Label();
//            l_quiz.backgroundColor = '#FFFFFF';
            l_quiz.x = quizTextBoxPadding + quizTextBoxLabelPadding
            l_quiz.y = quizTextBoxPadding + quizTextBoxLabelPadding;
            l_quiz.width = quizTextBoxWidth - quizTextBoxPadding - quizTextBoxLabelPadding - quizTextBoxLabelRightMargin;
            l_quiz.height = quizTextBoxHeight - quizTextBoxPadding - quizTextBoxLabelPadding;
            l_quiz.font = '32px serif';

            var quizTextBox = new Group();
            quizTextBox.width = quizTextBoxWidth;
            quizTextBox.height = quizTextBoxHeight;
            quizTextBox.moveTo(18, 505);

            var quizTextBoxImageWidth = 581.0;
            var quizTextBoxImageHeight = 253.0;
            var quizTextBoxBackground = new Sprite();
            quizTextBoxBackground.image = game.assets['img/quiz_text_box.png'];
            quizTextBoxBackground.width = quizTextBoxImageWidth;
            quizTextBoxBackground.height = quizTextBoxImageHeight;
            quizTextBoxBackground.originX = 0;
            quizTextBoxBackground.originY = 0;
            quizTextBoxBackground.scaleX = 1 / (quizTextBoxImageWidth / quizTextBoxWidth);
            quizTextBoxBackground.scaleY = 1 / (quizTextBoxImageHeight / quizTextBoxHeight);

            quizTextBox.addChild(quizTextBoxBackground);
            quizTextBox.addChild(l_quiz);

            var btn_choice = {
                list: [],
                size: [280, 110],
                font: '32px/48px serif',
            };

            var rouletteButton = (function() {
                var rouletteButtonX = 460;
                var rouletteButtonY = 340;
                var rouletteButtonWidth = 120;
                var rouletteButtonHeight = 120;
                var rouletteButtonScale = 1.3;
                var rouletteButtonOpacity = 0.9;
                var playedRouletteOnce = params.obj && params.obj.playedRouletteOnce || false;

                var rouletteButton = new Group();

                rouletteButton.width = rouletteButtonWidth;
                rouletteButton.height = rouletteButtonHeight;
                rouletteButton.moveTo(rouletteButtonX, rouletteButtonY);
                rouletteButton.scaleX = rouletteButtonScale;
                rouletteButton.scaleY = rouletteButtonScale;

                var rouletteButtonSprite = new Sprite();
                rouletteButtonSprite.width = rouletteButtonWidth;
                rouletteButtonSprite.height = rouletteButtonHeight;
                rouletteButtonSprite.image = game.assets['img/roulette_button.png'];
                rouletteButtonSprite.opacity = rouletteButtonOpacity;
                rouletteButtonSprite.scaleX = rouletteButtonScale;
                rouletteButtonSprite.scaleY = rouletteButtonScale;

                var rouletteButtonPressedSprite = new Sprite();
                rouletteButtonPressedSprite.width = rouletteButtonWidth;
                rouletteButtonPressedSprite.height = rouletteButtonHeight;
                rouletteButtonPressedSprite.image = game.assets['img/roulette_button_pressed.png'];
                rouletteButtonPressedSprite.opacity = rouletteButtonOpacity;
                rouletteButtonPressedSprite.scaleX = rouletteButtonScale;
                rouletteButtonPressedSprite.scaleY = rouletteButtonScale;

                function updateRouletteButton(args) {
                    if (rouletteButton.firstNode) {
                        rouletteButton.removeChild(rouletteButton.firstChild);
                    }
                    rouletteButton.addChild(args.pressed ? rouletteButtonPressedSprite : rouletteButtonSprite);
                }

                updateRouletteButton({pressed: false});

                rouletteButton.addEventListener('touchstart', function () {
                    if (!playedRouletteOnce) {
                        updateRouletteButton({pressed: true});
                    }
                });

                rouletteButton.addEventListener('touchend', function () {
                    if (!playedRouletteOnce) {
                        updateRouletteButton({pressed: false});
                        // 現在の状況を渡す
                        app.loadLevel('playRoulette', { stage: stage, obj: { quizzes: quizzes, pointer: pointer, playedRouletteOnce: true, lifePoints: lifePoints } });
                        playedRouletteOnce = true;
                    }
                });

                if (playedRouletteOnce) {
                    updateRouletteButton({pressed: true});
                }

                return rouletteButton;
            })();

            var praiseController = (function () {
                var praiseController = {};

                var praiseSprites = [];
                praiseImages.forEach(function (image) {
                    var sprite = new Sprite();
                    sprite.image = game.assets[image.path];
                    sprite.width = image.width;
                    sprite.height = image.height;
                    praiseSprites.push(sprite);
                });

                var praiseCharacterSprite = new Sprite();
                praiseCharacterSprite.image = game.assets['img/praise_character.png'];
                praiseCharacterSprite.width = 640;
                praiseCharacterSprite.height = 960;

                var praiseBackground = new Sprite();
                praiseBackground.width = 640;
                praiseBackground.height = 960;
                praiseBackground.backgroundColor = '#eeeeee';
                praiseBackground.opacity = 0.5;

                var praiseGroup = new Group();
                praiseGroup.width = 640;
                praiseGroup.height = 960;

                praiseGroup.addChild(praiseBackground);
                praiseGroup.addChild(praiseCharacterSprite);
                praiseGroup.addChild(praiseSprites[0]);
                praiseGroup.addChild(praiseSprites[1]);
                praiseGroup.addChild(praiseSprites[2]);

                praiseBackground.tl
                    .fadeOut(0);
                praiseCharacterSprite.tl
                    .fadeOut(0);
                praiseImages.forEach(function(image, i) {
                    praiseSprites[i].tl
                        .fadeOut(0);
                });

                var currentPraiseSpriteIndex;

                function showPraise(callback) {
                    scene.addChild(praiseGroup);
                    currentPraiseSpriteIndex = Math.floor(Math.random() * praiseImages.length);
                    var delay = 30;
                    var animationTime = 5;
                    praiseBackground.tl
                        .delay(delay)
                        .fadeIn(animationTime);
                    praiseCharacterSprite.tl
                        .delay(delay)
                        .fadeIn(animationTime);
                    praiseSprites[currentPraiseSpriteIndex].tl
                        .delay(delay)
                        .fadeIn(animationTime)
                        .then(callback);
                }

                function hidePraise(callback) {
                    var animationTime = 30;
                    praiseBackground.tl
                        .fadeOut(animationTime)
                        .hide();
                    praiseCharacterSprite.tl
                        .fadeOut(animationTime)
                        .hide();
                    praiseSprites[currentPraiseSpriteIndex].tl
                        .fadeOut(animationTime)
                        .then(function () {
                            scene.removeChild(praiseGroup);
                        })
                        .hide()
                        .then(callback);
                }

                praiseController.showPraise = showPraise;
                praiseController.hidePraise = hidePraise;

                return praiseController;
            })();

            var blameController = (function () {
                var blameController = {};

                var blameSprites = [];
                blameImages.forEach(function (image) {
                    var sprite = new Sprite();
                    sprite.image = game.assets[image.path];
                    sprite.width = image.width;
                    sprite.height = image.height;
                    blameSprites.push(sprite);
                });

                var blameCharacterSprite = new Sprite();
                blameCharacterSprite.image = game.assets['img/blame_character.png'];
                blameCharacterSprite.width = 640;
                blameCharacterSprite.height = 960;

                var blameBackground = new Sprite();
                blameBackground.width = 640;
                blameBackground.height = 960;
                blameBackground.backgroundColor = '#eeeeee';
                blameBackground.opacity = 0.5;

                var blameGroup = new Group();
                blameGroup.width = 640;
                blameGroup.height = 960;

                blameGroup.addChild(blameBackground);
                blameGroup.addChild(blameCharacterSprite);
                blameGroup.addChild(blameSprites[0]);
                blameGroup.addChild(blameSprites[1]);

                blameBackground.tl
                    .fadeOut(0);
                blameCharacterSprite.tl
                    .fadeOut(0);
                blameImages.forEach(function(image, i) {
                    blameSprites[i].tl
                        .fadeOut(0);
                });

                var currentblameSpriteIndex;

                function showBlame(callback) {
                    scene.addChild(blameGroup);
                    currentblameSpriteIndex = Math.floor(Math.random() * blameImages.length);
                    var delay = 30;
                    var animationTime = 5;
                    blameBackground.tl
                        .delay(delay)
                        .fadeIn(animationTime);
                    blameCharacterSprite.tl
                        .delay(delay)
                        .fadeIn(animationTime);
                    blameSprites[currentblameSpriteIndex].tl
                        .delay(delay)
                        .fadeIn(animationTime)
                        .then(callback);
                }

                function hideBlame(callback) {
                    var animationTime = 30;
                    blameBackground.tl
                        .fadeOut(animationTime)
                        .hide();
                    blameCharacterSprite.tl
                        .fadeOut(animationTime)
                        .hide();
                    blameSprites[currentblameSpriteIndex].tl
                        .fadeOut(animationTime)
                        .then(function () {
                            scene.removeChild(blameGroup);
                        })
                        .hide()
                        .then(callback);
                }

                blameController.showBlame = showBlame;
                blameController.hideBlame = hideBlame;

                return blameController;
            })();

            // クイズデータを無作為に作成
            var choiceQuizzes = function (quizzes, num) {
               if (quizzes.length < num) {
                   return quizzes;
               }
               var c_quizzes = [];
               var history = [];
               var cnt = quizzes.length;
               var rnd;

               for (i = 0; i < num; ) {
                   rnd = Math.random() * cnt | 0;

                   if (history.indexOf(rnd) > -1) {
                       continue;
                   }

                   c_quizzes.push(quizzes[rnd]);
                   history.push(rnd);
                   i++;
               }

               return c_quizzes;
            };

            // クイズの読み込み
            var loadQuiz = function(quiz) {
                l_quiz.text = quiz.text;
                quiz.choices.forEach(function(choice, i) {
                    btn_choice.list[i].label.text = choice;
                });
            };

            // 選択を判定
            var judgeChoice = function(index) {
                app.log('text: ' + quizzes[pointer].text);
                app.log(' index: ' + index);
                app.log(' choice: ' + quizzes[pointer].choices[index]);
                app.log(' answer: ' + quizzes[pointer].correct_choice);
                showJudgeResult(quizzes[pointer].correct_choice_index == index);
            };

            // 結果を表示
            var showJudgeResult = function(is_correct) {
                var judge = is_correct ? '正解' : '不正解';

                if (!is_correct) {
                    lifePoints --;

                    lifeController.setValue(lifePoints);

                    if (lifePoints < 1) {
                        app.loadLevel('getFired', { stage: stage });
                    }
                }

                if (is_correct) {
                    praiseController.showPraise(function () {
                        praiseController.hidePraise(function () {
                            fetchNext();
                        })
                    });
                } else {
                    blameController.showBlame(function () {
                        blameController.hideBlame(function () {
                            fetchNext();
                        })
                    });
                }
            };

            // 次を取得
            var fetchNext = function() {
                pointer++;
                app.log(pointer);
                app.log(quizzes.length);

                // 次はあるか
                if (pointer < quizzes.length) {
                    loadQuiz(quizzes[pointer]);
                    return ;
                }

                app.loadLevel('finishStage', { stage: stage });
            };

            var scene = (function () {
                for ( i = 0; i < 4; i++ ) {
                    var btn = (function () {
                        var width = btn_choice.size[0];
                        var height = btn_choice.size[1];
                        var padding = 20;

                        var btn = new Group();

                        btn.index = i;
                        btn.width = width;
                        btn.height = height;
                        btn.addEventListener('touchend', function(evt) {
                            judgeChoice(evt.target.index);
                        });

                        var imageWidth = 652.0;
                        var imageHeight = 314.0;
                        var fixScale = 1.1;
                        var sprite = new Sprite();
                        sprite.width = imageWidth;
                        sprite.height = imageHeight;
                        sprite.scaleX = 1 / (imageWidth / width) * fixScale;
                        sprite.scaleY = 1 / (imageHeight / height) * fixScale;
                        sprite.originX = 0;
                        sprite.originY = 0;
                        sprite.image = game.assets['img/quiz_choice_box.png'];

                        var label = new Label();
                        label.x = padding;
                        label.y = padding;
                        label.width = width;
                        label.height = height;
                        label.font = btn_choice.font;

                        btn.label = label;

                        btn.addChild(sprite);
                        btn.addChild(label);

                        btn.moveTo(pos_list[i][0], pos_list[i][1]);

                        return btn;
                    })();
                    btn_choice.list.push(btn);
                }

                scene.addChild(sceneBackground);
                scene.addChild(quizTextBox);
                scene.addChild(rouletteButton);

                btn_choice.list.forEach(function (btn) {
                    scene.addChild(btn);
                });

                scene.addChild(lifeGroup);
                scene.addChild(timeGroup);

                return scene;
            })();

            if (params.fromRoulette) {
                quizzes = params.obj.quizzes;
                pointer = params.obj.pointer;
            } else {
                quizzes = choiceQuizzes(stage_quizzes, num);
            }

            loadQuiz(quizzes[pointer]);
            game.assets['audio/quiz_bgm.mp3'].play();
            return { scene: scene };
        },
        unload: function (context) {
            game.assets['audio/quiz_bgm.mp3'].stop();
            window.clearInterval(this.interval);
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
                        app.loadLevel('playStage', { stage: stage, obj: params.obj, fromRoulette: true, lifePoints: params.obj.lifePoints + earnedLifePoints });
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
            context.game.preload('img/conglaturations.png');
            context.game.preload('img/ending_dialogue_box.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            var scene = new Scene();

            var dialogueBoxWidth = 407;
            var dialogueBoxHeight = 327;

            var messageLabelWidth = 407;
            var messageLabelHeight = 327;
            var messageLabelPadding = 20;

            var background = new Sprite();
            background.image = game.assets['img/conglaturations.png'];
            background.width = game.width;
            background.height = game.height;

            var messageLabelSurface = new Surface(messageLabelWidth, messageLabelHeight);
            messageLabelSurface.width = messageLabelWidth;
            messageLabelSurface.height = messageLabelHeight;
            messageLabelSurface.context.font = "bold 30pt sans-serif";
            messageLabelSurface.context.textBaseline = "top";

            var narration = window.assets.narration.ending;
            var i = 0;
            function tick() {
                if (i >= narration.length) {
                    messageLabel.tl
                        .fadeOut(50);
                    dialogueBoxBackground.tl
                        .fadeOut(50);
                    background.tl
                        .fadeOut(50)
                        .then(function () {
                            app.loadLevel('top', {});
                        });

                    return;
                }
                messageLabelSurface.context.clearRect(0, 0, messageLabelWidth, messageLabelHeight);
                messageLabelSurface.context.fillStyle = "#eeeeee";
                wrapText(
                    messageLabelSurface.context,
                    narration[i],
                    messageLabelPadding + 20,
                    messageLabelPadding + 20,
                    messageLabelWidth,
                    50,
                    50
                );
                messageLabel.tl
                    .moveBy(0, 2 * i, 5)
                    .moveBy(0, - 4 * i, 5)
                    .moveBy(0, 4 * i, 5)
                    .moveBy(0, - 2 * i, 5)

                i++;
            }

            var messageLabel = new Sprite();
            messageLabel.width = messageLabelWidth;
            messageLabel.height = messageLabelHeight;
            messageLabel.image = messageLabelSurface;

            var dialogueBoxBackground = new Sprite();
            dialogueBoxBackground.width = dialogueBoxWidth;
            dialogueBoxBackground.height = dialogueBoxHeight;
            dialogueBoxBackground.image = game.assets['img/ending_dialogue_box.png'];

            var dialogueBox = new Group();
            dialogueBox.x = Math.floor((game.width - dialogueBoxWidth) / 2);
            dialogueBox.y = 590;
            dialogueBox.width = dialogueBoxWidth;
            dialogueBox.height = dialogueBoxHeight;
            dialogueBox.addChild(dialogueBoxBackground);
            dialogueBox.addChild(messageLabel);

            scene.addEventListener('touchstart', function () {
                tick();
            });

            scene.addChild(background);
            scene.addChild(dialogueBox);

            tick();

            return { scene: scene };
        },
        unload: function (context) {

        }
    });

    var getFired = new jam.Level({
        name: "getFired",
        preload: function (context) {
            context.game.preload('img/get_fired.png');
            context.game.preload('img/get_fired_background.png');
            context.game.preload('audio/game_over_se.mp3');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            var scene = new Scene();

            var background = new Sprite();
            background.image = game.assets['img/get_fired_background.png'];
            background.width = game.width;
            background.height = game.height;

            var speech = new Sprite();
            speech.x = 170;
            speech.y = 250;
            speech.width = 304;
            speech.height = 450;
            speech.scaleX = 2.5;
            speech.scaleY = 2.5;
            speech.opacity = 1.0;
            speech.image = game.assets['img/get_fired.png'];

            speech.tl
                .hide()
                .delay(60)
                .show()
                .scaleTo(8, 8)
                .scaleTo(2.1, 2.1, 6)
                .rotateBy(10, 5)
                .rotateBy(-20, 5)
                .rotateBy(10, 5);

            background.tl
                .delay(60)
                .rotateBy(20, 5)
                .rotateBy(-40, 5)
                .rotateBy(20, 5);

            speech.addEventListener('touchstart', function () {
                background.tl
                    .fadeOut(200)
                    .then(function () {
                        app.loadLevel('top', {});
                    });
            });

            scene.addChild(background);
            scene.addChild(speech);

            game.assets['audio/game_over_se.mp3'].play();

            return { scene: scene };
        },
        unload: function (context) {
            game.assets['audio/game_over_se.mp3'].play();
        }
    });

    app.registerLevel(topLevel);
    app.registerLevel(selectStage);
    app.registerLevel(prologue);
    app.registerLevel(playStage);
    app.registerLevel(playRoulette);
    app.registerLevel(finishStage);
    app.registerLevel(ending);
    app.registerLevel(getFired);

    app.loadLevel('top', { stage: window.assets.stages[0] });
};
