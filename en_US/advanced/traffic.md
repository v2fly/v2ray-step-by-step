# Traffic Statistics

V2ray includes a traffic stats service, but it's not enabled by default. Traffic can be measured at three places: `inbound`, `user` and `outbound`(4.25.2+).

* `inbound` collects all traffic went through a certain inbound. It is identified by the `tag` attribute.
* `user` with the `email` attrbute in vmess client settings, their own usage can be measured separately. Note: clients in socks/shadowsocks/http are not supported.
* Since version 4.25.2+, `outbound` is added for all traffic went through a certain outbound. It is identified by the `tag` attribute.

## Configuration of Stats

To enable traffic statistic, following items must be present in configuration

1. `"stats":{}` must set
2. `"policy"` attributes must set to true. Inbound and outbound settings are under `"system"`. User settings are under `"levels"`
3. Corresponding inbounds and outbounds must have tag
4. `"clients"` settings must include email attribute

To enable querying statistic with api, following items must present in configuration

1. `"api"` includes `StatsService`
2. a `dokodemo-door` protocol inbound, tag set to api for grpc connection, used for connection of the API
3. routing rules include an inboundTag:api -> outboundTag:api rule

Note: `email`/`tag` stats data is generated from the v2ray process you query, client/server won't exchange their data. The email in client side has nothing to do with the one on server-side, even if they use the same uuid. If you query on client process, the data is only about the client process.

## Configuration Example

```json
{
    "stats": {},
    "api": {
        "tag": "api",
        "services": [
            "StatsService"
        ]
    },
    "policy": {
        "levels": {
            "0": {
                "statsUserUplink": true,
                "statsUserDownlink": true
            }
        },
        "system": {
            "statsInboundUplink": true,
            "statsInboundDownlink": true,
            "statsOutboundUplink": true,
            "statsOutboundDownlink": true
        }
    },
    "inbounds": [
        {
            "tag": "tcp",
            "port": 3307,
            "protocol": "vmess",
            "settings": {
                "clients": [
                    {
                        "email": "auser",
                        "id": "e731f153-4f31-49d3-9e8f-ff8f396135ef",
                        "level": 0,
                        "alterId": 64
                    },
                    {
                        "email": "buser",
                        "id": "e731f153-4f31-49d3-9e8f-ff8f396135ee",
                        "level": 0,
                        "alterId": 64
                    }
                ]
            }
        },
        {
            "listen": "127.0.0.1",
            "port": 10085,
            "protocol": "dokodemo-door",
            "settings": {
                "address": "127.0.0.1"
            },
            "tag": "api"
        }
    ],
    "outbounds": [
        {
            "tag": "direct",
            "protocol": "freedom",
            "settings": {}
        }
    ],
    "routing": {
        "settings": {
            "rules": [
                {
                    "inboundTag": [
                        "api"
                    ],
                    "outboundTag": "api",
                    "type": "field"
                }
            ]
        },
        "strategy": "rules"
    }
}
```

## Viewing the traffic stats data

one of the functions in `v2ctl` program is to connect to API.  Run `v2ctl api -h` will show help text and example about them. The configured port of api tagged dokodemo, used here as `--server` argument.

```bash
v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats 'pattern: "" reset: false'
v2ctl api --server=127.0.0.1:10085 StatsService.GetStats 'name: "inbound>>>statin>>>traffic>>>downlink" reset: false'
```

Note: if you are running v2ctl.exe in windows cmd, the quotes need to be repeated to be passed as program arguments.

```cmd
v2ctl.exe api --server="127.0.0.1:10085" StatsService.GetStats "name: """"inbound>>>statin>>>traffic>>>downlink"""" reset: false"
```

There are 2 APIs about traffic stats.

* `QueryStats` is used to query matched record,  with argument `pattern`and`reset`; empty pattern matches all records, while reset set them to zero after the query.
* `GetStats` retrives a single record, accepting arguments: `name` and `reset`.  Follow the "name" in the result of QueryStats to construct the record. And, reset set the record value to zero.

Example of output:

