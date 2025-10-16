# Security

Warp Core Game Engine has the possibility to protect login and registration endpoints from outside requests by using a custom header or whitelisted IP address. Those endpoints are meant to be called mostly by internal network, by outside user management tool. They should not be called directly by the outside world.  

## Custom header protection

There is an additional authentication layer for registration and login endpoints based on the header token. It is possible to configure it by changing setting `security.headerTokenToLogin` in YAML config file. If empty, this authentication will be omitted.  
Request header to authenticate is `game-world-authentication-token`.

## Whitelisted IP address

It is possible to filter requests based on a request IP address source. It may be done by setting `security.whitelistedIp` in YAML config file. If empty, this authentication will be omitted.
