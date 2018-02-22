CREATE TABLE IF NOT EXISTS User
(
    username VARCHAR(255) PRIMARY KEY NOT NULL,
    password CHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS Message
(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    SentFrom VARCHAR(255) NOT NULL,
    SentTo VARCHAR(255) NOT NULL,
    Message VARCHAR(1024) NOT NULL,
    timestamp DATETIME NOT NULL,
    CONSTRAINT SentTo_fk FOREIGN KEY (SentTo) REFERENCES User (username),
    CONSTRAINT SentFrom_fk FOREIGN KEY (SentFrom) REFERENCES User (username)
);

CREATE TABLE IF NOT EXISTS Friends
(
    Host VARCHAR(255),
    Receiver VARCHAR(255),
    CONSTRAINT Friends_pk PRIMARY KEY (Host, Receiver),
    CONSTRAINT Host_fk FOREIGN KEY (Host) REFERENCES User (username),
    CONSTRAINT Receiver_fk FOREIGN KEY (Receiver) REFERENCES User (username)
)