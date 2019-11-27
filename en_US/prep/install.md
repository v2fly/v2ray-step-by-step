# Installation

This section explains how to install V2Ray, which includes server installation and client installation. It should be noted that unlike Shadowsocks, V2Ray does not distinguish between server and client versions from the software, which means that V2Ray running on the server and client is the same software, the difference is only the configuration file. Therefore, the installation of V2Ray is the same on the server and the client, but usually, the VPS uses Linux and the PC uses Windows. Therefore, the default server in this chapter is Linux VPS and the client is Windows PC. If your PC is using a Linux operating system, please refer to the server installation in this article; VPS uses Windows, refer to the client installation of this article; if you are using macOS, please study how to install it yourself, after the installation is finished Continue to look down through this section.

There are a lot of commands in this article that starts with sudo and represent running with administrator privileges. If you are using the root account to execute the commands in the text, you don't need to type sudo.

-----

## Time correction

For V2Ray, its verification method includes time. Even if there is no problem with the configuration, if the time is not correct, you can't connect to the V2Ray server. The server will think that you are an illegal request. So the system time must be correct, as long as the time error is within **90 seconds**.

For VPS (Linux) you can execute the command `date -R` to view the time:
```
$ date -R
Sun, 22 Jan 2017 10:10:36 -0500
```
-0500 in the output indicates that the time zone is West 5, and if converted to East 8 time, it is `2017-01-22 23:10:36`.

If the time is not accurate, you can use `date --set` to modify the time:

```
$ sudo date --set="2017-01-22 16:16:23"
Sun 22 Jan 16:16:23 GMT 2017
```
If your server architecture is OpenVZ, then the above command may not be able to modify the time. Directly send a work order to contact the VPS provider's customer service. It means that the service you are running on the VPS has time requirements and they are required to provide feasible. The method of modifying the system time.

The time calibration of the VPS is followed by a personal computer. 

Whether it's a VPS or a personal computer, the time zone doesn't matter, because V2Ray automatically converts the time zone, but the time must be accurate.

-----

## Install on servers

### Installing by scripts

In the Linux operating system, V2Ray is installed in three ways: script installation, manual installation, and compilation. You can choose one of them. This guide only provides the method of using script to install, and only the script installation is recommended. The script is V2Ray. Officially available. This script can only be used on the Debian series or the Linux operating system that supports Systemd.

** Unless you are farmiliar with Linux or are able to handle problems like command not found on your own, please use a Linux system with Debian 8.x or higher or Ubuntu 16.04 or higher. **
This guide uses the Debian 8.7 system as a demonstration by default.

Firstly, download the install script:

```
$ wget https://install.direct/go.sh
--2018-03-17 22:49:09--  https://install.direct/go.sh
Resolving install.direct (install.direct)... 104.27.174.71, 104.27.175.71, 2400:cb00:2048:1::681b:af47, ...
Connecting to install.direct (install.direct)|104.27.174.71|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/plain]
Saving to: ‘go.sh’

go.sh                             [ <=>                                                 ]  11.24K  --.-KB/s    in 0.001s  

2018-03-17 22:49:09 (17.2 MB/s) - ‘go.sh’ saved [11510]
```

Then execute the script to install V2Ray:

```
$ sudo bash go.sh
Installing curl
Updating software repo
Installing curl
Selecting previously unselected package curl.
(Reading database ... 36028 files and directories currently installed.)
Preparing to unpack .../curl_7.38.0-4+deb8u5_amd64.deb ...
Unpacking curl (7.38.0-4+deb8u5) ...
Processing triggers for man-db (2.7.0.2-5) ...
Setting up curl (7.38.0-4+deb8u5) ...
Installing V2Ray v2.33 on x86_64
Donwloading V2Ray.
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   608    0   608    0     0   2403      0 --:--:-- --:--:-- --:--:--  2412
100 2583k  100 2583k    0     0  1229k      0  0:00:02  0:00:02 --:--:-- 1847k
Installing unzip
Installing unzip
Selecting previously unselected package unzip.
(Reading database ... 36035 files and directories currently installed.)
Preparing to unpack .../unzip_6.0-16+deb8u3_amd64.deb ...
Unpacking unzip (6.0-16+deb8u3) ...
Processing triggers for mime-support (3.58) ...
Processing triggers for man-db (2.7.0.2-5) ...
Setting up unzip (6.0-16+deb8u3) ...
Extracting V2Ray package to /tmp/v2ray.
Archive:  /tmp/v2ray/v2ray.zip
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/readme.md  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/systemd/v2ray.service  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/systemv/v2ray  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/v2ray  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/vpoint_socks_vmess.json  
  inflating: /tmp/v2ray/v2ray-v2.33-linux-64/vpoint_vmess_freedom.json  
PORT:40827
UUID:505f001d-4aa8-4519-9c54-6b65749ee3fb
Created symlink from /etc/systemd/system/multi-user.target.wants/v2ray.service to /lib/systemd/system/v2ray.service.
V2Ray v2.33 is installed.
```

