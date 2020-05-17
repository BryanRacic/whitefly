$(function() {
  // expose our socket client
  var socket = io();
  
  // handle and submit new chat messages to our server
  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    var msg = $("#message").val();
    var msg2 = $("#message2").val();
    socket.emit("chat message", $("#message").val());
    socket.emit("chat message", $("#message2").val());
    $("#message").val("");
    $("#message2").val("");
    /// Jacob ///
    return false;
  });

  // listen for new client connections from our server
  socket.on("connect message", function(msg) {
    /* send new connection message */
    var splitMsg = msg.split("ℏ");
    //$("#messages").append($("<li>").text('new connection: ' + splitMsg[0] + "@" + splitMsg[1]).addClass("new-connection"));
    /* update this clients topic id */
    var topicId = document.getElementById("topic-id");
    topicId.innerHTML = "Topic: " + splitMsg[2];
  });
  
  // listen for client disconnections from our server
  socket.on("disconnect message", function(msg) {
    /* send new disconnection message */
    var splitMsg = msg.split("ℏ");
    $("#messages").append(
      $("<li>").text(splitMsg[0] + "@" + splitMsg[1] + ' has disconnected').addClass("disconnection"));
  });
});