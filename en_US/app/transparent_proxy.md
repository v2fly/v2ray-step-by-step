# Transparent Proxy

Here, V2Ray is used as a transparent proxy which allows you accessing blocked websites for all of the devices in the LAN, hence some people called it a router proxy. However, we would like to correct that, as it is better to call as gateway proxy rather than a router proxy. Of course, only using a home router as a gateway proxy is also possible because most of the home routers behave as a gateway. Once configured the gateway proxy, all the devices in LAN will have access to censored websites. Also, gateway proxy will act as a globally proxy, without having to install V2Ray on each device. If the configuration is updated, you only need to modify the setting at the gateway. Some people say it just feels like no wall. However, if you are interested in transparent proxy, you should evaluate that is it suitable for your network environment, rather than blindly follow the trend.

The transparent proxy is befitting for the following situations:
* You have many LAN devices in your local network, such as offices, laboratories, and large families.
* Your device(s) can't/inconveniently set up the proxy, such as Chromecast, TV box, etc.
* You want all the traffic on your device(s) access the internet via the proxy.


## Pros:

In fact, V2Ray has long been a transparent agent. At the time, I also studied it for a while, and finally, I was tossed out. However, due to the DNS problem, I always feel uncomfortable.
But, now, it’s not the same. For now, use the V2Ray transparent proxy:
1. Solved the problem of DNS pollution to domains from firewall;
2. In the case when DNS pollution solved, the Chinese domains can still be resolved to the Chinese CDN;
3. Eliminate the 1 and 2 issues without the need for external software or self-built DNS, as long as the system supports V2Ray and iptables;
4. Take advantage of V2Ray's powerful and flexible routing feature without maintain a routing table;

## Preparation
* A person who has the ability to solve problems based on themselves situations;
* A VPS that has been installed V2Ray, in this section we assume that the servers' IP is `110.231.43.65`;
* A device with iptables, root permission, and Linux system, assuming the address is `192.168.1.22`, V2Ray runs as a client. This device can be a router, a development board, a personal computer, a virtual machine, and an Android device, and generally, refer to a gateway. We do not recommend using the MT7620 system to deploy transparent proxy, due to the limited performance, and many firmware does not have access to FPU. If you don't want to pay for a new device for transparent proxy, you can create a virtual machine on your PC (e.g. VirtualBox, Hyper-V, and KVM). Note that on the hypervisor, you should set virtual machines' network mode as the bridge.

## Procedures

The setup steps are as follows, assuming you are logged in with root.

1. The gateway device enables IP forwarding. Add a line `net.ipv4.ip_forward=1` to the /etc/sysctl.conf file and execute the following commands:
```
sysctl -p
```
2. The gateway device sets a static IP, which is the same network segment as the LAN port of the router. The default gateway is the IP address of the router. Enter the management background of the router. To the DHCP setting, the default gateway address is the IP address of the gateway device. In this example, it is 192.168.1.22, or The computer phone and other devices set the default gateway separately, and then the computer/mobile phone reconnects to the router to test whether it can be connected to the Internet (it can't be over the wall at this time). If you can't go online, you can learn one and get it. Otherwise, how can you do the same? Can't get on the net. The gateway device sets the static IP to prevent the IP from changing after the restart, which causes other devices to fail to connect to the network. The router sets the DHCP default gateway address so that the device accessing the router sends the data packet to the gateway device, and then The gateway device forwards.

3. Install the latest version of V2Ray on the server and gateway (if you don't refer to the previous tutorial, since GFW will worsen the traffic of GitHub Releases, the gateway can run the script almost impossible to install, it is recommended to download the V2Ray compression package first, then use the installation script to pass - The -local parameter is installed) and the configuration file is configured. Be sure to set up the V2Ray to work properly. At the gateway, execute `curl -x socks5://127.0.0.1:1080 google.com` to test whether the configured V2Ray can be over the wall (in the command `socks5` refers to the inbound protocol as socks, `1080` means the inbound port is 1080) . If there is an output similar to the following, you can overturn the wall. If it does not appear, you can't turn it over. You have to check carefully which step is wrong or missing.
```
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```

4. In the configuration of the gateway, add the inbound configuration of the dokodemo-door protocol and enable sniffing; also add SO_MARK to all outbound streamSettings. The configuration is as follows (the `...` in the configuration represents the usual configuration of the original client):
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

5. Set the TCP transparent proxy by iptables rules, the commands as below (after `#` are comments):

```
Iptables -t nat -N V2RAY # Create a new chain called V2RAY
Iptables -t nat -A V2RAY -d 192.168.0.0/16 -j RETURN # Direct connection 192.168.0.0/16
Iptables -t nat -A V2RAY -p tcp -j RETURN -m mark --mark 0xff # Directly connect SO_MARK to 0xff traffic (0xff is a hexadecimal number, numerically equivalent to the above configured 255), the purpose of this rule is Avoid proxy loopback problems with local (gateway) traffic
Iptables -t nat -A V2RAY -p tcp -j REDIRECT --to-ports 12345 # The rest of the traffic is forwarded to port 12345 (ie V2Ray)
Iptables -t nat -A PREROUTING -p tcp -j V2RAY # Transparent proxy for other LAN devices
Iptables -t nat -A OUTPUT -p tcp -j V2RAY # Transparent proxy for this machine
```

Then set the iptables rule of the UDP traffic transparent proxy, the commands are at below:
```
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100
iptables -t mangle -N V2RAY_MASK
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A V2RAY_MASK -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -p udp -j V2RAY_MASK
```

6. Try to access the walled website directly using your computer/phone. It should be accessible (if you can't, you may have to ask to guide).

7. Write the script to automatically load the above iptables, or use third-party software (such as iptables-persistent), otherwise, iptables will be invalid after the gateway restarts (that is, the transparent proxy will be invalid).


## Notes

* In the above settings, assuming that a foreign website, such as Google, is accessed, the gateway still uses the system DNS for the query, but the returned result is polluted, and the sniffing provided by V2Ray can extract the domain name information from the traffic. VPS parsing. That is to say, every time you plan to visit the website of the wall, the DNS provider knows that GFW may know whether the data will be fed to AI or not, given the urinary nature of domestic companies.
* Sniffing currently only extracts domain names from TLS and HTTP traffic. If there are non-two types of internet traffic, use sniffing to resolve DNS pollution.
* Because I am not familiar with iptables, I always feel that there is a problem with the setting of the transparent proxy for UDP traffic. Please know why my friend should give feedback. If you simply look at the Internet and watch videos, you can only proxy TCP traffic, no UDP transparent proxy.
* Due to the limit of VMESS protocol, online gaming acceleration based on V2Ray transparent proxy doesn't have a good performance.
* Only TCP/UDP package will be proxied by V2Ray, but it can't work with ICMP packets, therefore, the transparent proxy would not support ping/mtr based on ICMP. However, tcping or hping3 works due to they use TCP rather than ICMP.
* According to other transparent proxy tutorials on the internet, they set iptables rules for private addresses like RETURN 127.0.0.0/8, but we suggest that placed them in the V2Ray routing rules for performance consideration.

-------

#### Updates

* 2017-12-05 Initial Version.
* 2017-12-24 Fix the problem of unable to visit Chinese sites.
* 2017-12-27 re-format.
* 2017-12-29 Removed unnecessary iptables rules.
* 2018-01-16 Optimized set up steps.
* 2018-01-21 Add UDP transparent proxy setting
* 2018-04-05 Update
* 2018-08-30 Fix setting up procedures.
* 2018-09-14 Better solution of local requests.

