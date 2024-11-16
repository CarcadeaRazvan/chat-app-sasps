pre-requisites/
npm
redis-server (linux/windows)

npm i in cele 2 foldere: pubsub / websocket

webocket/
npm run start-server
http://localhost:8080/ -> oricati clienti

pubsub/
redis-server / redis-server.exe intr-un terminal
npm run start-client -> fiecare terminal, un client

Client A <-------> WebSocket Server <-------> Client B
                     | 
                     | (Persistent TCP Connections)
                     |
                 Database (Optional)



      +-----------------------+
      |      Client A        |
      | (Publisher/Subscriber)|
      +-----------|-----------+
                  |
                  | Publish & Subscribe
                  |
                  v
          +--------------------+
          |   Redis Broker     |
          |   (Chat Channel)   |
          +--------------------+
                  |
                  | Broadcast to Subscribers
                  |
      +-----------|-----------+
      |      Client B        |
      | (Publisher/Subscriber)|
      +-----------------------+