# Mux

Mux means multiplexing. In the current scientific Internet tools, only V2Ray has this function (2018-03-15 Note: there are other software to achieve similar functions). It can combine multiple TCP connections into one, saving resources and improving concurrency.

Audience: Uh? What the hell?

Well, translate adult words:

In the past, there was a person named Xiaobai. He was a cyclist, a madman and DIY player, so he had a little spare money to buy online, and he also liked to buy accessories to assemble bicycles. Once he assembled a bicycle, bought burglars, gloves, and a stopwatch at an online cycling home. He bought steering gear and transmissions at the X-Nuo specialty store, bought a frame at the X-special store, and bought brakes at the XX dealership. Pedals, cushions, wheel sets, cranks in xxx ...

    Four days later ...
    At 9 o'clock, Xiaobai's mobile phone rang. Connected, Xiaobai: Hello, hello. Other party: Hello, Shen x Express, come and pick up the package. Xiaobai rushed to pick up the courier.
    After 20 minutes, Xiaobai: Hello, hello. Other party: Hello, rhyme x, come here for express delivery. Xiaobai went again.
    Another 15 minutes, Xiaobai: Hello, hello. Other party: Hello, day x, come and get the express. Xiaobai went again.
    After another half an hour, Xiaobai: What is express delivery? Opponent: Circle x, hurry up. Xiaobai's heart: I'm X.
    10 minutes later……


If you are Xiaobai, are you tired?
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

Xiao He also assembles bicycles and buys accessories online, just like Xiao Bai, but he buys everything from the xx dealership.
    
    After 4 days, Xiao Hei answered the phone: Hello.
    Other party: Hello, Shun x, come and pick up the courier.
    Xiao Hei bought a bottle of beverages by the way: Brother, the weather is so hot, drink some hydrolysis to quench thirst. Hey, this box is too heavy, please help me move it to the house.

Mux can't actually increase the speed of the network, but it is more effective for concurrent connections, such as browsing web pages with many pictures and watching live broadcasts. From the perspective of use effect, Mux of V2Ray should be similar to TFO (TCP Fast Open) of Shadowsocks, because the purpose of both is to reduce handshake time, but the implementation is different. TFO can only be opened by setting the system kernel, and Mux is implemented purely at the software level. V2Ray is better in terms of configuration ease. (2018-09-19 Note: It didn't take long to update this paragraph, V2Ray added support for TFO, I feel like I can't learn anymore ~)

## Configuration

Mux only needs to be started on the client, the server will automatically recognize it, so only the configuration of the client is provided. That is, just add `" mux ": {" enabled ": true}` to outbound or outboundDetour:

```json
{
  "inbounds": [
    {
      "port": 1080, // listening port
      "protocol": "socks", // the entry protocol is SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth" // not authenticated
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess", // export protocol
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // server address, please change to your own server ip or domain name
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
- 2018-11-17 V4.0 + configuration
