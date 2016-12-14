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

var jQueryResource = new QE.Resource();
$(function () {
    var $codewizards = $(".codewizards-player");
    if (QE.initialized) {
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

        var $controls = $codewizards.find(".controls");

        $controls.find(".fullscreen-button").click(function () {
            QE.toggleFullScreen($codewizards[0]);
        });

        var $settings = $controls.find(".settings");
        $controls.find(".settings-button").click(function () {
            $settings.fadeToggle(200);
        });

        Settings.setupCheckbox($settings, "limitFPS", function (limitFPS) {
            QE.requestAnimationFrame = limitFPS;
        }, true);

        QE.onResourcesLoaded.push(function () {
            $codewizards.find(".loading-screen").hide();
            var $gameScreen = $codewizards.find(".game-screen");
            $gameScreen.prepend($(QE.canvas));
            $gameScreen.show();

            function hideControls() {
                $controls.animate({bottom: "-32px"}, 200);
            }

            hideControls();

            var hideControlsTimeMs = undefined;

            function showControls() {
                $controls.animate({bottom: 0}, 200);
                hideControlsTimeMs = Date.now() + Settings.HIDE_CONTROLS_DELAY_MS;
            }

            $codewizards.on("mousemove", function () {
                showControls();
            });

            QE.run(function (deltaTime) {
                player.render(deltaTime);
                if (hideControlsTimeMs !== undefined && Date.now() > hideControlsTimeMs) {
                    hideControlsTimeMs = undefined;
                    hideControls();
                }
            }, function () {
                player.updateHtml();
            });
        });
    } else {
        error(QE.failReason);
    }
    jQueryResource.confirmLoaded();
});