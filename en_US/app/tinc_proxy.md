# Mount the Tinc LAN node
::: warning
This configuration example is based on CentOS 8, please modify as appropriate.
:::
Nowadays, Cloudflare's CDN is widely used to prevent GFW from blocking IP, but at present Cloudflare has long been overwhelmed with traffic forwarding for this purpose, especially the frequent occurrence of CDN node explosion problems at night, providing a new way to alleviate Cloudflare's perennial night The problem of slowness.

This way of constructing the V2Ray solution is to use the intranet penetration software to use all the VPSs in your hands as network nodes to select the IP that is not shielded by the GFW as the master node, and all V2Ray data request the master node to be diverted to Other VPS: When the GFW blocks the IP of the master node, let other nodes rise to the master node, and the original master node drops to the load node.

> This mode is similar to the `Follwer/Leader` mode. `Leader` selects the best VPS to proxy all V2ray traffic and forward it to `Follwer`.

Please note: The ideas and methods provided in this tutorial must have at least a certain level of operating ability for the Linux system. If you don't have a clear understanding, please don't mess around!

The program requirements here have the following requirements:
* At least two servers
* Nginx-based upstream
* Tinc-based intranet penetration node function

The main configuration purpose here:
   If the server IP is blocked, another server will be used directly to participate in node forwarding. Generally, GFW will block the IP for a time limit, and it will continue to use the original IP in rotation after the blocking period such as through the node forwarding.

## Tinc installation
The kernel's `ip_foward` function must be enabled before the configuration starts. If it is not enabled, please manually enable forwarding.
```bash
$ sudo sysctl -a|grep ip_forward # Check whether ip_forward forwarding is enabled [net.ipv4.ip_forward=1]
```

The reason why Tinc is used as the penetration software in this example is because it is simple enough and dependent on the performance of C language programs, and Tinc's IPv6 support is not bad, and the configuration is relatively simple and not that complicated. Other frp, ngrok, etc. can be customized Get used to choosing.

