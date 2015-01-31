$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages-stage'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

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
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    console.log('log',message);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    fire(data.message, playTime + 1000);
    console.log(data.message, playTime + 1);
    console.log('chat message',data);
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
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
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
        initCommentManager();
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


  //begin 弹幕
  var startTime = 0, iVal = -1;
  var playTime;
  function initCommentManager() {
    var CM = new CommentManager(document.getElementById('messages-stage'));
    CM.init(); // 初始化
    window.CM = CM;
    // 载入弹幕列表
    var danmakuList = [
        {
            "mode":1,
            "text":"Hello World",
            "stime":0,
            "size":25,
            "color":0xffffff
        }
    ];
    CM.load(danmakuList);

    // 插入弹幕
    var someDanmakuAObj = {
        "mode":1,
        "text":"Hello CommentCoreLibrary",
        "stime":1000,
        "size":30,
        "color":0xff0000
    };
    CM.insert(someDanmakuAObj);

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
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
  });
});
