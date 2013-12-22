window.onload = function onWindowLoaded () {
    enchant();

    var game = new Game(640, 960);
    game.fps = 15;
    var logger = new jam.Logger({console: console});
    var app = new jam.Application({game: game, logger: logger});

    // クイズ画面
    var levelQuiz = new jam.Level({
        name: 'quiz_template',
        preload: function (context) {
            context.app.log(context.game);
            context.app.log('Preloading level...');
            context.game.preload('img/mikoto.png');
        },
        load: function (context, params) {
            var game = context.game;
            var app = context.app;

            app.log("params=", params, "context=", context);

            var scene = (function () {

                var btn_choice0 = new Button('ほげ', 'light');
                btn_choice0.font = '28px/12px';

/*                var label1 = new Label('ああ' + jam.guid());
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
                    //app.loadLevel('two', {foo:"bar"});
                });
                sprite.addEventListener('touchend', function () {
                });
*/
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

                scene.addChild(btn_choice0);

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
    app.registerLevel(levelQuiz);
    // クイズデータ（ダミー）
    var quizzes = [
        { "text": "先輩に呼ばれたときの返事で適切なのは？",
            "choices": ['はい', 'え？', 'うん', 'なに？'],
            "correct_choice": 'はい',
            "correct_choice_index": 0 },
        { "text": "任された仕事が終わった時、正しいのは？",
            "choices": ['終わっても報告しない', 'さっさと次の仕事に取り組む', 'すぐに報告する', '同僚に自慢する'],
            "correct_choice": 'すぐに報告する',
            "correct_choice_index": 2 },
    ];
    app.loadLevel('quiz_template', { test: 1, name: '先輩', quizzes: quizzes });
};
