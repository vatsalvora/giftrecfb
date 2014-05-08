<?php
header("Access-Control-Allow-Origin: *");
header("Content-type: text/json");
$username = "[USERNAME]";
$password = "[PASSWORD]";
$fid = $_GET['id'];
$url = "http://api-test.filmaster.tv/rest/1.0/film/{$fid}/similar/";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
$output = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);
echo ($output);
?>