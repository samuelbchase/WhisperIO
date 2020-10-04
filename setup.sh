#!/bin/bash
echo "Please enter the server's IP address, followed by [ENTER]:"

read ip

echo "Please enter the google signin client ID, followed by [ENTER]:"

read clientId

#update IP address
sed -i "s/var ip =.*/var ip = \"$ip\";/g" index.html
sed -i "s/var ip =.*/var ip = \"$ip\";/g" login.html
#update google client ID
sed -i "s/.*google-signin-client_id.*/\t<meta name=\"google-signin-client_id\" content=\"$clientId\">/g" index.html
sed -i "s/.*google-signin-client_id.*/\t<meta name=\"google-signin-client_id\" content=\"$clientId\">/g" login.html
