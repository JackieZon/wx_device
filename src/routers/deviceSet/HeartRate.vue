<template>
  <div id="heartRate">
    <div class="head-notice">
      心率：正常情况下，心率一般不会超过100次/分钟，当心率超过一定数值时，手环屏幕会闪烁提醒，超过心率数值可选择设置。
    </div>
    <div class="setting-steps">
      <div class="heart-rate">
        <yd-cell-item>
          <span slot="left" class="setting-name">心率提醒</span>
          <span slot="right">
            <yd-switch v-model="heartRateRemind"></yd-switch>
          </span>
        </yd-cell-item>
      </div>
      <div class="heart-rate">
        <div class="divs"></div>
        <yd-cell-item>
          <span slot="left" class="setting-name">心率设置</span>
          <yd-spinner slot="right" min="80" max="150" unit="5" v-model="postData.heartRateCountRemind"></yd-spinner>
          <!-- <span style="margin-left: .2rem;" slot="right"></span> -->
        </yd-cell-item>
      </div>
      <!-- <p class="body-notice">测量频率变小会影响手环续航时间变短</p>
      <div class="heart-rate">
        <yd-cell-item>
          <span slot="left" class="setting-name">检测频率</span>
          <span slot="right">{{ postData.basalMetabolism }}分钟</span>
        </yd-cell-item>
      </div> -->
    </div>
  </div>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { setDeciceSetInfo } from "./../../sverse/api.js"
export default {
  data(){
    return {
      a:1,
      heartRateRemind: false,
      postData: {
          deviceType: 2,
          heartRateCountRemind: 0,
          heartRateRemind: 0,
          sportTarget: 0,
          sportTargetRemind: 1,
          temperatureDifferenceRemind: 0,
          temperatureDifferenceValue: 0,
          lowHeartRateValue: 0,
          basalMetabolism: 60
      }
    }
  },
  mounted () {
    this.heartRateRemind = (this.deviceInfoSeting.heartRateRemind==1?true:false)
    this.postData = {...this.postData, ...this.deviceInfoSeting}
    $('input').attr('readonly',true)
    // this.heartRateData.DeviceSetHeartRateTestInterval = 60
  },
  // destroyed () {
  //   l.w('HeartRate.destroyed')
  //   this.changeDeviceInfo()
  // },
  computed:{
    ...mapState({
      deviceGetInfo: state => {
        return state.main.deviceInfo
      },
      deviceInfoSeting: state => {
        return state.main.deviceInfoSeting
      }
    })
  },
  methods: {
    ...mapActions([
      'changeDeviceInfo'
    ]),
    ...mapMutations([
      'deviceInfoSetingSet',
      'deviceInfoSet'
    ]),
    setDeciceSetInfo () {

      console.error('提交前的数据')
      console.error(this.postData)

      setDeciceSetInfo(this.postData).then((res)=>{
        this.deviceInfoSetingSet(this.postData)
        this.deviceInfoSet(this.postData)
        l.w('HeartRate.destroyed')
        this.changeDeviceInfo()
      })

    }
  },
  watch: {
    'heartRateRemind':{
        handler:function (val,oldVal) {
          this.postData.heartRateRemind = (val?1:0)
          this.setDeciceSetInfo();
        },
        deep:true
    },
    'postData.heartRateCountRemind':{
      handler:function (val,oldVal) {
        this.setDeciceSetInfo();
      },
      deep:true
    },
  }
  
}
</script>
<style lang="less" scoped>
    #heartRate {
      height: 100%;
      background-color: rgb(235, 235, 235);
      .head-notice{
        font-size: .32rem;
        color: #333;
        text-indent:2em;
        padding: .3rem .4rem;
      }
      .body-notice{
        font-size: .32rem;
        color: #333;
        padding: .3rem .4rem;
      }
      .heart-rate{
        background-color: #fff;
        position: relative;
        .divs{
            position: absolute;
            right: .38rem*2;
            top: 0;
            width: .49rem*2;
            height: .30rem*2;
            background: rgba(255, 255, 255, 0.1);
            top: 50%;
            margin-top: -(.15rem*2);
            z-index: 999;
        }
      }
      .setting-name {
        font-size: .3rem;
        color: #2a2a2a;
        
      }
      .setting-left {
        font-size: .3rem;
        color: #2a2a2a;
      }

      .setting-right {
        font-size: .34rem;
        color: #929292;
      }
  }
    
  </style>


