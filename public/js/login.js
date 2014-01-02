/**
 * persona-facilitated login
 */
var loginbutton, logoutbutton;

function onlogin(data) {
  console.log("You have been logged in as: " + data.email);
  loginbutton.hide();
  logoutbutton.show();
}

function onlogout() {
  console.log("You have been logged out");
  logoutbutton.hide();
  loginbutton.show();
}

(function() {
  var script = document.createElement("script");
  script.onload = function() {
    // UI
    loginbutton = document.querySelector("#login");
    logoutbutton = document.querySelector("#logout");

    [loginbutton,logoutbutton].forEach(function(v) {
      v.show = function() { v.style.display = "block"; };
      v.hide = function() { v.style.display = "none"; };
    });

    // UX
    loginbutton.addEventListener("click", function() {
      navigator.id.request();
    }, false);

    logoutbutton.addEventListener("click", function() {
      navigator.id.logout();
    }, false);

    // boilerplate persona interfacing
    navigator.id.watch({
      onlogin: function(assertion) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/persona/verify", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.addEventListener("loadend", function(e) {
          var data = JSON.parse(this.responseText);
          if (data && data.status === "okay") {
            onlogin(data);
          }
        }, false);
        xhr.send(JSON.stringify({ assertion: assertion }));
      },
      onlogout: function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/persona/logout", true);
        xhr.addEventListener("loadend", function(e) {
          onlogout();
        });
        xhr.send();
      }
    });
  };
  script.src = "https://login.persona.org/include.js";
  document.head.appendChild(script);
}());