Some distribution sources have built-in Tinc, but this article uses compile and install to deploy Tinc.
The download address of the latest version of Tinc can be found on [Official Website](https://www.tinc-vpn.org/):

### Tinc compile and install
```bash
$ cd /tmp # My usual practice is to download and compile in the /tmp directory to prevent downloading and compilation from being scattered in other directories
$ wget https://www.tinc-vpn.org/packages/tinc-1.0.36.tar.gz -O tinc.tar.gz # Download and get the latest version of the source code package
$ tar -xf tinc.tar.gz --one-top-level --strip-components=1 # Unzip the compressed package
$ cd tinc # enter the folder
```

Before starting the compilation work, you need to install the corresponding dependent libraries:
```bash
$ sudo dnf install gcc cmake make openssl-devel zlib-devel lzo-devel # CentOS installation, other distributions can be searched and installed by name
```

After confirming the installation of the dependent library, start compiling and installing:
```bash
$ ./configure
$ make
$ sudo make install # Root permission is needed to install here
$ tincd --version # Test and print the version number after installation
```

### systemd service file modification

The compressed package downloaded here comes with two system services, which can actually be modified:
* /tmp/tinc/systemd/tinc.service.in
* /tmp/tinc/systemd/tinc@.service.in

`tinc.service.in` file configuration:

Content modification:
```ini
# Shield `WorkingDirectory=@sysconfdir@/tinc`
# Add the following content
WorkingDirectory=/usr/local/etc/tinc
```

Copy to the systemd folder:
```bash
$ sudo cp /tmp/tinc/systemd/tinc.service.in /lib/systemd/system/tinc.service # Copy to the system service folder
$ sudo vi /lib/systemd/system/tinc.service # Modify content
```

`tinc@.service.in` file configuration:

Content modification:
```ini
# Block the following
# WorkingDirectory=@sysconfdir@/tinc/%i
# ExecStart=@sbindir@/tincd -n %i -D
# ExecReload=@sbindir@/tincd -n %i -kHUP
# Add the following content
WorkingDirectory=/usr/local/etc/tinc/%i
ExecStart=/usr/local/sbin/tincd -n %i -D
ExecReload=/usr/local/sbin/tincd -n %i -kHUP
```

Copy to the systemd folder:
```bash
$ sudo cp /tmp/tinc/systemd/tinc@.service.in /lib/systemd/system/tinc@.service # Copy to the system service folder
$ sudo vi /lib/systemd/system/tinc@.service # Modify content
```

### Finishing work

After completing the configuration copy and modification, prepare the final system configuration loading process without any problems
```bash
$ sudo mkdir -p /usr/local/var/run/ # Create and run PID directory
$ sudo mkdir -p /usr/local/etc/tinc # Create a configuration directory for service configuration loading
$ sudo ln -s /usr/local/etc/tinc /etc/tinc # Set the soft link of the /etc configuration file
$ sudo systemctl unmask tinc # refresh the Systemctl system service just loaded
```

## Build a tinc node

It should be stated here that the following specifications need to be clarified:
* 10.0.0.1 is the main node that mainly accepts client V2ray data
* 10.0.0.2~n are the load nodes forwarded by the agent
* The master node uses Nginx to forward data traffic to 10.0.0.2~n to other servers
* All nodes need to install Tinc and Nginx

### Construction of the main node

Build information for creating a node:
```bash
$ cd /etc/tinc # Enter the configuration directory
$ sudo mkdir -p /etc/tinc/v2ray/hosts # Create a V2ray penetration node and set it to allow access to the host configuration directory
```

Edit the configuration file (/etc/tinc/v2ray/tinc.conf):
```ini
## Here Name is the name of the configuration file. I generally like to name this file node `master-slave`/`node_01-node_02`
## The default port monitors 665, here is set 20665, generally I don't like to use the default port directly, it is easy to be scanned out of the corresponding service by the robot
## Here routing mode uses switch mode [Switch ], other modes can refer to the official website configuration
Name = master
Interface = v2ray
Port=20065
Mode=switch
```

Write the details of the master node:
```bash
$ sudo vi /etc/tinc/v2ray/hosts/master
```

Main node link information content:
```ini
## Here Address represents own address IP and port opening information
## If the server IP is Ban, you need to switch the master node to the load node and remember to change the IP to the master node IP
## Subnet represents the address of the intranet penetration node
Address = VPS own IP 20665
Subnet = 10.0.0.1/32
```

After completion, you need to generate the connection key, and he will attach the key information at the end of the master file
::: tip
The general format here is tincd -n node name -K [2048/4096, the encryption level is not recommended too high, V2Ray itself is with encrypted unnecessary data and then too complex encryption]
:::

```bash
$ sudo /usr/local/sbin/tincd -n v2ray -K 2048
```

Write a script to start the virtual switch (/etc/tinc/v2ray/tinc-up), the content is as follows:
```bash
#!/bin/bash

# 10.0.0.1 represents the node address occupied by the node, which must be unique
ifconfig $INTERFACE 10.0.0.1 netmask 255.255.255.0
```

Write the error shutdown script (/etc/tinc/v2ray/tinc-down) as follows:
```bash
#!/bin/bash
ifconfig $INTERFACE down
```


Finish the work, and finally grant script execution permissions and manually open ports/services:
```bash
$ sudo chmod +x /etc/tinc/v2ray/tinc-* # Grant script startup permission,
$ sudo systemctl start tinc@v2ray # start system service
$ sudo firewall-cmd --zone=public --add-port=20665/tcp --permanent # If there is a firewall, remember to open the external port
$ sudo firewall-cmd --reload # Update firewall configuration
$ sudo systemctl enable tinc@v2ray # Automatically start the service at boot, this is actually recommended to debug and then enable
```

### Construction of load point

The installation and configuration method is basically the same as that of the master node. Here, the process is roughly summarized below, and only the key configuration nodes are noted.
```bash
$ sudo mkdir /etc/tinc/v2ray/hosts # Confirm the configuration file directory consistent with the master node
```

The configuration node information (/etc/tinc/v2ray/tinc.conf) is slightly different here, please refer to the following example:
```ini
# Name represents the configuration file name of the load node [hosts/slave_01], this file will be placed in the hosts directory of the master node later
# ConnectTo represents the intranet node configuration file [hosts/master] through which the access is penetrated. This file is the configuration file that copies the hosts of the master node
# Points to know here:
# * Name cannot conflict with other nodes
# * ConnectTo must be a configuration file with a key attached to the master node
# * Interface/Mode must be consistent with the master node configuration
Name = slave_01
Interface = v2ray
ConnectTo = master
Mode=switch
```

Configure the link (/etc/tinc/v2ray/hosts/slave_01), the content is as follows:
```ini
# Note that this must correspond to 10.0.0.2～255 of the server
# This is the intranet IP of the node
Subnet = 10.0.0.2/32
```

Generate key information after the final configuration:
```bash
$ sudo /usr/local/sbin/tincd -n v2ray -K
```

The content of the startup script of the load node is different [/etc/tinc/v2ray/tinc-up]
```bash
#!/bin/bash

# The IP address here is changed to the address selected by the node
ifconfig $INTERFACE 10.0.0.2 netmask 255.255.255.0
```

When starting, please remember to copy the hosts file under the master node/load node to their respective directories to ensure that the hosts directories of both parties have the following corresponding contents:
```plain
$ ls -l /etc/v2ray/hosts
  master [master node file]
  slave_01 [load node 01]
  slave_02 [load node 02]
  ...
```

Here, the load node does not need to open any ports, all connection information is recorded in the master node information (public network IP and port information).
But you need to manually configure the firewall, and all load nodes are allowed to pass the internal 10.0.0.1 (mentioned in the following chapter).

Tinc does not have a log file function. Here is a recommended way to debug the connection, use SSH connection to test whether it is connected:
```bash
$ ssh root@10.0.0.1 # The load node tests whether ssh can access the master node through the suspended 10.0.0.1
```

## Load node V2Ray construction (10.0.0.2~n)

The V2Ray installed here directly refers to other configurations, just need to explain that it is not recommended to use any forwarding/masquerading protocol for processing;
Directly use TCP to forward data, because Tinc itself has a data security encryption function, if you choose other V2ray other camouflage protocols, the performance will be greatly reduced.
All load nodes need to install V2Ray, and the configuration file is basically the same:
```json
{
    "log": {
        "access": "/var/log/v2ray/access.log",
        "error": "/var/log/v2ray/error.log",
        "loglevel": "warning"
    },
    "inbounds": [
    {
        "port": 10000,//Start a V2ray port randomly here, and directly follow the load node request 10.0.0.2:10000/10.0.0.3:10000
        "listen":"0.0.0.0",//Open the public network here, remember that firewall-cmd I generally use firewal-cmd to manage the port, here there is no way to access it through the public network.
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

After starting V2Ray, you need to release the 10.0.0.x address in a targeted manner. Remember to change the port to the V2Ray server port information under the load node:
```bash
$ sudo firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="10.0.0.1" port protocol="tcp" port="[V2Ray's server port]" accept"
```

In this way, the load node of V2Ray is also configured.

## Master node reverse proxy (10.0.0.1)

I use Nginx upstream to reverse proxy traffic to other load nodes (/etc/nginx/nginx.conf), the configuration is as follows:
```plain
events {
    # This system will automatically select it, optional
    use epoll;
    # This sees the maximum connection configured by the machine [sudo ulimit -n # command to view the maximum]
    worker_connections 65535;
}

//Mainly add configuration option
stream{
  include /etc/nginx/stream.d/*.conf;
}

http{
  //........
}
```

Write the Nginx reverse proxy configuration (/etc/nginx/stream.d/v2ray.conf ), the content is as follows:
```plain
upstream v2ray {

  hash $remote_addr consistent;
  server 10.0.0.2:10000 weight=5;
  server 10.0.0.3:10000 weight=5;
  server 10.0.0.4:10000 weight=5;
  //.......
  //The master node continuously forwards the corresponding intranet penetration node according to the average weight
}

# Suspend TCP reverse proxy service
server {
  # Set up external access to V2ray port
  # v2ray's clients all request the master node: port 6666, which is then forwarded to the designated intranet node by the node's intranet penetration
  listen 6666;

  # Here directly forward to the data configuration configured above
  proxy_pass v2ray;
}
```

After completion, start the master node and connect to V2ray to check whether the data can be forwarded correctly.
::: tip
 If there is a firewall, please remember to open the port corresponding to Nginx for access.
:::
## common problem

Q: If the IP of the master node is blocked, how to convert the load node to the master node?
A: Copy the /etc/tinc/v2ray directory of the master node directly to the available load node (remember to backup), change the public network IP of all nodes /etc/tinc/vpn/hosts/master files to the new node IP, copy Nginx can start the configuration, and open the Tinc or Nginx port at the same time.


Q: Can I participate in the node through a Chinese server?
A: In the current test, if Chinese server nodes participate in load forwarding, there will be frequent timeouts and stalls. The efficiency is not as good as direct connection to overseas servers, but the speed is faster than WSS+CDN, and the stability is poor.


Q: Can I use a more advanced masquerading protocol instead of TCP?
A: It can be used but not recommended. Tinc itself is an attached secure data encryption function. A large number of encryption shell processes will cause a sharp drop in performance.

