# Memory optimization 

In order to provide a better performance, V2Ray has a caching mechanism. It caches part of the traffic data when there are apparent speed differences between upstream and downstream. As a practical example, if you are downloading some videos, the speed from website to your proxy server is 500 Mbps, and the proxy server has only 50 Mbps to your home broadband. V2Ray will download the video to VPS in prior and then relay these data to your desktop computer. By default, V2Ray has a cache size of 10 MBytes per connection (the default cache is now up to 512 KBytes), which means that if the task of downloading opens 32 threads, V2Ray will cache up to 320 MBytes of data. As a result, VPS with only 256 MBytes or even 128 MBytes of memory will suffer from the cache mechanism. Fortunately, the size of the cache can be modified. Reducing the size of the cache would reduce memory usage and is friendly to small memory machines.

## Modify the cache usage quota

### By editing the environmental variables

(** Note: After multiple versions of iterative optimisations, V2Ray's memory footprint has been dramatically reduced. Now, the default cache size is only 512 KBytes; the cache parameter is not applicable through environment variables. **)

On you VPS, edit /etc/systemd/system/v2ray.service , edit `ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json`  as  `ExecStart=/usr/bin/env v2ray.ray.buffer.size=1 /usr/bin/v2ray/v2ray -config /etc/v2ray/config.json`. Then save it, excute the following command
```plain
$ sudo systemctl daemon-reload && sudo systemctl restart v2ray.service
```
The above v2ray.ray.buffer.size is the cached variable. If it is set to 1, it doesn't matter much (personal feeling, no actual test comparison).

### Change cache quota in configuration file

In the above modification of the cache size by environment variables, there is a problem that the unit of v2ray.ray.buffer.size is Mbytes, and the minimum can only be changed to 1 Mbytes. If it is changed to 0, it means that the cache is unlimited. However, the cache size can also be modified in the configuration file. The unit is Kbytes. If it is set to 0 in the configuration, it means that the cache is disabled. For those who need to set the cache to be smaller, you can refer to the local policy section of V2Ray official documentation. The configuration is relatively simple. It would not be discussed here.

#### Updates

- 2018-05-01 Initial release
- 2018-08-02 Add modify configuration file quota setting
- 2018-11-11 v2ray.ray.buffer.size deprecated
