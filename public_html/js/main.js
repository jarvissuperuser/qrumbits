/**
 * @description Created on : 18-04-2017
 * app UILoad Q_ueryBuild implemented to Suppress Errors Dev-Time
 * */
//var app = app || {};
//var UILoad = UILoad || {};
//var Q_ueryBuild = Q_ueryBuild || {};
var lg = false;
var qb = app.qb;
var db = qb.db;
var co = 2;
var res = "";
var usr = localStorage.getItem('usr') || 0;
var c = localStorage.getItem('c') || 0;
var trs = [0, 0, 0];
$('[data-toggle="tooltip"]').tooltip();
UILoad.pid = localStorage.getItem('pid') || -100;
//console.log(pid);
//if (pid == -100) {
function sign_in() {
  var t = $('#signemail');
  if (t.val().trim() === "") {//changed from == to ===

    message("cant be empty", $('#signemail'));
  } else {
    lg = true;
    v_email();
  }
}

if (window.hasOwnProperty('openDatabase')) {


  function message(msg, t) {
    //alert(msg);
    t = $(t);
    //$('[data-toggle="tooltip"]').tooltip();
    t.tooltip("destroy");
    t.prop("title", msg);
    t.tooltip("show");
    //}else{
    //alert(msg);
    //}
  }
  function v_email() {//testemail
    var email1 =
            $('#signemail').val();//input box value
    var pass = $("#signpass").val();
    var tst = /.+[@].+[\.].+/; //create regex
    if (tst.test(email1))
    {
      $.post("php/data_verify.php",
              {email: email1, password: pass}, function (response) {
        if (response.userstatus === 1) {
          localStorage.setItem('usr', response.c);
          UILoad.pid = localStorage.pid;
          localStorage.setItem('rl', response.rl);
          loda();
          $("#nm").text(response.name.toUpperCase());
          app.app();
        } else if (response.userstatus === -1) {
          rg(email1);
        } else {
          if (localStorage.count === undefined ||
                  parseInt(localStorage.getItem("count")) < 3) {
            message('invalid password', $('#signpass'));
            localStorage.setItem("count",
                    parseInt(localStorage.getItem("count")) + 1 || 0);
          } else
            message('email sent to reset password', $('#signpass'));
        }
      }
      , 'JSON');//AJAX post (JQUERY Function)
    } else if (!tst.test(email1)) {
      message('invalid email', $('#signemail'));
    } else {

    }
  }
  function verify() {//password test
    var tgt = $("#signpass");
    var tgt1 = $("#pass").val();
    var tgt2 = $("#conpass").val();
    var pwd = tgt.val();
    var tst = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\u0020-\u002F|\u003A-\u0040|\u005B-\u0060|\u007B-\u007E])/;
    if (tst.test(pwd)) {
      if (trs[0] === 0)
        $("#signpass").tooltip("destroy");
      trs[0] = 1;
    } else if (pwd.length < 8)
      message("Password too short", $("#signpass"));
    if (tgt1.length < 8) {
      message("weak password", $("#pass"));
      //$()
    } else if (tst.test(tgt1)) {
      if (trs[1] === 0)
        $("#pass").tooltip("destroy");
      trs[1] = 1;
    } else if (!tst.test(tgt1)) {
      trs[1] = 0;
    }
    if (tgt1 == tgt2 && trs[1] == 1) {
      if (trs[2] === 0)
        $("#conpass").tooltip("destroy");
      trs[2] = 1;
      console.log("passmatch");
      message("Okay", $("#conpass"));
    } else {
      message("Password does match", $("#conpass"));
      trs[2] = 0;
    }
    if (trs[2] === 1)
      $("#reg").prop("disabled", false);
  }
  function rg(email1) {
    var targ = $("#rg");
    targ.removeClass("hidden");
    $("#email").val(email1);
    var test = /@.+/;
    $('#username').val(email1.replace(test, ""));
    $("#lg").addClass("hidden");
    message("Message : email is not registered " +
            "please fill the information below", targ);
  }
  function sendR() {//register call
    var eml = $("#email").val().trim();
    var usrn = $("#username").val().trim();
    var pswd = $("#pass").val().trim();
    var rl = $("#rrole").val().trim();
    $.post("php/data_verify.php"
            , {email: eml, pwd: pswd, role: rl, username: usrn},
            function (respo) {
              var resp = JSON.parse(respo);
              console.log(resp);
              if (resp.userstatus === 1) {//needs improving
                console.log("attempt to load");
                localStorage.setItem("usr", resp.c);
                localStorage.setItem("pid", 0);
                localStorage.setItem('rl', resp.rl);
                loda();
                $("#nm").text(resp.name.toUpperCase());
                app.app();
              } else {
                console.log(resp);
                if (resp.userstatus === 0 && resp.c > 0)
                  window.location = '.';
              }
            }
    , "TEXT");
  }

  $(document).ready(function () {
    qb.init();
    db.transaction(function (tx) {
      var qry = qb.slct('count(*) as c', 'taskbars');
      tx.executeSql(qry, [], function (tx, rs) {
        if (rs.rows.length > 0)
          c = rs.rows.item(0).c;
        localStorage.setItem('c', c);
        if (c == 0 || c == undefined) {
          db.transaction(function (tx) {
            tx.executeSql(qb.insert("taskbars",
                    ['tid', 'pid', 'tname', 'pos'],
                    [1, 1, '"' + 'todo' + '"', 0]));
            tx.executeSql(qb.insert("taskbars",
                    ['tid', 'pid', 'tname', 'pos'],
                    [2, 1, '"' + 'in-progress' + '"', 1]));
            tx.executeSql(qb.insert("taskbars",
                    ['tid', 'pid', 'tname', 'pos'],
                    [3, 1, '"' + 'done' + '"', 2]));
          }, function (err) {
            console.log(err);
          });
        }
      });
    }, function (err) {
      console.log(err);
    });
    $("#lvl").click(function () {
      if (UILoad.pid > 0)
        localStorage.setItem("pid", 0);
      else
        lg0();
      //window.location = '.';
    }).submit();

    $.post("php/get_data.php",
            {1: '1'},
            function (resp) {
              if (resp.hasOwnProperty('c') && resp.c !== null) {
                if (resp.userstatus === 1)
                  localStorage.setItem('usr', resp.c);
                if (usr > 0) {
                  //localStorage.pid = 0;//reset to landing
                  console.log("Setting Up", localStorage);
                  localStorage.setItem('rl', resp.rl);
                  loda();
                  $("#nm").text(resp.name.toUpperCase());
                  setTimeout(function () {
                    app.app();
                  }, app.qt);
                }
              } else {
                localStorage.setItem("usr", 0);
              }
            }
    , "JSON");
  });//setup


  function projSelected(ts) {
    //alert('proj id='+($(ts).attr('id').split('_')[1] -1));
    UILoad.pid = ($(ts).attr('id').split('_')[1]);
    localStorage.setItem("pid", UILoad.pid);
    viewToggle();
    app.app();
  }

  function viewToggle() {
    if (UILoad.pid == 0) {
      $('#proj').hide();
      $('#landing').show();
      $("title").text("Landing");
      //console.log("land view");
    } else {
      $('#proj').show();
      $('#landing').hide();
      $("title").text("Project");
      //console.log("proj view");
    }
  }

  function loda() {
    UILoad.pid = localStorage.pid;
    usr = localStorage.usr;
    $("#Login").remove();
    if (localStorage.getItem('rl') === 'm')
      $('#role').append($('<option>', {
        value: 'm',
        text: 'Manager'
      }));
    $("#landing").removeClass('hidden');
    $("title").text("Landing");
    $("#ct_3t").hide();
    $("#ct_4t").hide();
    $("#ct_5t").hide();
    $("#nvb").removeClass('hidden');
  }

  function proj() {
    //alert('proj id='+($(ts).attr('id').split('_')[1] -1));
    if ($('#role').val() === 't')
      $('#mnu').modal('show');
    if ($('#role').val() === 'm')
      $('#ctemp').modal('show');
  }
  function create() {
    var name;
    setTimeout(function () {
      if ((name = prompt("Project Name", "please enter Projects name"))) {
        app.prototype = 1;
        app.createProj(name, usr, 1);
        setTimeout(function () {
          app.read();
        }, app.qt);
      }
    }, app.qt);
  }

  function ctp() {
    $('#mnu').modal("hide");
    $('#tml').modal("show");
  }

  function ctpr(th)//create Template
  {
    message(" to be implemented", th);
    co = 2;
    $("#ct_3t").hide();
    $("#ct_4t").hide();
    $("#ct_5t").hide();
  }

  function atsb(th)//add column
  {
    //message(" to be implemented",th);
    switch (co)
    {
      case 5:
        message('max allowed', th);
        break;
      case 4:
        $('#ct_5t').show();
        co++;
        break;
      case 3:
        $('#ct_4t').show();
        co++;
        break;
      case 2:
        $('#ct_3t').show();
        co++;
        break;
      default :
        message('Fatal Error', th);
    }

  }

  function cc(which) {
    var crd = 0;
    var q = qb.slct("cid as c", 'cards',
            "cid  = cid order by cid desc limit 1");

    db.transaction(function (tx) {
      tx.executeSql(q, [], function (tx, rs) {
        try {
          if (rs.rows.length > 0)
            crd = rs.rows.item(0).c + 1;
          else
            crd = 1;
          var parent = ($(which).parent().parent());
          console.log(parent);
          var name;
          if ((name = prompt("Create New Task"))) {
            var l = gtid(which);
            app.createCard(name, l, parent, crd);
          }
        } catch (ex) {
          console.log(ex);
          alert("Catastrophic Error Reloading");
          window.location = ".";
        }
      });
    }, function (err) {
      console.log(err);
    });



    setTimeout(function () {

    }, app.qt);//needs testing // working *i3 4th gen chrome 1.7ghz
  }
  ;
  function typ(ths) {
    //console.log($(ths).val());
    app.editCard($(ths).attr('id').toString().split('_')[3],
            'cdesc', $(ths).val());
  }
  function allowDrop(ev) {
    ev.preventDefault();
  }
  function preventDrop(ev) {
    ev.preventDefault();
  }
  function drag(ev) {
    //console.log(ev.target.id);
    co = ev.srcElement.id;
    //console.log(co);
  }
  function drop(ev) {
    ev.preventDefault();

    //console.log(app.cards);
    if (match(ev.srcElement.id)) {
      $(ev.target).append($('#' + co));
      qb.transaction(qb.update('cards'
              , "tid = '" + ev.srcElement.id.split('_')[2] + "'"
              , 'cid', '"' + co.split('_')[3] + '"'));
      console.log(qb.update('cards'
              , "tid = '" + ev.srcElement.id.split('_')[2] + "'"
              , 'cid', '"' + co.split('_')[3] + '"'));
    }
  }
  function gtid(ths) {//get parent
    var parent = ($(ths).parent());
    while (!match(parent.attr('id')))
      parent = parent.parent();
    var tid = $(parent).attr("id");
    console.log(tid);
    var spl = tid.split("_");
    return (spl);
  }
  function adv(ths) {
    var spl = gtid(ths);
    $('#' + app.colNames[spl[2] % app.colNames.length])
            .append($(ths).parent());
    console.log(app.colNames,app.colNames[spl[2] % app.colNames.length],$(ths).parent().attr('id').toString().split('_')[3]);
    app.editCard($(ths).parent().attr('id').toString().split('_')[3],
            'tid', ((spl[2] % app.colNames.length) + 1));

    $('#tid_' + spl[1] + '_' + (spl[2])).remove($(ths).parent());
    console.log(spl);

  }
  function match(pnt) {
    for (var a = 0; a < app.colNames.length; a++)
      if (pnt === app.colNames[a])
        return true;
    return false;
  }
  function pid0() {
    //console.log('pid0');

    //window.location = '.';
    // console.log('done');
  }
  function lg0() {
    //pid0();
    UILoad.tsb = null;
    //app.delete();//wait ntil sync implementation the implement this
    $.post("php/logout.php", {}, function () {}, "HTML");
  }
} else {
  if (!window.hasOwnProperty('openDatabase'))
    $('#proj').append("<h1 class='jumbotron'>SO SAD! You Need Safari or \
                                  Google Chome \
                               or Opera Or Chromium web Browser </h1>");
}