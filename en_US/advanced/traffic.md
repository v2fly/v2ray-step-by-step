# Traffic Statistics

V2Ray has a traffic recording feature that is not enabled by default. Traffic statistics are divided into three categories: `inbound`, `user` and `outbound` (4.26.0+).

* `inbound` is the inbound statistics of each inbound in the configuration, and the inbound traffic needs to be recorded according to the `tag`.
* `user` is the statistics in the user of the vmess protocol, and the user's `email` is the basis for statistics and distinction. Users in socks, shadowsocks, http and other protocols do not support being counted.
* `outbound` refers to the statistics of each outbound outbound in the configuration. Newly added since 4.26.0, the outbound traffic needs to be recorded according to the `tag`.

## Configuration of Stats

To enable traffic statistic, following items must present in configuraton

1. `"stats":{}` the existence of the object;
2. The statistical switch in `"policy"` is true. The switch for global statistics is under `"system"`, and the switch for user statistics is under `"levels"`;
3. Global statistics must have a tag in the corresponding inbound and outbound;
4. User statistics must have email in `"clients"`;

To use api to query traffic, you need to ensure that the following configuration exists in the configuration:

1. There is `StatsService` in the `"api"` configuration object;
2. The entrance of the dedicated `dokodemo-door` protocol, the tag is api;
3. There are inboundTag:api -> outboundTag:api rules in routing;

Note: The statistical `email`/`tag` is the data of the current V2Ray process instance. For example, if statistics are performed on the server, the email written by the client has no meaning to the server; if the statistics are performed on the client, the output is the data of the client itself. .

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
        "rules": [
            {
                "inboundTag": [
                    "api"
                ],
                "outboundTag": "api",
                "type": "field"
            }
        ],
        "domainStrategy": "AsIs"
    }
}
```

## Viewing the traffic stats data

Viewing traffic information is one of the functions of `v2ctl`. Use `v2ctl api -h` to see query examples. The api dokodemo-door port set in the configuration is the port of the `--server` parameter.

```bash
v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats'pattern: "" reset: false'
v2ctl api --server=127.0.0.1:10085 StatsService.GetStats'name: "inbound>>>statin>>>traffic>>>downlink" reset: false'
```

Note that if you are running in the CMD of Windows, the quotation marks inside should be handled specially:

```cmd
v2ctl.exe api --server="127.0.0.1:10085" StatsService.GetStats "name: """"inbound>>>statin>>>traffic>>>downlink"""" reset: false"
```

There are two callable APIs:

* `QueryStats` is used to query matching records. You can use the parameters `pattern` and `reset`; leave pattern blank to match all records; reset makes the value of the matched unit zero.
* `GetStats` is used to record one of them. It accepts `name` and `reset`. The name can be constructed by referring to the output result of QueryStats. Reset makes the value of this unit zero.

Example of output:

```text
$ /usr/local/bin/v2ctl api --server=127.0.0.1:10085 StatsService.GetStats 'name:"inbound>>>ws>>>traffic>>>uplink"'
stat: <
  name: "inbound>>>ws>>>traffic>>>uplink"
  value: 3350713
>
$
$
$ /usr/local/bin/v2ctl api --server=127.0.0.1:10085 StatsService.QueryStats ''
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

The `name` in the result can be used as the `GetStats` API to query the value of a single counting unit. Please summarize the composition rule of the name by yourself. I will not discuss it in detail here; the counting unit of value is byte.

## Processing of Traffic Stats

The above configuration allows v2ray to open a query interface of the `grpc` protocol. In addition to using v2ctl, various programs that support the grpc protocol can be used to query the above values and perform additional processing (such as storage statistics, user billing, chart reports). However, this article will not go into depth. Now that there is a ready-made command line program for `v2ctl`, we can use a simple shell script awk tool to process it and generate enough readable reports.

Try to save the following script to `traffic.sh`, pay attention to use `chmod 755 traffic.sh` to grant execution permission. Pay attention to adjust and modify the connection specific port parameters in the line of `_APISERVER`.

```bash
#!/bin/bash

_APISERVER=127.0.0.1:10085
_V2CTL=/usr/local/bin/v2ctl

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
echo "------------Outbound----------"
print_sum "$DATA" "outbound"
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

The script uses the `reset` parameter to reset the called counting unit. With the watch command, you can view the real-time flow rate per second flowing through v2ray:
`watch ./traffic.sh reset`

#### Updates

- 2019-08-07 Updated the stats script to process the output in Scientific notation
- 2019-08-09 Optimize the traffic script and add the cumulative item of SUM->TOTAL
- 2020-07-04 Added outbound traffic statistics
- 2020-12-13 Fix v2ctl path, add outbound statistics in script
