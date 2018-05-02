function messageFactory(sendTo,sentBy,text) {
    if(sendTo === null || sentBy === null || text === null)
    {
        return null;
    }
    if(sendTo === "" || sentBy === "" || text === "")
    {
        return null;
    }
    if(isNotFriend(sendTo,sentBy))
    {
        return null;
    }
    var message = new Object();
    message.sentTo = sendTo;
    message.sentBy = sentBy;
    message.text = text;
    return message;
}