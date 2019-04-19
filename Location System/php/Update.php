<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="http://libs.baidu.com/bootstrap/3.0.3/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="index.css">
    <script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
    <script src="http://libs.baidu.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
    <link rel=stylesheet type="text/css" href="http:\\localhost\Location System\css\head_type.css">
    <style>
        .center {
        margin: auto;
        width: 100%;
        padding: 10px;
    }

    input[type="file"] {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        border: 0;
    }

    .custom-file-upload {
        border: 1px solid #ccc;
        display: inline-block;
        padding: 6px 12px;
        cursor: pointer;
    }
    </style>
    <script type="text/javascript">
        function handleFiles(files) {
            var file = files[0];
            var src = document.getElementById('file-upload').value;
            document.getElementById('update_file').value = src;
        }

        $(document).ready(function () {
            var value = 0;
            var time = 50;
            //进度条复位函数
            function reset() {
                value = 0
                $("#prog").removeClass("progress-bar-info").css("width", "0%");
                //setTimeout(increment,5000);
            }

            function increment() {
                value += 1;
                $("#prog").css("width", value + "%").text(value + "%");
                if (value >= 0 && value < 100) {
                    $("#prog").addClass("progress-bar-info");
                }else if(value == 100){
                    return;
                }else{
                    setTimeout(reset);
                }
                st = setTimeout(increment, time);
            }

            //进度条停止与重新开始
            $("#start").click(function () {
                if ("start" == $("#start").val()) {
                    $("#start").val("clean");
                    increment();
                } else if ("clean" == $("#start").val()) {
                    $("#start").val("start");
                    clearTimeout(st);
                    setTimeout(reset);
                }
            });
            //进度条暂停与继续
            $("#stop").click(function () {
                if ("pause" == $("#stop").val()) {
                    //$("#prog").stop();
                    clearTimeout(st);
                    $("#stop").val("goon").text("Continue Update");
                } else if ("goon" == $("#stop").val()) {
                    increment();
                    $("#stop").val("pause").text("Stop Update");
                }
            });
        });
    </script>
</head>

<body>
    <div class="header">
        <label>RFID Monitoring Station</label>
    </div>
    <ul class="head-title">
        <li><a href="Position.php">Position</a></li>
        <li><a href="Device Connection.php">Device Connection</a></li>
        <li><a href="Device Setting.php">Device Setting</a></li>
        <li><a href="RF Setting.php">RF Setting</a></li>
        <li><a href="Inventory.php">Inventory</a></li>
        <li><a href="Reference.php">Reference</a></li>
        <li><a href="Advance cmd.php">Advance cmd</a></li>
        <li><a class="active" href="Update.php">Update</a></li>
        <li style="float:right"><a href="About.php">About</a></li>
    </ul>
    <div class="center">
        <h4>Update File:</h4><br>
        <input type="text" id="update_file" style="width: 100%;"><br><br>
        <div style="text-align: right;">
            <label for="file-upload" class="custom-file-upload">
                <i class="fa fa-cloud-upload"></i> ← Select Firmware
            </label><br><br>
            <input id="file-upload" type="file" accept=".bin" onchange="handleFiles(this.files)" />
        </div>
        <h4>Update Progress:</h4><br>
        <div class="progress">
            <div class="progress progress-striped active">
                <div id="prog" class="progress-bar" role="progressbar" aria-valuenow="" aria-valuemin="0" aria-valuemax="100"
                    style="width:0%;">
                    <span id="proglabel"></span>
                </div>
            </div>
        </div><br><br>
        <div class="form-group">
            <div class="col-sm-offset-4 col-sm-6">
                <button id="stop" class="btn btn-primary" value="pause">Stop Update</button>
                <button id="start" class="btn btn-primary" value="start">Update Firmware</button>
            </div>
        </div>

    </div>
    </div>
</body>

</html>