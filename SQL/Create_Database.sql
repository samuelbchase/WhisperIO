CREATE TABLE User
(
    username VARCHAR(255) PRIMARY KEY NOT NULL, #Unique Username
    password CHAR(128) NOT NULL #Hashed Password
);

CREATE TABLE Message
(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    SentFrom VARCHAR(255) NOT NULL,
    SentTo VARCHAR(255) NOT NULL,
    Message VARCHAR(1024) NOT NULL,
    timestamp DATETIME NOT NULL,
    CONSTRAINT SentTo_fk FOREIGN KEY (SentTo) REFERENCES User (username),
    CONSTRAINT SentFrom_fk FOREIGN KEY (SentFrom) REFERENCES User (username)
);