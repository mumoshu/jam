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

    // ステージ選択
    var selectStage = new jam.Level({
        name: "selectStage",
        preload: function (context) {
            // context.game.preload('img/mikoto.png');
            context.game.preload('img/stage_0.jpg');
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
                background.image = game.assets['img/stage_0.jpg']

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

    // クイズ画面
    var playStage = new jam.Level({
        name: "playStage",
        preload: function (context) {
            context.app.log(context.game);
            context.app.log('Preloading level...');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            app.log("params=", params, "context=", context);

            var scene = (function () {
                // ダミークイズデータ
                var dummies = [
                    {
                        "text": "先輩に呼ばれたときの返事で適切なのは？",
                        "choices": ['はい', 'え？', 'うん', 'なに？'],
                        "correct_choice": 'はい',
                        "correct_choice_index": 0
                    },
                    {
                        "text": "任された仕事が終わった時、正しいのは？",
                        "choices": [
                            '終わっても報告しない',
                            'さっさと次の仕事に取り組む',
                            'すぐに報告する',
                            '同僚に自慢する'
                        ],
                        "correct_choice": 'すぐに報告する',
                        "correct_choice_index": 2
                    },
                ];
                var num = 10;
                var scene = new Scene();
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

                // Entity
                var l_quiz;
                var spr_character;
                var btn_choice = {
                    list: [],
                    size: [280, 110],
                    font: '32px/48px serif',
                };
                var stage_quizzes = params.stage.quizzes;
                var quizzes;

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
                        btn_choice.list[i].text = choice;
                    });
                };
                // 画面の初期化
                var initLevel = function() {
                    // 背景色指定
                    scene.backgroundColor = '#CCCCCC';

                    // Entity生成
                    l_quiz = new Label();
                    l_quiz.backgroundColor = '#FFFFFF';
                    l_quiz.width = 420;
                    l_quiz.height = 155;
                    l_quiz.font = '32px serif';
                    l_quiz.moveTo(18, 505);

                    spr_character = new Entity();
                    spr_character.width = 420;
                    spr_character.height = 420;
                    spr_character.backgroundColor = 'blue';
                    spr_character.moveTo(18, 70);

                    btn_kobi = new Button('こび', 'light');
                    btn_kobi.width = 150;
                    btn_kobi.height = 150;
                    btn_kobi.moveTo(455, 505);

                    for ( i = 0; i < 4; i++ ) {
                        var btn = new Button('select'+i, 'light');

                        btn.index = i;
                        btn.font = btn_choice.font;
                        btn.width = btn_choice.size[0];
                        btn.height = btn_choice.size[1];
                        btn.ontouchend = function(evt) {
                            judgeChoice(evt.target.index);
                        }

                        btn.moveTo(pos_list[i][0], pos_list[i][1]);
                        btn_choice.list.push(btn);
                    }

                    // 画面への追加
                    scene.addChild(l_quiz);
                    scene.addChild(spr_character);
                    scene.addChild(btn_kobi);
                    btn_choice.list.forEach(function (btn) {
                        scene.addChild(btn);
                    });

                    quizzes = choiceQuizzes(stage_quizzes, num);
                    loadQuiz(quizzes[pointer]);
                };

                // 選択を判定
                var judgeChoice = function(index) {
                    app.log('choiced: ' + index);
                    app.log(' text: ' + quizzes[pointer].text);
                    app.log(' answer: ' + quizzes[pointer].correct_choice);
                    showJudgeResult(quizzes[pointer].correct_choice_index == index);
                };

                // 結果を表示
                var showJudgeResult = function(is_correct) {
                    var judge = is_correct ? '正解' : '不正解';
                    app.log(judge);

                    fetchNext();
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

                    app.loadLevel('selectStage', {});
                };

                // ポインタの初期化
                var pointer = 0;
                // ふぁいあー
                initLevel();
                return scene;
            })();

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

    app.registerLevel(topLevel);
    app.registerLevel(levelTwo);
    app.registerLevel(selectStage);
    app.registerLevel(playStage);
    app.registerLevel(playRoulette);

    app.loadLevel('top', { stage: window.assets.stages[0] });
};
