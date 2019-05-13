<!DOCTYPE html>
<html>

<head>
    <title>Tag Info</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
    </style>
    <body>
        <div>
            <h4>Tag ID: <?php echo $_GET['tag_id'];?></h4>
            <h4>Name: <?php echo $_GET['name']; ?></h4>
            <h4>Image: </h4>
            <img src=<?php echo $_GET['image']; ?> width="80" height="50">
        </div>
    </body>

</html>