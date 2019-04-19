<?php
$myObj = new \stdClass();
$myObj->items = array("1", "2", "3");
$myObj->name = array("4", "5", "6");
$myObj->id = array("7", "8", "9");
$myObj->time = array("7", "8", "9");
$myObj->alarm_status = array("7", "8", "9");
$myObj->image = array("7", "8", "9");
$myJSON = json_encode($myObj);

echo $myJSON;
?>