# Transparent Proxy

Here, V2Ray is used as a transparent proxy which allows you to access blocked websites for all the devices in a LAN, as some people called a router proxy. However, we would rather call it a gateway proxy than a router proxy. Certainly, using only a home router as a gateway proxy is possible since most home routers can behave as a gateway. Once it is configured as the gateway proxy, all devices in the LAN can have access to censored websites. Gateway proxy can also act as a global proxy, saving you from having to install V2Ray on each device. When the configuration is updated, you only need to modify the setting at the gateway. Some people say it feels like there is no blocking wall at all. Nonetheless, we advise one evaluate its network environment first before blindly deploying transparent proxy V2Ray.

The transparent proxy is befitting for the following situations:
* You have many LAN devices in your local network, such as offices, laboratories, and large families.
* Your device(s) can't conveniently set up a proxy on their own, such as Chromecast, TV box, etc.
* You want all the traffic on your device(s) to access the internet via a proxy.


## Pros 

In fact, V2Ray has been supported as a transparent proxy for some time. However, due to some DNS problem, it was not very convenient at that time. It's, however, a different story now. Because V2Ray as a transparent proxy can:
1. Solve DNS pollution to blocked domains by the Great Firewall;
2. Deal not only DNS pollution mentioned above but also in the meantime resolve Chinese domains using Chinese CDN;
3. Eliminate the 1 and 2 issues without the need for external software or self-built DNS, as long as the system supports V2Ray and iptables;
4. Take advantage of V2Ray's powerful and flexible routing feature without maintain a routing table;

## Preparation
* Someone who's capable to solve problems in their own situations;
* A VPS that has installed V2Ray, the IP of which we assume to be `110.231.43.65`;
* A device with iptables, root permission, and Linux system, the IP of which we assume to be `192.168.1.22`, with V2Ray running as a client. This device can be a router, a development board, a personal computer, a virtual machine, or an Android device, referred to a gateway here. We do not recommend using the MT7620 system to deploy as a transparent proxy, due to its limited performance, and the fact that many of their firmware does not have access to FPU. If you are not willing to purchase a new device specifically for transparent proxy, you can, however, create a virtual machine on your PC (e.g. VirtualBox, Hyper-V, and KVM). Note that on the hypervisor, you should set virtual machines' network in bridge mode.

## Procedures

The setup steps are as follows, assuming you are logged in with root.

