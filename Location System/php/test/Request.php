<!DOCTYPE html>
<html>
<body>
    <h2>Get data as JSON from a PHP file on the server.</h2>
    <p id="demo"></p>
    <script>
        var myObj = { 
            "items": ["1","7"], 
            "name": ["2","8"], 
            "id": ["3","9"], 
            "time": ["4","10"], 
            "alarm_status": ["5","11"], 
            "image": ["6","12"] 
        };
        var url = "http://localhost/Location%20System/js/request.js";
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                myObj = JSON.parse(this.responseText);
                document.getElementById("demo").innerHTML = myObj.name;
            }
        };
        xmlhttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send();
    </script>
</body>
</html>