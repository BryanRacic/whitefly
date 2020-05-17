$(function() {
  // expose our socket client
  var socket = io();
  
  // handle and submit new chat messages to our server
  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    var msg = [$("#message").val(),$("#message1").val(),$("#message2").val(),$("#message3").val(),$("#message4").val(),$("#message5").val(),$("#message6").val(),$("#message7").val(),$("#message8").val(),$("#message9").val(),$("#message10").val("")];

    socket.emit("chat message", msg);

    // Reset form values //
    $("#message").val("");
    $("#message1").val("");
    $("#message2").val("");
    $("#message3").val("");
    $("#message4").val("");
    $("#message5").val("");
    $("#message6").val("");
    $("#message7").val("");
    $("#message8").val("");
    $("#message9").val("");
    $("#message10").val("");
 
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