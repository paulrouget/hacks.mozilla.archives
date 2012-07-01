<?php
$username = $_POST['username'];
$password = $_POST['password'];
$imageData = $_POST['image'];

$tmpfname = tempnam("cache", "img");
$file = fopen($tmpfname, "w");
fwrite( $file, base64_decode( $imageData ) );
fclose( $file);

$url = 'http://twitter.com/account/update_profile_image.json';

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "$url");
curl_setopt($curl, CURLOPT_USERPWD, "$username:$password");
curl_setopt($curl, CURLOPT_POST, 1);
curl_setopt($curl, CURLOPT_HTTPHEADER,  array('Expect:'));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 4);
curl_setopt($curl, CURLOPT_POSTFIELDS, array('image' => "@$tmpfname;type=image/png"));
curl_setopt($curl, CURLOPT_VERBOSE, 1);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
$buffer = curl_exec($curl);
curl_close($curl);
// check for success or failure
unlink($tmpfname);
?>


