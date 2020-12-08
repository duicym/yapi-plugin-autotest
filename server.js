const controller = require('./controller/autoTestController.js');
const yapi =require('yapi.js');
const timingAutoUtils = require('./timingAutoUtils.js');

module.exports = function (options) {
  yapi.getInst(timingAutoUtils);
  timingAutoUtils.config = options

  this.bindHook('add_router', function (addRouter) {
    addRouter({
      controller: controller,
      method: 'get',
      path: 'autoTest/get',
      action: 'getTest'
    });
    addRouter({
      controller: controller,
      method: 'post',
      path: 'autoTest/save',
      action: 'upTest'
    });
  });

};