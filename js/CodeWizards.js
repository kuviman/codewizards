function error(reasonList) {
    QE.cancelFullscreen();
    var $codewizards = $(".codewizards-player");
    $codewizards.find(".loading-screen").hide();
    $codewizards.find(".game-screen").hide();
    var $failedScreen = $codewizards.find(".failed-screen");
    reasonList.forEach(function (reason) {
        $failedScreen.append($("<p></p>").html(reason));
    });
    $failedScreen.show();
}

function loadResources() {
    function loadAnotherResource() {
        var resource = new QE.Resource();
        var interval = setInterval(function () {
            resource.progress += 1;
            if (resource.progress >= 1) {
                resource.confirmLoaded();
                clearInterval(interval);
            }
        }, 0);
    }

    for (var i = 0; i < 1; i++) {
        loadAnotherResource();
    }
}

$(function () {
    var $codewizards = $(".codewizards-player");
    if (QE.initialized) {
        loadResources();
        var $progressBar = $codewizards.find(".resource-loading-progress-bar");
        var $progress = $codewizards.find(".resource-loading-progress");
        QE.onResourceProgress = function (progress) {
            progress = progress * 100;
            $progressBar.width(progress + "%");
            $progress.text(Math.round(progress).toString());
        };

        var player = new Player();

        function reconnect() {
            var token = $(".codewizards-game-token").text();
            var url = "http://russianaicup.ru/boombox/data/games/" + token;
            // var url = "boombox/" + token;
            player.connect(url);
        }

        reconnect();
        $(".codewizards-token-form").submit(function () {
            var $input = $(".codewizards-token-form input[name=gameToken]");
            if ($input.val().length != 0) {
                $(".codewizards-game-token").text($input.val());
                $input.val("");
                reconnect();
            }
            return false;
        });

        QE.onResourcesLoaded = function () {
            $codewizards.find(".loading-screen").hide();
            var $gameScreen = $codewizards.find(".game-screen");
            $gameScreen.prepend(QE.$canvas);
            $gameScreen.show();
            QE.run(function (deltaTime) {
                player.render(deltaTime);
            });
        };

        $codewizards.find(".fullscreen-button").click(function () {
            QE.toggleFullScreen($codewizards[0]);
        });

        var $settings = $codewizards.find(".settings");
        $codewizards.find(".settings-button").click(function () {
            $settings.toggle();
        });

        Settings.setupCheckbox($settings, "limitFPS", function (limitFPS) {
            QE.requestAnimationFrame = limitFPS;
        }, true);
    } else {
        error(QE.failReason);
    }
});