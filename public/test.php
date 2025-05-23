<?php
// $command = escapeshellcmd('python3 py_scripts/as400.py'); // OK
// $command = escapeshellcmd('./py_scripts/test.py'); // OK
$command = escapeshellcmd('python3 py_scripts/test.py'); // OK

// var_dump($command);
$output = shell_exec($command);
// var_dump($output);
echo $output;
// return $output;
