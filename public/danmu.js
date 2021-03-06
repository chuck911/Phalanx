$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  var startTime = 0, iVal = -1;
  var playTime;

  var socket = io();

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  function inRoom(){
      var parts = window.location.pathname.split('/')
      if(parts.length >= 3 && parts[1] == 'danmu') {
          socket.emit('in room', {room: parts[2]});
      }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', {message:message, roomTime:playTime});
    }
  }

  // Log a message
  function log (message, options) {
    console.log('log',message);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    fire(data.message, playTime + 150);
    console.log('chat message',data);
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
      } else {
        setUsername();
        inRoom();
        // initCommentManager();
        socket.emit('get messages');
      }
    }
  });

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  socket.on('messages loaded', function (messages) {
    var bullets = messages.map(function(message){
      return {
        "mode":1,
        "text":message.content,
        "stime":message.roomTime,
        "size":25,
        "color":0xffffff,
        "dur":5000
      }
    });
    initCommentManager(bullets);
  });

  //begin 弹幕
  function initCommentManager(bullets) {
    if (!bullets) bullets = [
      {
        "mode":5,
        "text":"Danmaku Engine Demo",
        "stime":2000,
        "size":25,
        "color":0xffffff,
        "dur":10000
      }
    ];
    var CM = new CommentManager(document.getElementById('messages-stage'));
    CM.init(); // 初始化
    window.CM = CM;

    CM.load(bullets);

    // 启动播放弹幕（在未启动状态下弹幕不会移动）
    CM.start();

    startTime = Date.now(); // 设定起始时间
    if(iVal >= 0){
      clearInterval(iVal); // 如果之前就有定时器，把它停掉
    }
    //建立新的定时器
    iVal = setInterval(function(){
      playTime = Date.now() - startTime; // 用起始时间和现在时间的差模拟播放
      CM.time(playTime); // 通报播放时间
      document.getElementById('time').textContent = playTime; // 显示播放时间
    }, 100); // 模拟播放器每 100ms 通报播放时间
  }

  function fire(text,time) {
    if (!CM) return;
    CM.insert({
      "mode":1,
        "text":text,
        "stime":time,
        "size":25,
        "color":0xffffff
    });
  }
  //end 弹幕

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
      prepend: true
    });
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // $('.input-wrap, .chatArea').dragmove();
});
