import timingAutoTest from './timingAutoTest/timingAutoTest.js'

function hander(routers) {
  routers.dtest = {
    name: '定时自动测试',
    component: timingAutoTest
  };
}

module.exports = function() {
  this.bindHook('sub_setting_nav', hander);
};
