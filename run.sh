!#/bin/bash
#nohup node /home/17ew/nodejs/frontend_socket/server.js > /home/17ew/nodejs/frontend_socket/server.log &
ps axu |grep ts-node  |  awk '{print $2}'  |  xargs kill -9

nohup command & npm start & exit


