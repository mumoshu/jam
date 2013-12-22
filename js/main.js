window.onload = function onWindowLoaded () {
    enchant();
    
    // Enchant.jsのGameです。これをjam.Applicationでラップします。
    var game = new Game(320, 320);
    game.fps = 15;
    
    var logger = new jam.Logger({console: console});
    
    // jam.Applicationは、Enchant.jsのGameをラップして、「レベル」という概念を提供します。
    //
    // レベルは開発の分担しやすくし、またシーン間を疎結合にするための概念です。
    //
    // レベルは「Enchant.jsのシーン + シーンのプリロード・ロード・アンロードのロジック」です。
    // 開発者がレベル単位で開発を分担することで、お互いのレベルに影響を与えず独立して開発を進めることができます。
    // また、シーン間を疎結合にすることで、各シーンがいつのまにかお互いの状態に依存していた、という状況を防ぐことができます。
    // こういう状況になると、シーンの順番を入れ替えたり、
    // 最終的なゲームとして組み上げただけでシーンが動かなくなってしまいがちです。
    // レベルに分けることで、こういった問題を防ぐことができます。
    var app = new jam.Application({game: game, logger: logger});
        
    // 各レベルはnew jam.Level({ プロパティ: 値 })の形式で初期化します。
    // 必須プロパティはname・load・unloadです。任意のプロパティはpreloadです。
    // それぞれ、下記コードを参考にしてください。
    var topLevel = new jam.Level({
        name: 'top',
        // 規約: そのレベルに必要なGame#preloadは、preload関数内でまとめて呼びます。
        // すると、フレームワークがGame#start前に全Levelのpreloadを呼んでくれます。
        // もう複数シーンで使うpreloadをまとめて呼ぶ必要はありませんね！
        preload: function (context) {
            context.app.log("Preloading topLevel...");
            context.game.preload('http://jsrun.it/assets/l/4/0/X/l40Xg.png');
        },
        // 規約: そのレベルのシーンはload関数内で作成します
        // すると、フレームワークはそのレベルが始まるときに自動的にloadを呼んでくれます。
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
            
            // 規約: loadとunloadは対になるようにします。これは、次のレベルに影響を残さないためです。
            // 例えば、このようにLevel#loadでgameのenterframeにリスナを追加した場合は…(upload関数の説明へ飛んでください↓↓)
            var frameCount = 0;
            this.onEnterFrame = function () {
                frameCount ++;
                
                if (frameCount % 100 == 0) {
                    context.app.log(frameCount + " frames has passed until now.");
                }
            };
            game.addEventListener('enterframe', this.onEnterFrame);
            
            // 規約: load関数はロードしたシーンをObjectにつめて返します。キーは"scene"にします。
            // 単にreturn sceneにしないのが、今後の拡張性を考慮してのことです。
            return { scene: scene };
        },
        unload: function (context) {
            // このようにLevel#unloadでgameのenterframeリスナを削除してやります。
            // 追加したリスナを削除してやらないと、次のレベルの裏で正しくUnloadされていない前のレベルが動いてしまってバグの元になります。
            var game = context.game;
            game.removeEventListener('enterframe', this.onEnterFrame);
            this.onEnterFrame = null;
        }
    });
    
    var levelTwo = new jam.Level({
        name: "two",
        load: function (context, params) {
            var scene = new Scene();
            
            // ラベル置いておきますね
            var label = new Label("Level 2: params=" + params);
            label.x = 32;
            label.y = 32;
            
            // ボール置いておきますね
            var ball = new Sprite(50, 50);
            // HTML5 Canvas使いたいときは、Enchant.jsのSurface経由で使いますよ
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
    // top以外の画面をデバッグしたいときは、以下のように最初にloadLevelするレベルを変更すればよい
    //app.loadLevel('two', { test: 1 });
};
