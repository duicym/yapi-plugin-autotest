import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Switch, Button, Icon, Tooltip, message, Input, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import axios from 'axios';

// layout
const formItemLayout = {
  labelCol: {
    lg: { span: 5 },
    xs: { span: 24 },
    sm: { span: 10 }
  },
  wrapperCol: {
    lg: { span: 16 },
    xs: { span: 24 },
    sm: { span: 12 }
  },
  className: 'form-item'
};
const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 16,
      offset: 11
    }
  }
};

@connect(
  state => {
    return {
      projectMsg: state.project.currProject
    };
  }
)
@Form.create()
export default class TimingAutoTest extends Component {
  static propTypes = {
    form: PropTypes.object,
    match: PropTypes.object,
    projectId: PropTypes.number,
    projectMsg: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      test_data: { is_test_open: false }
    };
  }

  handleSubmit = async () => {
    const { form, projectId } = this.props;
    let params = {
      project_id: projectId,
      is_test_open: this.state.test_data.is_test_open,
      uid: this.props.projectMsg.uid
    };
    if (this.state.test_data._id) {
      params.id = this.state.test_data._id;
    }
    form.validateFields(async (err, values) => {
      if (!err) {
        let assignValue = Object.assign(params, values);
        await axios.post('/api/plugin/autoTest/save', assignValue).then(res => {
          if (res.data.errcode === 0) {
            message.success('保存成功');
          } else {
            message.error(res.data.errmsg);
          }
        });
      }
    });

  };

  validAutoTestUrl = async (rule, value, callback) => {
    if(!value)return;
    if(value.search("/api/open/run_auto_test")===-1) {
      callback('测试地址不正确，要包含/api/open/run_auto_test');
    } 
    callback()
  }
  validDingDingUrl = async (rule, value, callback) => {
    if(!value)return;
    if(value.search("oapi.dingtalk.com/robot/send")===-1) {
      callback('机器人地址不正确，要包含oapi.dingtalk.com/robot/send');
    }
    callback()
  }

  componentWillMount() {
    //查询
    this.setState({
      test_data: {}
    });
    //默认每10分钟一次
    this.setState({
      default_corn: '*/10 * * * *'
    });
    this.getTestData();
  }

  async getTestData() {
    let projectId = this.props.projectMsg._id;
    let result = await axios.get('/api/plugin/autoTest/get?project_id=' + projectId);
    if (result.data.errcode === 0) {
      if (result.data.data) {
        this.setState({
          test_data: result.data.data
        });
      }
    }
  }

  // 是否开启
  onChange = v => {
    let test_data = this.state.test_data;
    test_data.is_test_open = v;
    this.setState({
      test_data: test_data
    });
  };

  test_cronCheck(rule, value, callback){
    if(!value)return;
    value = value.trim();
    if(value.split(/ +/).length > 5){
      callback('不支持秒级别的设置，建议使用 "*/10 * * * *" ,每隔10分钟更新')
    }
    callback()
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="m-panel">
        <Form>
          <FormItem
            label="是否开启定时自动测试"
            {...formItemLayout}
          >
            <Switch
              checked={this.state.test_data.is_test_open}
              onChange={this.onChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />
            {this.state.test_data.id != null ? (<div><a href="http://localhost:3000/project/'+this.state.test_data.id+'/interface/col">查看</a></div>) : null}
          </FormItem>

          <div>
            <FormItem {...formItemLayout} label={
              <span className="label">
                报告发送方式&nbsp;
                <Tooltip
                  title={
                    <div>
                      <h3 style={{ color: 'white' }}>普通模式</h3>
                      <p>每次执行后发送</p>
                      <br />
                      <h3 style={{ color: 'white' }}>告警模式</h3>
                      <p>
                        仅异常或断言时发送
                      </p>
                    </div>
                  }
                >
                  <Icon type="question-circle-o" />
                </Tooltip>{' '}
              </span>
            }>
              {getFieldDecorator('test_mode', {
                initialValue: this.state.test_data.test_mode,
                rules: [
                  {
                    required: true,
                    message: '请选择发送方式!'
                  }
                ]
              })(

                <Select>
                  <Option value="normal">普通模式</Option>
                  <Option value="warn">告警模式</Option>
                </Select>
              )}
            </FormItem>

            <FormItem {...formItemLayout} label={
              <span className="label">
                服务端自动化测试URL&nbsp;
                <Tooltip
                    title={
                      <div>
                        <h3 style={{ color: 'white' }}>获取方式</h3>
                        <p>接口->测试集合->服务端测试->服务自动化测试->复制按钮</p>
                        <br />
                        <p>复制后的URL填写在此处</p>
                      </div>
                    }
                >
                  <Icon type="question-circle-o" />
                </Tooltip>{' '}
                </span>
                }>
              {getFieldDecorator('auto_test_url', {
                rules: [
                  {
                    required: true,
                    message: '输入服务端自动化测试URL地址'
                  },
                  {
                    validator: this.validAutoTestUrl
                  }
                ],
                validateTrigger: 'onBlur',
                initialValue: this.state.test_data.auto_test_url
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label={
              <span className="label">
                钉钉机器人&nbsp;
                <Tooltip
                    title={
                      <div>
                        <h3 style={{ color: 'white' }}>机器人安全设置</h3>
                        <p>自定义关键词的情况下，需要添加如下关键词：</p>
                        <br />
                        <p>YApi</p>
                      </div>
                    }
                >
                  <Icon type="question-circle-o" />
                </Tooltip>{' '}
                </span>
            }>
              {getFieldDecorator('ding_url', {
                rules: [
                  {
                    required: true,
                    message: '输入钉钉机器人 Webhook'
                  },
                  {
                    validator: this.validDingDingUrl
                  }
                ],
                validateTrigger: 'onBlur',
                initialValue: this.state.test_data.ding_url
              })(<Input />)}
            </FormItem>

            <FormItem {...formItemLayout} label={<span>node-schedule表达式(默认10分钟更新一次)&nbsp;<a href="https://duicym.github.io/2020/12/08/node-schedule%E7%9A%84%E5%AE%9A%E6%97%B6%E4%BB%BB%E5%8A%A1%E8%A1%A8%E8%BE%BE%E5%BC%8F/">参考</a></span>}>
              {getFieldDecorator('test_cron', {
                rules: [
                  {
                    required: true,
                    message: '输入node-schedule的类cron表达式!'
                  },
                  {
                    validator: this.test_cronCheck
                  }
                ],
                initialValue: this.state.test_data.test_cron ? this.state.test_data.test_cron : this.state.default_corn
              })(<Input />)}
            </FormItem>
          </div>
          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" icon="save" size="large" onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