1. Enable IP forwarding on the gateway device: Add new line `net.ipv4.ip_forward=1` to the /etc/sysctl.conf file and execute :
```
sysctl -p
```
2. The gateway device sets to a static IP, which is in the same network segment as the LAN port of the router. The default gateway should be the IP address of the router. Enter the router management page and go to the DHCP setting, set the default gateway address at the IP address of the gateway device, as 192.168.1.22 in this example. Or you can set your computer, phone and other devices their default gateway individually (to 192.168.1.22), and reconnect your devices to the router to see if they can connect to the Internet. (It's normal that the device can not yet bypass the GFW at this time). If the devices have no access to the internet at all, you'll have to solve this issue first before going any further. Otherwise, you'll only waste your time following the next steps. The gateway device is set to a static IP so that to its IP does not change after a reboot. The default gateway on the router is set to the gateway IP address so that the router routes all data sent from the LAN devices connected to it to the gateway device, who then forwards the traffic using V2Ray.

3. Install the latest version of V2Ray on the server  (your VPS) and the gateway. (If you don't how then you need to follow the previous tutorials. Note that GFW likes to intercept the GitHub releases traffic, and it can cause failure to install V2Ray using the installation script. It is hence advised to download the V2Ray package manually, and then use the installation script with the "-local" parameter.) Configure your config file accordingly. When you are sure that the V2Ray is working properly, at the gateway, execute `curl -x socks5://127.0.0.1:1080 google.com` to test whether your setup can bypass GFW. (Here socks5 refers to the inbound protocol and `1080` is the inbound port ) . If the output is something like the following, you are good. Otherwise, there's something wrong with your setup and you need to recheck what you have missed.
<!--``-->
```
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```

4. In the configuration file of the gateway, add the inbound configuration of the dokodemo-door protocol, enable sniffing, and add also SO_MARK to all outbound streamSettings. The configuration should be as follows (the `...` represents configuration in a standard client):
```json
{
  "routing": {...},
  "inbounds": [
    {
      ...
    },
    {
      "port": 12345, //开放的端口号
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true // 这里要为 true 才能接受来自 iptables 的流量
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      ...
      "streamSettings": {
        ...
        "sockopt": {
          "mark": 255  //这里是 SO_MARK，用于 iptables 识别，每个 outbound 都要配置；255可以改成其他数值，但要与下面的 iptables 规则对应；如果有多个 outbound，最好奖所有 outbound 的 SO_MARK 都设置成一样的数值
        }
      }
    }
    ...
  ]
}
```

5. Set iptable rules for TCP for the transparent proxy device: (after `#` are comments):

```bash
iptables -t nat -N V2RAY # Create a new chain called V2RAY
iptables -t nat -A V2RAY -d 192.168.0.0/16 -j RETURN # Direct connection 192.168.0.0/16
iptables -t nat -A V2RAY -p tcp -j RETURN -m mark --mark 0xff # Directly connect SO_MARK to 0xff traffic (0xff is a hexadecimal number, numerically equivalent to 255), the purpose of this rule is to avoid proxy loopback with local (gateway) traffic
iptables -t nat -A V2RAY -p tcp -j REDIRECT --to-ports 12345 # The rest of the traffic is forwarded to port 12345 (ie V2Ray)
iptables -t nat -A PREROUTING -p tcp -j V2RAY # Transparent proxy for other LAN devices
iptables -t nat -A OUTPUT -p tcp -j V2RAY # Transparent proxy for this machine
```

Then set the iptables rule of UDP traffic for the transparent proxy device:
```
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100
iptables -t mangle -N V2RAY_MASK
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A V2RAY_MASK -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -p udp -j V2RAY_MASK
```

6. Try visiting a blocked website directly using your computer/phone that are connected under the same LAN with your configured transparent proxy device. You should not be blocked by now.

7. You might need a script or anything (such as iptables-persistent) that can automatically load the above iptable rules after the transparent proxy device reboots. Otherwise, the iptables will be lost after it reboots.


## Notes

* WIth the above setup, when you visit a normally blocked site, the gateway will still use the system DNS for the query, except that the returned result is polluted. But the sniffing provided by V2Ray can learn the domain name (of the polluted website) from the traffic and send it for your VPS to resolve, returning the correct result. This is to say that every time you visit a blocked website by the GFW, despite the fact that you can bypass the censorship with V2Ray, your system DNS provider (who pollutes your DNS) knows that you have tried to visit the blocked website. Hence you need to be aware of the possibility that they could actively collect such data.
* V2Ray sniffing currently only extracts domain names from TLS and HTTP traffic. If there is traffic that is neither type of the two, be cautious of using sniffing to solve DNS pollution.
* There might be some problems with the transparent proxy rule for UDP traffic. It will be thankful if you would like to give us any feedback regarding those rules. If your online activities involve simply web surfing or watching videos, TCP rules only might be sufficient without the need of configuring UDP rules.
* Due to the limit of VMESS protocol, V2Ray transparent proxy would not offer satisfactory online gaming performance.
* Only TCP/UDP traffic can be proxied via V2Ray, so it does not work with ICMP packets. Therefore, the transparent proxy does not support ping/mtr which is based on ICMP. However, tcping or hping3 works as they use TCP instead of ICMP.
* There are some transparent proxy tutorials on the internet that set iptables rules for private addresses like RETURN 127.0.0.0/8, but we suggest they should be placed in the V2Ray routing rules for performance reason.

-------

#### Updates

* 2017-12-05 Initial Version.
* 2017-12-24 Fix a problem of visiting non-blocked sites.
* 2017-12-27 re-format.
* 2017-12-29 Removed unnecessary iptables rules.
* 2018-01-16 Optimized set up steps.
* 2018-01-21 Add UDP transparent proxy setting
* 2018-04-05 Update
* 2018-08-30 Fix setting up procedures.
* 2018-09-14 improved local requests.

