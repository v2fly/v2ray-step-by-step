# Log File

This section is some explanation to configure the log output in V2ray. When trying to feedback software crashes or report some bugs, it's always appriciated to have a full runtime logs. Not having detailed log files cannot help you out for developers.

More specifically, logging is an essential part of software development. It provides developers and supports teams with special 'scope' which enable them to see what the application code is doing. For a general user, you can know how the software runs, and again, when you meet any issue, providing logs will make developers fix the issue timely.

## Configuration

### Client-side Configuration

```json
{
  "log": {
    "loglevel": "warning", // Level of log
    "access": "D:\\v2ray\\access.log",  // Your path of in windows
    "error": "D:\\v2ray\\error.log"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com",
            "port": 16823,  
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
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

### Server-side Configuration

```json
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log", // Your path of log in Linux
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [
    {
      "port": 16823,
      "protocol": "vmess",   
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
            "alterId": 64
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",  
      "settings": {}
    }
  ]
}
```

Let's look at the settings of log:
* loglevel: log level, there are 5 respectively, in this example, the setting is warning
  - `debug`: the most detailed level, used for debugging
  - `info`: detailed log information, will show each request through V2Ray
  - `warning`: warning information, will contain some unimportant errors
  - `error`: important errors, which relate to fatal information to V2ray running 
  - none: will not prompt any information
* `access`: the path of access log files
* `error`: the path of error log files
* When error, access slot are empty, V2Ray logs are output directly in stdout (Terminal, cmd etc.) to facilitate debug.

::: tip Tips
In JSON, the backslash `\` has special meaning, so the `\` symbol of the Windows operating system directory is represented by `\\` in the configuration.
:::

------
#### Updates

- 2018-09-03 Update
- 2018-11-09 Adapt to v4.0+ configuration format.
- 2019-07-12 New Markdown container from Vuepress, update for some information
