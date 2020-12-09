const schedule = require('node-schedule');
const openController = require('controllers/open.js');
const projectModel = require('models/project.js');
const testModel = require('./testModel.js');
const yapi = require('yapi.js')

const jobMap = new Map();
const axios  = require('axios');
const dingRobotSender = require('./dding.js');
const markdown = require('./markdown.js');
let _config = {
    host: 'http://localhost:3000'
};


class timingAutoUtils {
    static get config() {
        return _config;
    }
    static set config(options) {
        if (options && typeof options == 'object') {
            _config = Object.assign(_config, options);
        }
    }
    constructor(ctx) {
        this.ctx = ctx;
        this.openController = yapi.getInst(openController);
        this.testModel = yapi.getInst(testModel);
        this.projectModel = yapi.getInst(projectModel);
        this.init()
    }

    //初始化定时任务
    async init() {
        let allTestJob = await this.testModel.listAll();
        for (let i = 0, len = allTestJob.length; i < len; i++) {
            let testItem = allTestJob[i];
            if (testItem.is_test_open) {
                this.addTestJob(testItem.project_id, testItem.test_cron, testItem.auto_test_url, testItem.ding_url, testItem.test_mode, testItem.uid);
            }
        }
    }

    /**
     * 新增同步任务.
     * @param {*} projectId 项目id
     * @param {*} cronExpression cron表达式,针对定时任务
     * @param {*} autoTestUrl 获取字段测试的地址
     * @param {*} dingUrl 机器人
     * @param {*} testMode 模式
     * @param {*} uid 用户id
     */
    async addTestJob(projectId, cronExpression, autoTestUrl, dingUrl, testMode, uid) {
        if(!autoTestUrl)return;
        //立即执行一次
        this.doTestJob(projectId, autoTestUrl, testMode, dingUrl, uid);
        let scheduleItem = schedule.scheduleJob(cronExpression, async () => {
            this.doTestJob(projectId, autoTestUrl, testMode, dingUrl, uid);
        });

        //判断是否已经存在这个任务
        let jobItem = jobMap.get(projectId);
        if (jobItem) {
            jobItem.cancel();
        }
        jobMap.set(projectId, scheduleItem);
    }

    //执行测试
    async doTestJob(projectId, autoTestUrl, testMode, dingUrl, uid) {
        yapi.commons.log('定时器触发, autoTestUrl:' + autoTestUrl + ",发送模式:" + testMode);
        let result = await axios.get(autoTestUrl);
        let urlObj = this.getColObj(autoTestUrl)
        //执行成功，发送钉钉消息
        if (testMode === "normal") {
            await this.sendTo(dingUrl,projectId,result.data,urlObj.id)
        } else if(testMode === "warn" && result.data.message.failedNum!==0){
            await this.sendTo(dingUrl,projectId,result.data,urlObj.id)
        }
        //记录日志
        this.saveTestLog(result.data, testMode,autoTestUrl, uid, projectId);
    }

    async sendTo(url,projectId,data,colId) {
        if(!data){
            return
        }
        let project = await this.projectModel.get(projectId);

        const title = this.buildTitle(project,data);
        const text = this.buildText(projectId,project,data,title,colId);
        let sender = new dingRobotSender(url);
        await sender.sendMarkdown(title, text);
    }
    buildTitle(project,data) {
        const name = project ? project.name : '有个项目';
        let pieces = [name];
        const result = data.message.failedNum ===0 ? '自动测试全部通过' : '有测试用例失败';
        pieces.push(result, `[Yapi]`);
        return pieces.join('');
    }

    buildText(projectId,project,data,title,colId) {
        let result = data.message.msg;
        let failedNum = data.message.failedNum;
        let projectLink = this.projectLink(projectId,colId)
        let pieces = [
            markdown.head3(title), markdown.NewLine,
            '结果: ', result, markdown.NewLine,
            '项目: ', markdown.link(projectLink, project.name),markdown.NewLine,
        ];
        if(failedNum!==0){
            pieces.push('失败接口: ',markdown.NewLine)
            let failedList = data.list.filter(item=> item.code!==0)
            for (let i = 0; i < failedList.length; i++) {
                let item = failedList[i]
                pieces.push(markdown.list(`${item.name}(${item.path})`), markdown.NewLine)
            }
        }else {
            pieces.push('太棒了！全部通过！', markdown.NewLine)
            pieces.push(markdown.image("https://tva1.sinaimg.cn/large/0081Kckwly1glhenyovruj30go0b4dgr.jpg",'全部通过'), markdown.NewLine)
        }
        return pieces.join('');
    }
    projectLink(projectId,colId) {
        return `${timingAutoUtils.config.host}/project/${projectId}/interface/col/${colId}`;
    }
    getColObj(url){
        let params = {};
        let urls = url.split("?");
        let arr = urls[1].split("&");
        for (let i = 0, l = arr.length; i < l; i++) {
            let a = arr[i].split("=");
            params[a[0]] = a[1];
        }
        return params;
    }

    /**
     * 记录日志
     * @param {*} data
     * @param {*} testMode
     * @param {*} autoTestUrl
     * @param {*} uid
     * @param {*} projectId
     */
    saveTestLog(data, testMode, autoTestUrl, uid, projectId) {
        yapi.commons.saveLog({
            content: '自动测试结果:' + data.message.msg,
            type: 'project',
            uid: uid,
            username: "自动同步用户",
            typeid: projectId,
            data: data
        });
    }

    getUid(uid) {
        return parseInt(uid, 10);
    }
    deleteTestJob(projectId) {
        let jobItem = jobMap.get(projectId);
        if (jobItem) {
            jobItem.cancel();
        }
    }

}

module.exports = timingAutoUtils;