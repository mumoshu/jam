window.onload = function () {
    var game = new Game (GameWindow.width, GameWindow.height);

    game.onload = function () {
        // write prosess to here.
        
       var scene = game.rootScene;
       scene.backgroundColor = '#000000';
    };

    game.start();
}
