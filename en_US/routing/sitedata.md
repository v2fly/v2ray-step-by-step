# Domain file

## Domain list file downloaded with V2Ray

When downloading V2Ray, the downloaded file contains a geosite.dat. This file is used in the routing feature, which has many built-in [common website domain names](https://github.com/v2ray/domain-list-community). The configuration is as follows, geosite refers to the geosite.dat file, and the following cn is a label, which represents the use of the cn rule in the geosite.dat file.
```json
{
    "type": "field",
    "outboundTag": "direct",
    "domain": [
        "geosite:cn"
    ]
}
```
Through this file of the list, you can set these traffic of Chinese domains will not bypass the proxy, and simply setting these domains in one line in the configuration file. One of the advantages is that the configuration is relatively simple and clear.

## External domains list file

Many times, V2Ray's built-in Chinese domain name does not cover all necessary websites. However, V2Ray can load an externally customized domains file like geosite.dat. Here we provide one, you can simply download it.

1. Go to the below link:
(https://github.com/ToutyRater/V2Ray-SiteDAT/tree/master/geofiles)[https://github.com/ToutyRater/V2Ray-SiteDAT/tree/master/geofiles]
You can download h2y.dat, and put it in the same directory of V2Ray configuration file
1. For external domian list, the format is "ext:h2y.dat:tag". ext means to use an external file; h2y.dat is a specific file name; tag refers to a tag, and which tags are provided by the file. The h2y.dat file downloaded in the previous step currently has only two tags, `ad` and `gfw`, ad contains the common ad domain name, and gfw contains the common gfw-shielded domain name. The domain names they contain are visible in [here](https://github.com/ToutyRater/v2ray-SiteDAT/tree/master/h2y). This domain list file is automatically updated every week. If you use the domain list file here provided, please update it regularly (open https://github.com/ToutyRater/V2Ray-SiteDAT/tree/master/geofiles) and see the latest updates at the time. An example of routing configuration is as below:
1. Run V2Ray
```json
"rules":[
    {
        "type": "field",
        "outboundTag": "block", //拦截广告相关域名
        "domain": [
            "ext:h2y.dat:ad"
        ]
    },
    {
        "type": "field",
        "outboundTag": "proxy", //被 gfw 屏蔽的域名走代理
        "domain": [
            "ext:h2y.dat:gfw"
        ]
    }
]
```

It should be noted that all third-party V2Ray GUI clients do not support loading external domain name files.

#### Updates

- 2018-06-07 Initial release
- 2018-11-06 Delete unnecessary tags
