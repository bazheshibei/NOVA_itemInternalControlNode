
<!-- 工厂 -->

<template>
  <div class="comBox" ref="page">

    <div class="topBtnLine">
      <div>
        <el-button type="primary" size="mini" @click="advancedQuery">高级查询</el-button>
        <el-button type="primary" size="mini" @click="f5">刷新</el-button>
        <el-button type="primary" size="mini" @click="plant">排计划</el-button>
        <el-button type="primary" size="mini" :disabled="!item_gantt_id" @click="edit">调整计划</el-button>
      </div>
    </div>

    <!-- 表格组件 -->
    <com-table :style="tableStyle" :tableHeight="tableHeight" style="padding-right: 30px;"></com-table>

    <!-- 分页 -->
    <div class="paginationBox" ref="bottomBox">
      <el-pagination class="comPagination" :page-size="rownum" :page-sizes="[10, 20, 30, 50, 100]" :total="pageCount" :current-page="pagenum"
        layout="prev, pager, next, total, jumper, sizes" prev-text="上一页" next-text="下一页"
        @size-change="pageChange('rownum', $event)" @current-change="pageChange('pagenum', $event)"
      >
      </el-pagination>
    </div>

    <!-- 高级查询 -->
    <com-advancedQuery></com-advancedQuery>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import ComTable from './components/table.vue' //                 表格组件
import ComAdvancedQuery from './components/advancedQuery.vue' // 高级查询
export default {
  components: { ComTable, ComAdvancedQuery },
  data() {
    return {
      tableHeight: 0,
      tableStyle: {}
    }
  },
  created() {
    /** 计算：表格高度 **/
    this._countHeight()
  },
  computed: {
    ...mapState('Gc', ['pagenum', 'rownum', 'pageCount', 'item_id', 'item_gantt_id', 'item_gantt_detail_id'])
  },
  methods: {
    /**
     * [排计划]
     */
    plant() {
      // console.log(this.tableRow_1)
      /* 保存到本地缓存 */
      localStorage.setItem('sumittcpcGanttSummaryType', JSON.stringify({ type: 3 }))
      /* win 方法打开页面 */
      const url = window.location.origin + '/nova/pages/itemganttsummary/itemInternalControlNodeForm.html'
      // eslint-disable-next-line
      win({ title: '排计划', width: 1500, height: 600, url, param: {}, fn() { that.f5(false) } })
    },
    /**
     * [调整计划]
     */
    edit() {
      const that = this
      /* 保存到本地缓存 */
      const { item_id, item_gantt_id, item_gantt_detail_id } = this
      localStorage.setItem('NOVA_reject', JSON.stringify({ item_id, item_gantt_id, item_gantt_detail_id }))
      /* win 方法打开页面 */
      const url = window.location.origin + '/nova/pages/itemganttsummary/itemGanttSummaryUpdate.html'
      // eslint-disable-next-line
      win({ title: '调整计划', width: 1500, height: 600, url, param: {}, fn() { that.f5(false) } })
    },
    /**
     * [高级查询]
     */
    advancedQuery() {
      this.$store.commit('saveData', { name: 'isDialog', obj: true, module: 'Gc' })
    },
    /**
     * [刷新]
     * @param {[Boolean]} reset 是否重置分页
     */
    f5(reset = true) {
      if (reset) {
        this.$store.commit('saveData', { module: 'Gc', name: 'pagenum', obj: 1 })
        this.$store.commit('saveData', { module: 'Gc', name: 'rownum', obj: 10 })
        this.$store.commit('saveData', { module: 'Gc', name: 'pageCount', obj: 0 })
      }
      this.$store.commit('saveData', { module: 'Gc', name: 'item_id', obj: '' })
      this.$store.commit('saveData', { module: 'Gc', name: 'item_gantt_id', obj: '' })
      this.$store.commit('saveData', { module: 'Gc', name: 'item_gantt_detail_id', obj: '' })
      /** 发起请求 **/
      this._request()
    },
    /**
     * [分页切换]
     * @param {[String]} name 属性名
     * @param {[Int]}    val  属性值
     */
    pageChange(name, val) {
      /** 保存数据 **/
      this.$store.commit('saveData', { module: 'Gc', name, obj: val })
      /** 发起请求 **/
      this._request()
    },
    /**
     * [发起请求]
     */
    _request() {
      /** 请求：表格基础数据 **/
      this.$store.dispatch('Gc/A_tableData')
    },
    /**
     * [计算：表格高度]
     */
    _countHeight() {
      const that = this
      let i = 0
      const timer = setInterval(function () {
        if (Object.keys(that.$refs).length) {
          const { page, bottomBox } = that.$refs
          if (page.clientHeight && bottomBox.clientHeight) {
            const num = page.clientHeight - bottomBox.clientHeight - 40
            that.tableStyle = { height: num + 'px' }
            that.tableHeight = num
            clearInterval(timer)
          }
        }
        if (i > 500) {
          clearInterval(timer)
        }
        i++
      }, 100)
    }
  }
}
</script>

<style scoped>
.comBox {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

/*** 顶部按钮 ***/
.topBtnLine {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/*** 分页 ***/
.paginationBox {
  height: 34px;
  margin: 0 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
