<?php  
  header ("Content-Type:text/xml");
?>

<tasks>
<?php          
switch($_GET["action"]) {
  case "get":
    $result = parse_ini_file('db.ini');
    while (list($key, $val) = each($result)) {
      echo "<task id='".$key."' title='".$val."'/>";
    }
  break;

  case "delete":
    $result = parse_ini_file('db.ini');
    $file = fopen('db.ini', "w");
    while (list($key, $val) = each($result)) {
      if ($key != $_GET['id']) {
        fwrite($file, $key.' = "'.$val."\"\n");
      }
    }
    fclose($file);
  break;

  case "store":
    $title = ereg_replace('[^a-zA-Z0-9 ]', '', $_GET['title']); 
    $fn = 'db.ini';
    $size = filesize($fn);
    if ($size > 1024)
      $file = fopen($fn, "w");
    else
      $file = fopen($fn, "a");
    fwrite($file, "\n".$_GET['id'].' = "'.$title. "\"");
    fclose($file);
  break;
}
?>
</tasks>
