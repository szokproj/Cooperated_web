<!DOCTYPE html>
<html>

<head>
    <title>Location System</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        nav {
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        background: #ccc;
        height: 400px;
        overflow: auto;
        border: 1px black solid;
        width: 70%;
        }
    </style>
    <script src='https://code.jquery.com/jquery-2.1.3.min.js'></script>
    <script type="text/javascript">
        function createCanvas(img, width, height) {
            var canvas = document.getElementById('canvas');
            canvas.style.background = "url(" + img + ")";
            canvas.width = width;
            canvas.height = height;
            return canvas;
        }

        function loadFile(input) {
            var file = input.files[0];
            var src = URL.createObjectURL(file);
            var img = new Image();
            img.src = src;
            img.onload = function () {
                var i_width = img.width;
                var i_height = img.height;
                var canvas = createCanvas(src, i_width, i_height);
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.save();
            };
        }

        function draw_dot(x, y) {
            //var x = document.getElementById('x').value;
            //var y = document.getElementById('y').value;
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            ctx.globalCompositeOperation = "copy";
            ctx.fillStyle = "red";
            ctx.fillRect(x, y, 10, 10);
        }

        let mouse = {
            x: 0,
            y: 0,
        }

        window.onload = function () {

            canvas.addEventListener('mousemove', (event) => {
                //在這裡把滑鼠座標寫到物件mouse中
                if (!canvas.style.background == "") {
                    mouse.x = event.pageX - 11;
                    mouse.y = event.pageY - 9;
                    document.getElementById('x').value = mouse.x;
                    document.getElementById('y').value = mouse.y;

                    $('#myform').submit(function(){
                    return false;
                    });
                    
                    $.post(		
                        $('#myform').attr('action'),
                        $('#myform :input').serializeArray(),
                        function(result){
                            draw_dot(mouse.x, mouse.y);
                        }
                    );
                }
            });
        }

        function getNowTime() {
            var date = new Date();
            //獲取日期與時間
            /*
            var hr = date.getHours();
            var min = date.getMinutes();
            var sec = date.getSeconds();
            */
            var nowDate = date.toLocaleString();
            document.getElementById('time').value = nowDate;
        }

        //重複寫入現在時間
        setInterval('getNowTime()',1000)
    </script>
    </head>

<body>
    <nav id="nav">
        <canvas id="canvas"></canvas>
    </nav>
    <div>
        <input type="file" id="file" accept="image/*" onchange="loadFile(this)"><br><br>
            <form action='insert.php' method='post' id='myform' >
                X:<input type="text" id="x" name="x" style="max-width: 50px;">
                Y:<input type="text" id="y" name="y" style="max-width: 50px;">
                time:<input type="text" id="time" name="time" style="max-width: 160px;">
                <input type='button' id='insert' name='insert' value='畫點' onclick='draw_dot();' />
            </form>
        </div>
</body>
</html>