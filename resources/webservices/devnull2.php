<?php
echo "Hello from the server side!<br/>Uploaded files:<ul>";
foreach ($_FILES["uploads"]["name"] as $filename) {
    echo "<li>" . $filename . "</li>";
};
echo "</ul>";
?>



