# Mux

Mux means multiplexing. In the current proxy tools, only V2Ray has this feature (2018-03-15 Note: there are other software implemented similar feature). It can combine multiple TCP connections into one, saving resources and improving concurrency.

Audience: Uh? What the hell?

Well, translate to plain English:

In the past, there was a person named David. He was a cyclist, a madman and DIY player. So he had a little spare money for online shopping, and he also liked to buy accessories to assemble bicycles. Once he assembled a bicycle, bought burglars, gloves, and a speed metre at an online cycling home. He bought steering gear and transmissions at the A specialty store, bought a frame at the B special store, and bought brakes at the C dealership. Pedals, cushions, wheel sets, cranks in D ...

    Four days later ...
    
    At 9 o'clock, David's mobile phone rang. Connected, David: Hello, hello. 
    Courier A: Hello, AA Express, come and pick up the package. David rushed to pick up the courier.
    
    After 20 minutes, David: Hello, hello. 
    Courier B: Hello, BB Express, come here for express delivery. David went again.
    
    Another 15 minutes, David: Hello, hello. 
    Courier C: Hello, CC Express, come and get the express. David went again.
    
    After another half an hour, David: What is express delivery? 
    Courier D: DD Express, hurry up. David thought: fuck up!

    10 minutes later ...



If you are David, ain't you tired?
The computer is also similar, but the work to be done is much less vain:

    Browser: I want to see the V2Ray configuration guide.
    Computer: OK, I initiate a TCP connection.
    Telegram: I want to learn from the big guys in the Telegram group of V2Ray.
    Computer: OK, a connection was initiated.
    Browser: I want to see the manual for V2Ray.
    Computer: OK.
    Browser: I want a Google search for V2Ray tutorials.
    Computer: OK.
    Browser: I want to ...

If the normal Internet connection can use the analogy of the white example above, then Mux of V2Ray is:

Chris also assembles bicycles and buys accessories online, just like David, but he buys everything from the XX dealership.
    
    After 4 days, Chris answered the phone: Hello.
    Courier: Hello, SF Express, come and pick up the courier.
    Chris bought a bottle of beverages by the way: Bro, the weather is so hot, take some drink. This box is too heavy, can you help me move it to my house?

Mux can't actually increase the speed of the network, but it is more effective for concurrent connections, such as browsing web pages with many pictures and watching live broadcasts. From the perspective of use effect, Mux of V2Ray should be similar to TFO (TCP Fast Open) of Shadowsocks, because the purpose of both is to reduce handshake time, but the implementation is different. TFO can only be opened by setting the system kernel, and Mux is implemented purely at the software level. V2Ray is better in terms of configuration ease. (2018-09-19 Note: It didn't take long to update this paragraph, V2Ray added support of TCP fast open.)

## Configuration

Mux only needs to be configured on the client, the server will automatically recognise it, so only the configuration of the client is provided. That is, just add `" mux ": {" enabled ": true}` to outbound or outboundDetour:

```json
{
  "inbounds": [
    {
      "port": 1080, // listening port
      "protocol": "socks", // the incoming protocol is SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth" // no authenticated
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess", // outcoming protocol
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // server address, please edit to your own server ip or domain name
            "port": 16823, // server port
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811", // The user ID must be the same as the server configuration
                "alterId": 64 // The value here should also be the same as the server
              }
            ]
          }
        ]
      },
      "mux": {"enabled": true}
    }
  ]
}

```

#### Update history

- 2018-08-30 Modify the layout and description
- 2018-11-17 Adaption for V4.0 + configuration
