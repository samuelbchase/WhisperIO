# WhisperIO

Hello! WhisperIO was created at Cal Poly SLO as part of a school project. Our goal was to create a messaging app, and learn about encryption and security along the way.
To be secure, this system used SSL/TLS to encrypt web traffic. However, this requires it to be deployed on a properly configured webserver. As such, if you're interested in getting this running, please use a browser with a CORS disabling addon, and ignore the HTTPS errors. This won't be secure, but will allow you to see the project we created.

This project is created primarily with NodeJS, socketIO, and Express.js. This was an excellent learning opportunity for us, and we hope you'll find this project interesting.

The below guide includes install steps to deploy on a remote webserver. It uses http://xip.io/ for DNS. This has been tested on Ubuntu 18.04.3 (LTS) x64.

Install steps:

    sudo apt-get update
    sudo apt-get install nodejs npm mysql-server

    git clone https://github.com/samuelbchase/WhisperIO.git && cd WhisperIO

    npm install

1. Go to https://console.developers.google.com/apis/credentials and press "create credentials". 

2. Select "Oauth client ID"

![Image](/images/1.png))

3. Select type Web Application, and give it any name you want.

4. Set the URIs to contain "https://YOUR_IP.xip.io" 
5. Set the authorized redirect URIS to contain "https://YOUR_IP.xip.io" and "https://YOUR_IP.xip.io/main"

![Image](/images/2.png)

6. Press save, and record your client id value.

![Image](/images/3.png)

7. Update aud.txt to contain your Google client ID

8. Run setup.sh to configure values in your HTML files

9. Finally run `node index.js` and navigate to https://YOUR_IP.xip.io/ to sign in!

OPTIONAL STEPS:

10. Although not needed to test out the app, you can change your MySQL credentials, and update the values in config.ini

## Running tests
Unit & Integration Tests:

    npm test
    