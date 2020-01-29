## main
这个一个react hooks驱动的支持续传的文件上传组件。感谢typescript的强大，让我对此仓库的代码有了统一的接口，前端的所有类型规范在src/global.ts中定义，所有的工具函数在src/utils.ts中声明。后端用express构建，可按实际需要更换为任意的后端框架。此仓库所用工具库，可以到package.json查看，不一一列出。最后，欢迎提issue指出bug和错误。
## use
```js
npm install
npm start
```
## todo
多文件并发上传，限制并发连接数，切片策略，按钮的逻辑关系，数据库的连接记录文件更改，将http连接改为websocke连接，将后端的检查文件缓存了
## bug
传输exe文件时，会出现Error: EBUSY: resource busy or locked
https://github.com/npm/npm/issues/13461
这取决于使用者环境中的反恶意软件，所以不建议传输exe文件。
实测在win10下，npm script 并行执行的是 | 而不是linux的是 &（暂时没有linux系统进行测试），请使用linux的同学自行修改。
（题外话，&& 是串行执行，&是并行执行）
npm script
## test
测试环境：win10
测试传输大文件续传（ubuntu-18.04.3的镜像）通过。
## updata
- 移除multipart，完全改用[XMLHttpRequest](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data)，不再采用FormData进行上传二进制数据。
- 更新文件切片策略，针对文件大小，选择不同的文件切片大小。
## thanks
感谢[yeyan1996](https://github.com/yeyan1996/file-upload)，让我模仿构建了此组件。他仓库还有一篇详细介绍的文章，感兴趣的同学可以前去浏览（虽然我没详细看过）。
