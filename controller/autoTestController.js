const baseController = require('controllers/base.js');
const yapi = require('yapi.js');
const testModel = require('../testModel.js');
const projectModel = require('models/project.js');
const timingAutoUtils = require('../timingAutoUtils.js')

class autoTestController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.testModel = yapi.getInst(testModel);
    this.projectModel = yapi.getInst(projectModel);
    this.timingAutoUtils = yapi.getInst(timingAutoUtils);
  }

  /**
   * 保存定时任务
   * @param {*} ctx 
   */
  async upTest(ctx) {
    let requestBody = ctx.request.body;
    let projectId = requestBody.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, '缺少项目Id'));
    }

    if ((await this.checkAuth(projectId, 'project', 'edit')) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, '没有权限'));
    }

    let result;
    let projectObj = await this.projectModel.get(projectId)

    if(projectObj){
      await this.testModel.delByProjectId(projectId);
    }
    result = await this.testModel.save(requestBody);


    //操作定时任务
    if (requestBody.is_test_open) {
      this.timingAutoUtils.addTestJob(projectId, requestBody.test_cron, requestBody.auto_test_url,  requestBody.ding_url,requestBody.test_mode, requestBody.uid);
    } else {
      this.timingAutoUtils.deleteTestJob(projectId);
    }
    return (ctx.body = yapi.commons.resReturn(result));
  }

  /**
   * 查询定时任务
   * @param {*} ctx 
   */
  async getTest(ctx) {
    let projectId = ctx.query.project_id;
    if (!projectId) {
      return (ctx.body = yapi.commons.resReturn(null, 408, '缺少项目Id'));
    }
    let result = await this.testModel.getByProjectId(projectId);
    return (ctx.body = yapi.commons.resReturn(result));
  }

}


module.exports = autoTestController;