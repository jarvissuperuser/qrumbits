<?php
require_once 'cfg.php';

if (session_status() == PHP_SESSION_ACTIVE){
  if ($_SESSION['log'] == 2){
    $w = new UILoad();
    echo json_encode(['proj'=>$w->getProject(),'templates'=>$w->getTemplate(),$_SESSION["error"]]);
  }
}