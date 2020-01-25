todo:
按钮的逻辑关系，数据库的连接，将http连接改为websocket连接。
bug:
传输exe文件时，会出现Error: EBUSY: resource busy or locked
https://github.com/npm/npm/issues/13461
这取决于使用者环境中的反恶意软件，所以不建议传输exe文件。测试传输大文件续传（ubuntu-18.04.3的镜像）通过。