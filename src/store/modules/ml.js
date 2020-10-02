
/**
 * [大面料模块]
 */
import Api from '@/config/api'
import Tool from '../tool.js'
import { MessageBox } from 'element-ui'

const Ml = {
  namespaced: true,
  state: {
    loadingPage: false, //       分页：页面
    loading: {}, //              分页：折叠部分
    /* 编辑 / 提交 / 撤销审核 / 帮助 */
    item_id: '', //              项目ID
    item_gantt_id: '', //        项目甘特表主键id
    item_gantt_detail_id: '', // 甘特表明细主键id
    /* 高级查询 */
    isDialog: false, //          是否显示
    filter_data: [], //          搜索值
    /* 表格数据：外部 */
    tableData_1: [], //          表格数据
    tableNodes: [], //           表格节点
    /* 表格数据：内部 */
    tableData_2: {}, //          内部节点（列）
    node_name: '', //            搜索：节点名称
    status: '', //               搜索：节点状态
    /* 分页：外部 */
    pagenum: 1, //               页数
    rownum: 10, //               每页条数
    pageCount: 0, //             总条数
    /* 分页：内部 */
    pageObj: {}
  },

  /* 方法 */
  mutations: {},

  /* 计算属性 */
  getters: {},

  /* 异步操作 */
  actions: {
    /**
     * [请求：表格基础数据]
     */
    A_tableData({ state }) {
      const { pagenum, rownum, loadingPage, filter_data } = state
      if (!loadingPage) {
        state.loadingPage = true
        // const employeeid = '965BAD8F4EF5C14CE4F607E77D30B9B5'
        const employeeid = ''
        /* 发起请求 */
        const name = '内控节点管理列表'
        const obj = { filter_data: JSON.stringify(filter_data), gantt_type: 2, pageindex: parseInt(pagenum) - 1, pagesize: rownum, employeeid }
        const suc = function (res) {
          console.log('res ----- ', res)
          const { itemGanttMapList: data = [], count: nums, nodeMapList: title = [], yjts = 10 } = res.data
          /* 给数据添加属性 */
          const list = Tool.mapData(data, yjts, 'itemNodeMapList')
          /* 赋值 */
          state.tableData_1 = list //         表格数据
          state.pageCount = parseInt(nums) // 总条数
          state.tableNodes = title //         列：表格外层
          state.loadingPage = false //        隐藏加载动画
        }
        Api({ name, obj, suc })
      }
    },
    /**
     * [请求：表格折叠数据]
     * @param {[Object]} row 当前展开行的数据
     */
    A_tableOtherData({ state }, { row }) {
      const { item_gantt_id, index } = row
      const { pagenum, rownum } = state.pageObj[index]
      const { node_name, status } = state
      // const empid = '965BAD8F4EF5C14CE4F607E77D30B9B5'
      const empid = ''
      /* 发起请求 */
      const name = '节点列表'
      const obj = { item_gantt_id, page: parseInt(pagenum) - 1, num: rownum, status, node_name, empid }
      const suc = function (res) {
        const { data, nums } = res
        const { tableData_2, loading } = state
        /* 给数据添加属性 */
        const { yjts } = state
        const list = Tool.mapData(data, yjts)
        /* 赋值 */
        tableData_2[index] = list
        loading[index] = false
        state.tableData_2 = Object.assign({}, tableData_2)
        state.loading = Object.assign({}, loading)
        state.pageObj[index].pageCount = nums
      }
      const err = function () {
        /* 关闭：加载动画 */
        state.loading[index] = false
      }
      Api({ name, obj, suc, err })
    },
    /**
     * [请求：节点完成前验证]
     */
    A_testItemNodeStatus({ state }, { item_id, item_node_id, completion_method, index, that }) {
      const name = '节点完成前验证'
      const obj = { item_node_id }
      const suc = function (res) {
        let url = window.location.origin + '/nova'
        let param = {}
        const { data, msg, status } = res
        const { action, node_complete_id, url: path } = data === null ? {} : data
        if (String(status) === '0') {
          MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
        } else {
          if (action === 'showAdd') {
            param = { item_node_id, item_id, complete_mode: completion_method } // 项目节点id, 项目id, 完成方式 1手动完成，2业务关联完成
            url = url + path + `?action=${action}&item_node_id=${item_node_id}&item_id=${item_id}&complete_mode=${completion_method}`
          } else {
            param = { id: node_complete_id } // 完成记录主键id
            url = url + path + `?action=${action}&id=${node_complete_id}`
          }
          // eslint-disable-next-line
          updateWin({ title: '完成节点', width: 1700, height: 700, url, param, onClose() {}, fn() { that.f5(false) } })
        }
        /* 关闭：加载动画 */
        state.loading[index] = false
      }
      const err = function () {
        /* 关闭：加载动画 */
        state.loading[index] = false
      }
      Api({ name, obj, suc, err })
    }
  }
}

export default Ml
