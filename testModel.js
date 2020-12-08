const yapi = require('yapi.js');
const baseModel = require('models/base.js');

class testModel extends baseModel {
  getName() {
    return 'interface_auto_test';
  }

  getSchema() {
    return {
      uid: { type: Number},
      project_id: { type: Number, required: true , unique: true},
      //是否开启自动定时测试
      is_test_open: { type: Boolean, default: false },
      //自动测试定时任务的cron表达式
      test_cron: String,
      //服务器自动测试url
      auto_test_url: String,
      //钉钉机器人
      ding_url: String,
      //发送模式  普通、告警等
      test_mode: String,

      add_time: Number,
      up_time: Number,
    };
  }

  getByProjectId(id) {
    return this.model.findOne({
      project_id: id
    }) 
  }

  delByProjectId(project_id){
    return this.model.remove({
      project_id: project_id
    })
  }
  upByProjectId(data) {
    let projectId = data.project_id;
    let projectObj = this.getByProjectId(projectId)
    if(projectObj._data){
      this.delByProjectId(projectId);
      data.up_time = yapi.commons.time();
      return this.model.update({
        project_id: projectId
      }, data)
    } else {
      save(data)
    }
  }

  save(data) {
    data.up_time = yapi.commons.time();
    data.add_time = yapi.commons.time();
    let m = new this.model(data);
    return m.save();
  }

  listAll() {
    return this.model
      .find({})
      .select(
        '_id uid project_id add_time up_time is_test_open test_cron auto_test_url ding_url test_mode'
      )
      .sort({ _id: -1 })
      .exec();
  }

  up(data) {
    let id = data.id;
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.model.update({
      _id: id
    }, data)
  }

  upById(id, data) {
    delete data.id;
    data.up_time = yapi.commons.time();
    return this.model.update({
      _id: id
    }, data)
  }

  del(id){
    return this.model.remove({
      _id: id
    })
  }

}

module.exports = testModel;