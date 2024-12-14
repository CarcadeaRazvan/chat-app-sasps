docker-compose up --build -> porneste toata infrastructura

PUBSUB/
docker-compose run pubsub-client (un terminal reprezinta un client)
http://localhost:3000/publish (un request catre endpoint face publish la un mesaj -- simuleaza cate 1 client cu cate 1 mesaj)

WEBSOCKETS/
deschis http://localhost:8080/ in browser (cate un tab inseamna un client)

pentru testearea intregii aplicatii, din directorul tests/
npm i
./run-tests.sh

testarea se face cu tool-ul artillery care foloseste un fisier de config .yml si realizeaza flow ul specificat
iar in final genereaza cate un fisier de raportare cu rezultatele obtinute

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

pentru aplicatia in starea actuala s-au obtinut urmatoarele rezultate cu testele din tests/\*.yml

1. Key Metrics Comparison
   Metric | Pub/Sub (HTTP) | WebSocket
   Total Requests/Operations | 1200 HTTP requests | 1200 WebSocket messages sent
   Success Rate | 100% (http.codes.200 = 1200) | 100% (vusers.failed = 0)
   Request/Message Rate | ~35 HTTP requests/sec | ~30 WebSocket messages/sec
   Response Time (Mean) | ~2.8ms | ~4ms (inferred based on session length)
   Response Time (P95) | ~7.9ms | ~4.1ms (inferred)
   Session Length | ~3024ms (mean duration of vuser session) | ~4012ms (mean duration of vuser session)
   Downloaded Data | ~54 KB total HTTP responses | N/A (not tracked for WebSocket test)

2. Detailed Observations
   Throughput

- Pub/Sub achieved a slightly higher throughput (~35/sec) compared to WebSocket (~30/sec).
  -> This is likely due to Pub/Sub’s simpler request-response cycle and the fixed message sizes.
  -> WebSocket throughput might be influenced by the additional session management overhead or the need to keep connections open longer.

Response Times

- Pub/Sub (HTTP):
  -> Mean response time: ~2.8ms.
  -> 95th percentile (P95): ~7.9ms.
  -> 99th percentile (P99): ~12.1ms.
- WebSocket:
  -> Response times are not directly reported by Artillery but can be inferred from session lengths.
  -> Mean session length: ~4012ms, indicating slightly higher per-operation latency.

Session Length

- Pub/Sub sessions were shorter (~3024ms mean) than WebSocket sessions (~4012ms mean).
  -> This is expected since Pub/Sub clients terminate the connection after each request, while WebSocket clients maintain a persistent connection throughout the test.

Scalability

- Both systems handled 300 virtual users over 30 seconds without failures, showing good scalability under the given test conditions.

Message Processing

- WebSocket messages are smaller and processed faster on a per-message basis, which suits real-time applications like chat or live updates.
- Pub/Sub messages are HTTP-based and involve additional overhead for connection setup and teardown, but they work well for stateless operations.

3. Strengths and Weaknesses
   Overhead | Higher due to frequent connection setups. | Lower overhead with persistent connections.
   Latency | Low, measurable, and consistent (~2.8ms mean). | Slightly higher and inferred from session length (~4ms).
   Scalability | Good scalability, suitable for lightweight messaging. | Scales well for real-time, high-frequency messaging.
   Implementation | Simple request-response model. | More complex with session handling.
   Use Cases | Ideal for systems with independent requests. | Best for real-time applications requiring continuous communication.

4. Conclusion

- Pub/Sub (HTTP):

        -> Offers low and consistent latency, making it suitable for lightweight stateless tasks.
        -> Slightly better throughput due to simpler connection management.

- WebSocket:

        -> Designed for real-time, continuous communication with minimal overhead after connection establishment.
        -> Provides a more efficient solution for chat and live updates but requires more complex implementation.

The decision depends on the application's needs:

- Use WebSocket for real-time messaging, high frequency, and bidirectional communication.
- Use Pub/Sub (HTTP) for systems that prioritize simplicity and stateless operations.
