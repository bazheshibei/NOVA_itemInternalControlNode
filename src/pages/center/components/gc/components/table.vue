
<!-- 表格：工厂 -->

<template>
  <div ref="comTable">
<!-- :height="tableHeight"  -->
    <el-table :data="tableData_1" border :highlight-current-row="true"
      :cell-style="cellStyle" @expand-change="showMore" @row-click="rowClick"
    >
      <!-- 折叠内容 -->
      <el-table-column type="expand" width="30">
        <template slot-scope="props">
          <com-table2 :row="props.row"></com-table2>
        </template>
      </el-table-column>
      <!-- 固定列 -->
      <el-table-column width="45">
        <template slot-scope="scope">
          {{scope.row.index + 1}}
        </template>
      </el-table-column>
      <el-table-column label="项目名称" prop="item_name" width="120"></el-table-column>
      <el-table-column label="项目季节" prop="item_season" width="120"></el-table-column>
      <el-table-column label="服装品类" prop="type_name" width="120"></el-table-column>
      <el-table-column label="款式名称" prop="item_style_name" width="120"></el-table-column>
      <el-table-column label="业务组" prop="group_name" width="120"></el-table-column>
      <el-table-column label="服装加工厂" prop="provider_name" width="100"></el-table-column>
      <el-table-column label="提报人" prop="reporter" width="100"></el-table-column>
      <el-table-column label="创建时间" width="100">
        <template slot-scope="scope">
          <p v-if="scope.row.report_time">{{scope.row.report_time.split(' ')[0]}}</p>
          <p v-if="scope.row.report_time">{{scope.row.report_time.split(' ')[1]}}</p>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" prop="order_time" width="100"></el-table-column>
      <el-table-column label="客人交期" prop="deliver_date" width="100"></el-table-column>
      <el-table-column label="工厂交期" prop="plant_deliver_date" width="100"></el-table-column>
      <!-- <el-table-column label="工厂交期" prop="pro_date" width="100"></el-table-column> -->
      <!-- 节点列 -->
      <el-table-column v-for="(node, nodeKey) in tableNodes" :key="'node_' + nodeKey" :label="node.node_name" :column-key="node.node_code" align="center" width="140">
        <template slot-scope="scope">
          <div class="comCellBox" v-for="(item, index) in scope.row.itemNodeMapList" :key="nodeKey + '_' + index">
            <div class="comCell" v-if="item.node_code === node.node_code">
            <p>计划：{{item.plan_enddate.split(' ')[0]}}</p>
            <p>实际：{{item.actual_enddate === null || item.actual_enddate === '' ? '--' : item.actual_enddate.split(' ')[0]}}</p>
            <p>
              状态：<span v-html="item.nodeTypeText"></span>
              <i class="el-icon-warning" v-if="item.is_show_warning" style="color: #F56C6C;"></i>
            </p>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<style scoped>

</style>

<script>
import { mapState } from 'vuex'
import ComTable2 from './table2.vue' // 表格：工厂_折叠部分
export default {
  components: { ComTable2 },
  created() {
    if (!this.tableData_1.length) {
      /** 请求：表格基础数据 **/
      this.$store.dispatch('Gc/A_tableData')
    }
    /** 计算：表格高度 **/
    this._countHeight()
  },
  data() {
    return {
      tableHeight: 0 // 表格高度
    }
  },
  computed: {
    ...mapState('Gc', ['tableData_1', 'tableData_2', 'tableNodes', 'pageObj', 'loading'])
  },
  methods: {
    /**
     * [单元格样式]
     */
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex < 2) {
        return { color: '#2e6e9e', fontWeight: 'bold', background: '#dfeffc url(itemInternalControlNode/images/ui-bg_glass_85_dfeffc_1x400.png) 100% 100% repeat-x' }
      }
      if (column.columnKey) {
        for (let i = 0; i < row.itemNodeMapList.length; i++) {
          const { node_code, is_show_warning } = row.itemNodeMapList[i]
          if (node_code === column.columnKey && is_show_warning) {
            return { background: '#dfeffc url(itemInternalControlNode/images/ui-bg_glass_85_dfeffc_1x400.png) 100% 100% repeat-x' }
          }
        }
      }
    },
    /**
     * [点击某一行]
     * @param {[Object]} row    行
     * @param {[Object]} column 列
     * @param {[Object]} event  事件
     */
    rowClick(row, column, event) {
      const { item_id, item_gantt_id, item_gantt_detail_id, audit_status } = row
      this.$store.commit('saveData', { name: 'item_id', obj: item_id, module: 'Gc' })
      this.$store.commit('saveData', { name: 'item_gantt_id', obj: item_gantt_id, module: 'Gc' })
      this.$store.commit('saveData', { name: 'item_gantt_detail_id', obj: item_gantt_detail_id, module: 'Gc' })
      this.$store.commit('saveData', { name: 'isChangeNodes', obj: audit_status === '审核通过', module: 'Gc' })
    },
    /**
     * [展示折叠内容]
     * @param {[Object]} row          当前展开行的数据
     * @param {[Array]}  expandedRows 所有展开行的数据
     */
    showMore(row, expandedRows) {
      /* 给折叠表格添加分页信息 */
      const { pageObj, tableData_2, loading } = this
      const { index } = row
      /* 首次展开当前行 */
      if (!pageObj[index]) {
        pageObj[index] = { pagenum: 1, rownum: 100, pageCount: 0 }
      }
      if (!tableData_2[index]) {
        loading[index] = true
        /** 请求：表格折叠数据 **/
        this.$store.dispatch('Gc/A_tableOtherData', { row })
      }
    },
    /**
     * [计算：表格高度]
     */
    _countHeight() {
      const that = this
      let i = 0
      const timer = setInterval(function () {
        if (Object.keys(that.$refs).length) {
          const { comTable } = that.$refs
          if (comTable.clientHeight) {
            that.tableHeight = comTable.clientHeight
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