```text
$ /usr/bin/v2ray/v2ctl api --server=127.0.0.1:10085 StatsService.GetStats 'name:"inbound>>>ws>>>traffic>>>uplink"'
stat: <
  name: "inbound>>>ws>>>traffic>>>uplink"
  value: 3350713
>
$
$
$ /usr/bin/v2ray/v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats ''
stat: <
  name: "inbound>>>ws>>>traffic>>>uplink"
  value: 3350713
>
stat: <
  name: "inbound>>>ss>>>traffic>>>downlink"
  value: 1704
>
stat: <
  name: "user>>>u3@ws>>>traffic>>>uplink"
  value: 2810759
>
stat: <
  name: "user>>>u9@ss>>>traffic>>>uplink"
  value: 1776
>
stat: <
  name: "inbound>>>ss>>>traffic>>>uplink"
  value: 2276
>
stat: <
  name: "inbound>>>api>>>traffic>>>uplink"
  value: 318
>
stat: <
  name: "user>>>u9@ss>>>traffic>>>downlink"
  value: 1368
>
stat: <
  name: "inbound>>>tcp>>>traffic>>>uplink"
>
stat: <
  name: "inbound>>>tcp>>>traffic>>>downlink"
>
stat: <
  name: "inbound>>>ws>>>traffic>>>downlink"
  value: 130637140
>
stat: <
  name: "inbound>>>api>>>traffic>>>downlink"
  value: 759
>
stat: <
  name: "user>>>u3@ws>>>traffic>>>downlink"
  value: 126944108
>
```

As noted before, the `name` here can be used as `GetStats` parameter if one of the value is your concern. The unit of value is byte.

## Processing of Traffic Stats

The configuration above is to open an interface for gRPC protocol. In addition to `v2ctl`, you can use any gRPC supported program to query the value. However, we are not going deep into the third-party applications since you may use `v2ctl` along with 'awk' to generate a holistic report. 

Save the following bash script as `traffic.sh`, set exec permission by `chmod 755 traffic.sh`. Change the `_APISERVER` line if you use different dokodemo-door port.

```bash
#!/bin/bash

_APISERVER=127.0.0.1:10085
_V2CTL=/usr/bin/v2ray/v2ctl

apidata () {
    local ARGS=
    if [[ $1 == "reset" ]]; then
      ARGS="reset: true"
    fi
    $_V2CTL api --server=$_APISERVER StatsService.QueryStats "${ARGS}" \
    | awk '{
        if (match($1, /name:/)) {
            f=1; gsub(/^"|link"$/, "", $2);
            split($2, p,  ">>>");
            printf "%s:%s->%s\t", p[1],p[2],p[4];
        }
        else if (match($1, /value:/) && f){ f = 0; printf "%.0f\n", $2; }
        else if (match($0, /^>$/) && f) { f = 0; print 0; }
    }'
}

print_sum() {
    local DATA="$1"
    local PREFIX="$2"
    local SORTED=$(echo "$DATA" | grep "^${PREFIX}" | sort -r)
    local SUM=$(echo "$SORTED" | awk '
        /->up/{us+=$2}
        /->down/{ds+=$2}
        END{
            printf "SUM->up:\t%.0f\nSUM->down:\t%.0f\nSUM->TOTAL:\t%.0f\n", us, ds, us+ds;
        }')
    echo -e "${SORTED}\n${SUM}" \
    | numfmt --field=2 --suffix=B --to=iec \
    | column -t
}

DATA=$(apidata $1)
echo "------------Inbound----------"
print_sum "$DATA" "inbound"
echo "-----------------------------"
echo
echo "-------------User------------"
print_sum "$DATA" "user"
echo "-----------------------------"
```

Example of output

```text
$ ./traffic.sh
------------Inbound----------
inbound:ws->up      0B
inbound:ws->down    0B
inbound:tcp->up     47B
inbound:tcp->down   0B
inbound:kcp->up     259MB
inbound:kcp->down   2.4GB
inbound:api->up     2.0KB
inbound:api->down   6.6KB
SUM->up:            259MB
SUM->down:          2.4GB
SUM->TOTAL:         2.6GB
-----------------------------

-------------User------------
user:me@kcp->up    240MB
user:me@kcp->down  2.3GB
SUM->up:           240MB
SUM->down:         2.3GB
SUM->TOTAL:        2.5GB
-----------------------------
```

Setting `reset` argument to script reset values to zero on each call. Use together with command watch, you can view traffic speed going through v2ray in real time:

`watch ./traffic.sh reset`

#### Updates

- 2019-08-07 Updated the stats script to process the output in Scientific notation
- 2019-08-09 Optimized traffic statistics and added the SUM->TOTAL column
- 2020-07-04 Added traffic statistics for outbounds