Seeing a prompt like following is a successful installation. If the installation unsuccessful script will have a red prompt statement, you should follow the prompts to debug, and then re-execute the script to install V2Ray after debugging. If you don't understand the error message, just use the translation software to translate it.

In the above prompt, a line "PORT:40827" represents the port number 40827, and a line "UUID:505f001d-4aa8-4519-9c54-6b65749ee3fb" represents the id 505f001d-4aa8-4519-9c54-6b65749ee3fb. Both of these are randomly generated, so don't worry about hitting someone else.

After installation, start V2Ray with the following command:

```
$ sudo systemctl start v2ray
```

After the first installation is complete, V2Ray does not start automatically and you need to manually run the above startup commands. The installation script is executed again on the VPS that has already run V2Ray. The installation script will automatically stop the V2Ray process, upgrade the V2Ray program, and then automatically run V2Ray. The configuration file will not be modified during the upgrade process.

For installation scripts, there are more usages. I won't say much here. You can run `bash go.sh -h` to see help.

### Update V2Ray

On VPS, you can update it by re-executing the installation script. V2Ray will be restarted automatically during the update process, and the configuration file will remain unchanged.

```
$ sudo bash go.sh
```

V2Ray's update strategy is a fast iteration, updated weekly (no surprises). The format of the version number is `vX.Y.Z`, such as `v2.44.0`. v is the fixed letter v, the first letter of version; X, Y, Z are numbers, X is the big version number, and a large version is updated every year (now v4.YZ, V2Ray has reached the fourth year), Y It is a small version that updates a small version every Friday. Z is the official version and the beta version. Z is 0 for the official version, not 0 for the beta version. For example, v4.7.0 is the official version, v4.7.1 is the beta version, and it is recommended to use only the official version. If you do not specify it manually, the V2Ray installation script will only install the latest official version.

Some attentive friends may notice that V2Ray has just released a new version on Friday and updated the official version the next day or two days. This happened because the official version released on Friday had a serious bug affecting the use of a new version. This situation is annoying, but in order to ensure compatibility, performance optimization, etc., you need to ensure that the version is not too old. Therefore, I recommend updating on Thursday. I chose this day because there are major bugs that have been fixed in the first few days. If the small problem (I don't know), it will not affect the use; and the version number and the latest version. It doesn't matter if you are one or two later.

## Install on client
[Click here](https://github.com/v2ray/v2ray-core/releases) to download the V2Ray Windows archive. If it is a 32-bit system, download v2ray-windows-32.zip. If it is a 64-bit system, download it. V2ray-windows-64.zip (Download slow or unable to download, please consider hanging the existing wall software to download). After downloading and unzipping, there will be the following files:
* `v2ray.exe` Run V2Ray program file
* `wv2ray.exe` Same as v2ray.exe, the difference is that wv2ray.exe is running in the background, unlike v2ray.exe there will be a window similar to the cmd console. Choose one of v2ray.exe and wv2ray.exe when running V2Ray.
* `config.json` V2Ray configuration file, we will configure V2Ray later to modify this file.
* `v2ctl.exe` V2Ray tool, has a variety of functions, except for special purposes, usually called by v2ray.exe, users do not care too much
* `geosite.dat` domain name file for routing
* `geoip.dat` IP file for routing
* `Others` Other than the files mentioned above, the others are not necessary files for running V2Ray. For a more detailed explanation, you can see the readme.md file in the doc folder, which can be opened by Notepad or other text editors.

<!-- ~~~~ -->
You can actually run V2Ray by double-clicking v2ray.exe (or wv2ray.exe), and V2Ray will read the configuration in config.json to connect to the server.
![](../resource/images/v2rayrunnig.png)

V2Ray gives all the options to the user, it does not automatically set the system proxy, so you also need to set the proxy in the browser. For example, Firefox (Firefox), click Menu -> Options -> Advanced -> Settings -> Manual Proxy Settings, fill in 127.0.0.1 in SOCKS Host, fill in 1080 in the following port, and then proxy DNS when using SOCKS v5 ( This tick option is called remote DNS in the old version. The operation diagram is as follows:

![](../resource/images/firefox_proxy_setting1.png)

![](../resource/images/firefox_proxy_setting2.png)

![](../resource/images/firefox_proxy_setting3.png)

![](../resource/images/firefox_proxy_setting4.png)

If you are using another browser, please find out how to set up the SOCKS proxy on the Internet.


------------
#### Updates

- 2017-08-06 Added some tips.
- 2017-08-05 Use up-to-date script [From V2Ray repo](https://raw.githubusercontent.com/v2ray/v2ray-core/master/release/install-release.sh)
- 2017-10-07 V2Ray official server has been fixed 
- 2017-12-22 Remove official server address
- 2017-12-29 Add IPFS
- 2018-04-05 Update
- 2018-11-11 Update
- 2019-01-19 Update
