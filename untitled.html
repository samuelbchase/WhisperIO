socket = io();

var whisperIOUser = localStorage['whisperIOUser'] || 'defaultValue';
                        var whisperIOPassword = localStorage['whisperIOPassword'] || 'defaultValue';
                        console.log(whisperIOUser);
                        console.log(whisperIOPassword);

                        socket.emit('userNameSend', whisperIOUser);
                        console.log(whisperIOUser);

                        socket.on('chat message', function(msg){
                            console.log("Message Received!");
                            alert(msg);
                        });
                        
                        //Gets all friends from the Database as requested from Server
                        //Display them as entries in the friends list
                        $(function () {
                            socket.on('connect', function(msg) {
                                //this initializes once the clients socket is opened
                            });

                            socket.on('FriendsList', function(msg){
                                for(var k in msg) {
                                    console.log("Creating Friend Bubble for: " + msg[k].Receiver);
                                    var x = document.createElement("LI");
                                    x.id = msg[k].Receiver;
                                    x.innerHTML = msg[k].Receiver;
                                    x.className += "friend";
                                    x.onclick = function() {
                                        //Defines action for clicking on a friend in the list
                                        //Switches context to view the chatbox of that friend
                                        //& defines that friend as the active friend
                                        ActiveFriend = this.id;
                                        var ret = document.getElementsByClassName("chatbox");
                                        for (var i = 0; i < ret.length; i++) {
                                            document.getElementById(ret[i].id).style.visibility = "hidden"; //second console output
                                        }
                                        var ret2 = document.getElementsByClassName("activeFriend");
                                        for (i = 0; i < ret2.length; i++) {
                                            document.getElementById(ret2[i].id).classList.remove("activeFriend"); //second console output
                                        }
                                        this.className+=" activeFriend ";
                                        //console.log(ret);
                                        document.getElementById("chatbox" + this.id).style.visibility = "visible";
                                    };
                                    document.getElementById("friendMenu").appendChild(x);
                                }
                            });

                            socket.on('FriendsList', function(msg){
                                var first = false;
                                for(var k in msg) {
                                    //For each friend make a unique chatbox
                                    console.log("Creating Chatbox for: " + msg[k].Receiver);
                                    var x = document.createElement("div");
                                    x.style.visibility = "hidden";
                                    x.className += "chatbox cell large-11";
                                    x.id = "chatbox" + msg[k].Receiver;
                                    document.getElementById("main").appendChild(x);
                                    if(first === false)
                                    {
                                        console.log("Clicking "+ msg[k].Receiver);
                                        document.getElementById(msg[k].Receiver).click();
                                        first = false;
                                    }
                                }
                            });
                        });