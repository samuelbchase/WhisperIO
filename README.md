# WhisperIO

Hello! WhisperIO was created at Cal Poly SLO as part of a school project. Our goal was to create a messaging app, and learn about encryption and security along the way.
To be secure, this system used SSL/TLS to encrypt web traffic. However, this requires it to be deployed on a properly configured webserver. As such, if you're interested in getting this running, please use a browser with a CORS disabling addon, and ignore the HTTPS errors. This won't be secure, but will allow you to see the project we created.

This project is created primarily with NodeJS, socketIO, and Express.js. This was an excellent learning opportunity for us, and we hope you'll find this project interesting.

The below guide includes install steps to deploy on a remote webserver. It uses http://xip.io/ for DNS. This has been tested on Ubuntu 16.04 LTS.

Install steps:

    sudo apt-get update
    sudo apt-get install nodejs npm mysql-server

    git clone https://github.com/samuelbchase/WhisperIO.git

    mysql < SQL/Create_Database.sql

    npm install

Go to https://console.developers.google.com/apis/credentials and press "create credentials". 

Select "Oauth client ID"
![Image](https://ibb.co/Lp9qZGD)

Select type Web Application, and give it any name you want.

Set the URIs to contain "https://YOUR_IP.xip.io:3000" 
and set the authorized redirect URIS to contain "https://YOUR_IP.xip.io:3000" and "https://YOUR_IP.xip.io:3000/main"

![Image](https://ibb.co/RgVd7sh)

Press save, and record your client id value.
![Image](https://ibb.co/gRvyp3n)

Update login.html and index.html: 
1) Set google-signin-client_id's content value to be your new Google client ID
2) set URL_SERVER to be equal to https://YOUR_IP.xip.io:3000

Update aud.txt to contain your Google client ID

Then run `node index.js` and navigate to https://YOUR_IP.xip.io:3000/ to sign in!
