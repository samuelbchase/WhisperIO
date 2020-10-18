# WhisperIO

Hello! WhisperIO was created at Cal Poly SLO as part of a school project. Our goal was to create a messaging app, and learn about encryption and security along the way.
To be secure, this system used SSL/TLS to encrypt web traffic. However, this requires it to be deployed on a properly configured webserver. As such, if you're interested in getting this running, please use a browser with a CORS disabling addon, and ignore the HTTPS errors. This won't be secure, but will allow you to see the project we created.

This project is created primarily with NodeJS, socketIO, and Express.js. This was an excellent learning opportunity for us, and we hope you'll find this project interesting.

The below guide includes install steps to deploy on a remote webserver. It uses http://xip.io/ for DNS. This has been tested on Ubuntu 18.04.3 (LTS) x64.

Install steps:

    sudo apt-get update
    sudo apt-get install nodejs npm mysql-server

    git clone https://github.com/samuelbchase/WhisperIO.git && cd WhisperIO

    yarn install

1. Go to https://console.developers.google.com/apis/credentials and press "create credentials". 

2. Select "Oauth client ID"

![Image](/images/1.png))

3. Select type Web Application, and give it any name you want.

4. Set the URIs to contain "https://YOUR_IP.xip.io:3000" 
5. Set the authorized redirect URIS to contain "https://YOUR_IP.xip.io:3000" and "https://YOUR_IP.xip.io:3000/main"

![Image](/images/2.png)

6. Press save, and record your client id value.

![Image](/images/3.png)

7. Update aud.txt to contain your Google client ID

8. Run setup.sh to configure values in your HTML files

9. Finally run `node index.js` and navigate to https://YOUR_IP.xip.io:3000/ to sign in!

## Enabling HTTPS:

As would be hoped, this application supports HTTPS for secure connections. This requires a webserver, and a domain name.

1. Use certbot (or your favorite alternative cert generating tool) to generate a certificate on your web server for your domain name.

2. Copy the privkey.pem and fullchain.pem into the certs/ folder in WhisperIO

3. Redirect your domain name to the WhisperIO webserver

4. Rerun setup_https.sh, this time using your domain name instead of the server IP. You may use the same Google AUD.

5. In your Google console (https://console.developers.google.com/apis/credentials) add entries for your domain name under both authorized origins and redirect URLs. These should be exactly the same as your IP based entries, except replacing YOUR_IP_ADDRESS.xip.io with your domain name.

6. Finally, edit your index.html and login.html pages to remove ".xip.io" from your URLS

6. Now you should be able to access your WhisperIO instance!

## Optional Steps:

1. Although not needed to test out the app, you can change your MySQL credentials, and update the values in config.ini

## Running tests
Unit & Integration Tests:

    yarn test
    