<?php
require_once 'cfg.php';
/**
 * @var Q_ueryBuild connection man
 *
 */
$qb = new Q_ueryBuild();
/**
 * @var ArrayObject  state
 *
 *
 */
 $res = new ArrayObject();$app = new App();
 
 
/***
 * index of array keys
 * rl   :  role
 * q    :  username
 * c    :  userid
 * log  :  login status-> null or 2
 * state:  local state machine 
 */

if (preg_match("/.+[@].+[.].+/", filter_input(INPUT_POST, 'email'))) {
  $email = filter_input(INPUT_POST, 'email');
  $res = $app->v_email(trim($email),$qb,$res);
} else {
  $_SESSION['state'] = 0;
}


if (isset($_SESSION['state'])) {
  if (preg_match(
                  "/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"
                  . "(?=.*[!-\/|:-@|\[-\]|\{-~])/"
                  , filter_input(INPUT_POST, 'password'))
                  && $_SESSION['state'] == 1) {
    try {
      $st = $qb->transaction("select username as d, userid as c, role as r from  "
      . "Qrumb.People where useremail = :eml and userpassword = :pwd");
      $pwd = hash("sha256",filter_input(INPUT_POST, 'password'));
      $rs = NULL;
      $st->bindParam(":eml", $_SESSION['email']);
      $st->bindParam(":pwd", $pwd);
      if ($st->execute()) {
        $rs = $st->fetch(PDO::FETCH_OBJ);
        if (strlen($rs->d)>0) {
          $_SESSION['state'] = 2;
          $_SESSION['q']=$rs->d;
          $res['rl']=$rs->r;
          $_SESSION['log'] = 2;
          $_SESSION['c'] = $rs->c;
        } else{$_SESSION["state"] = 1;}
      } else {
        $_SESSION['hap'] = $st->errorInfo() . $st->queryString;
      }
    } catch (Exception $exc) {
      $_SESSION['error'] = $exc->getTraceAsString();
    }
  } else {
    $_SESSION['error'] = "passworderror";
  }
}



if (isset($_SESSION['state']) ) {
  //echo '{error:500}';
  if (preg_match(
                  "/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"
                  . "(?=.*[!-\/|:-@|\[-\]|\{-~])/"
                  , filter_input(INPUT_POST, 'pwd')) &&
                  preg_match("/.+[@].+[.].+/", 
                  filter_input(INPUT_POST, 'email'))  &&
                  preg_match("/[m|t]/", 
                  filter_input(INPUT_POST, 'role')) && $_SESSION['state'] == 0
                  ) {
    $email = trim(filter_input(INPUT_POST, 'email'));
    $role = filter_input(INPUT_POST, 'role');
    $usrname = filter_input(INPUT_POST, 'username');
    try {
      $qb = new Q_ueryBuild();
      $uid = $app->last_in($qb->db);
      $qry=$qb->insert("Qrumb.People", "userid,useremail,username,userpassword,role",
              ":uid,:uemail,:uname,:upass,:role");
      $st = $qb->transaction($qry);
      $pwd = filter_input(INPUT_POST, 'pwd');
      $pwd = hash("sha256",$pwd);
      $st->bindParam("uname", $usrname);
      $uidt = $uid[0]['c'] + 1;
      $st->bindParam("uid", ($uidt));
      $st->bindParam("upass", $pwd);
      $st->bindParam("role", $role);
      $st->bindParam("uemail", $email);
      $st->execute();
      if ($st->rowCount()>=1) {
        $res['c'] = $uidt;
        $_SESSION['state'] = 1;
        if ($res['c'] > 0) {
          $_SESSION['state'] = 2;
          $_SESSION['q'] = $usrname;
          $res['rl'] = $role;
          $_SESSION['log'] = 2;
        } 
      } else {
        $_SESSION['error'] = $st->errorInfo();
      }
    } catch (Exception $exc) {
      $_SESSION['error'] =  $exc->getTraceAsString();
    }
  } else {
    //
      $_SESSION['error'] =  "missing";
  }
}
if (isset($_SESSION['state'])){
  switch ($_SESSION['state']){
    case 0 ://unregistered user
      $res['userstatus'] = $_SESSION['state'] - 1;
      //$res['c'] = -100;
      echo json_encode($res);
      break;
    case 1://incorrect password
      $res['userstatus'] = $_SESSION['state'] - 1;
      $res['email'] = $_SESSION['email'];
      echo json_encode($res);
      break;
    case 2://verified information
      $res['userstatus'] = $_SESSION['state'] - 1;
      $res['log'] = $_SESSION['log'];
      $res['name'] = $_SESSION['q'];
      echo json_encode($res);
      break;
    default:
      $res['userstatus'] = -2;
      $res['c'] = -1;
      echo json_encode($res);
    }
}
else {
	$res['userstatus'] = -1;
	$res['c'] = -1;
	$res['error'] = "state";echo json_encode([$res,$_SESSION,  session_status()]);
	session_destroy();
}