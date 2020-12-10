# Yapi插件-定时自动测试

定时自动测试插件旨在提供更方便的接口测试功能，更高效的接口健康监测。

充分释放人力、物力，节省接口回归时间，减少其他资源投入。

### 简介

Github:[yapi-plugin-autotest](https://github.com/duicym/yapi-plugin-autotest)

![image-20201210135318265](https://tva1.sinaimg.cn/large/0081Kckwly1gliptrx2i3j327i0n0kac.jpg)

插件安装后，项目详情页面会新增菜单 `设置 -> 定时自动测试` ，配置非常简单。

### 功能

- 开启定时自动测试，开启后会定时执行，并推送钉钉群机器人消息
- 报告发送模式，主要控制钉钉机器人推送消息方式，普通模式成功和失败都推送，告警模式失败才推送
- 服务端自动化测试URL直接使用Yapi自带的测试集合自动化测试
- 钉钉机器人配置钉钉自定义机器人的webhook，注意钉钉机器人安全控制-关键字设置需包含`Yapi`
- cron表达式，用于自动测试的频率，自动测试后会发送钉消息，[参考](https://duicym.github.io/2020/12/08/node-schedule%E7%9A%84%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E8%A1%A8%E8%BE%BE%E5%BC%8F/)

![image-20201210143214765](https://tva1.sinaimg.cn/large/0081Kckwly1gliqy842uhj31sk0mgk0d.jpg)

### 如何使用

#### 1、如何维护测试集合

官方中文教程比较详细，并且有动图，[官方教程](https://hellosean1025.github.io/yapi/documents/case.html)

#### 2、如何配置插件

1. 配置入口在项目的设置里。
   ![image-20201210184701864](https://tva1.sinaimg.cn/large/0081Kckwly1gliybdc2hrj30zu0een27.jpg)
2. 服务端自动化测试URL获取，通过测试集合-》服务端测试获取URL，直接使用。
   ![image-20201210185950381](https://tva1.sinaimg.cn/large/0081Kckwly1gliyontx5fj31hb0kp4ak.jpg)
3. 配置钉钉群机器人webhook。
   <img src="https://tva1.sinaimg.cn/large/0081Kckwly1gliyriddn6j30zo0u0gth.jpg" alt="image-20201210190235004" style="zoom: 25%;" /><img src="https://tva1.sinaimg.cn/large/0081Kckwly1gliys4vw4lj31070u0123.jpg" alt="image-20201210190310915" style="zoom:25%;" />


#### 3、如何查看结果

1. 通过Yapi项目-》动态，项目动态

   ![image-20201210185018235](https://tva1.sinaimg.cn/large/0081Kckwly1gliyeqjoqjj30zp0f6jv1.jpg)

2. 钉钉群聊里的钉钉机器人
   ![image-20201210185115975](https://tva1.sinaimg.cn/large/0081Kckwly1gliyfql7pcj30sr0kmqcd.jpg)

### 本地Yapi如何安装插件

由于该插件暂未发布到npm ，可以使用一下方法安装：

1. 下载插件clone到本地，拷贝到Yapi目录的`项目目录/vendors/node_modules/`下面
2. 修改配置文件，Yapi目录下`项目目录/config.json`,添加插件
3. 打包后重启服务，ykit的打包命令`ykit pack -m`

#### 配置示例

```json
{
   ....
   "plugins": [
      {
         "name": "autotest"
      }
   ]
}
```


