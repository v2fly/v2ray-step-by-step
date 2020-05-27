# Dynamic Port

V2Ray supports a feature called Dynamic Port. As plain as the name sounds, the port for V2Ray communications doesn’t have to be static, it could be dynamic! The feature was first introduced to avoid ISP throttling. However, dynamic port is rarely used by people so no solid statistics could show how much it benefit on avoiding detection by firewalls.

## Notice

In practice, currently the dynamic port is dedicated to vmess protocol, which is not available for others.

## Basic Dynamic Port Configurations

The main port is the port defined in “inbound” on the server side. Dynamic port is defined in “inboundDetour” on the server and no further configurations would be needed client side. The client would initiate the negotiation for which port to use next through the main port on the server side. 

### Server-side Configuration

```json
{
  "inbounds":[
  { //Main port configuration
      "port": 37192,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "alterId": 64
          }
        ],
        "detour": { //This section instructs the client to use dynamic port for communications
          "to": "dynamicPort"   
        }
      }
    },
    {
      "protocol": "vmess",
      "port": "10000-20000", // Range of the ports
      "tag": "dynamicPort",  // Name has to match the value in “detour to “
      "settings": {
        "default": {
          "alterId": 64
        }
      },
      "allocate": {            // Allocation mode
        "strategy": "random", 
        "concurrency": 2,      // Number of ports open concurrently. Must be less than 1/3 of the number of ports in the range specified above
        "refresh": 3           // Refreshing every 3 minutes
      }
    }
  ]
}
```

### Client-side Configuration

```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "1.2.3.4",
            "port": 37192,
            "users": [
              {
                "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
                "alterId": 64
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## Dynamic port with mKCP

Add streamSettings to the corresponding inbounds and outbounds and set the network to kcp.

### Server-side Configuration

```json
{
  "inbounds": [
    {
      "port": 37192,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ],
        "detour": {        
          "to": "dynamicPort"   
        }
      },
      "streamSettings": {
        "network": "kcp"
      }
    },
    {
      "protocol": "vmess",
      "port": "10000-20000", // Port range
      "tag": "dynamicPort",       
      "settings": {
        "default": {
          "level": 1,
          "alterId": 32
        }
      },
      "allocate": {            // Allocation mode
        "strategy": "random",  // Random enable 
        "concurrency": 2,      // Open 2 ports at same time
        "refresh": 3           // Change port per 3 mins
      },
      "streamSettings": {
        "network": "kcp"
      }
    }
  ]
}
```

### Client-side Configuration

```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "1.2.3.4",
            "port": 37192,
            "users": [
              {
                "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
                "alterId": 64
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "kcp"
      }
    }
  ]
}
```

------
#### Updates

- 2018-01-06 Delete incorrect and unnecessary sentences
- 2018-11-17 Adapted for V4.0+
