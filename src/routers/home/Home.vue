<template>
    <div id="home">
        <div class="information">
            <div class="head">
                <div class="portrait" @click="openPages('My',{})">
                    <img v-if="userGetInfo.imagePathUrl" :src="userGetInfo.imagePathUrl" alt="">
                    <img v-else src="./../../assets/images/head.jpg" alt="">
                </div>
                <div class="user_info">
                    <div class="user_name" @click="openPages('My',{})">
                        <p>{{userGetInfo.nickName || '暂无'}}</p>
                        <!-- <span>修改资料</span> -->
                        <!-- <div @click="openPrompt()" class="prompt_icon">？</div> -->
                    </div>
                    <div class="user_device">
                        <div class="device_status">
                            <p>{{ deviceInfo.DeviceName }}</p>
                            <p>{{ deviceInfo.userCodeVer }}<span :style="{'color':(deviceInfo.connectState?'#04be02':'red')}">&nbsp;&nbsp;（{{deviceInfo.connectState?'已连接':'未连接'}}）</span></p>
                        </div>
                    </div>
                    <div class="hisrory" @click="openPages('HealthHistory',{})">
                        健康历史
                    </div>
                </div>
            </div>
            <div class="device_info" @click="openPages('My',{})">
                <img :src="battery[braceletVal-1]" alt="">
                <img src="./../../assets/icon/right.svg" alt="">
            </div>
        </div>
        <div class="device_options">
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_02.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.sportstep}}</span>步</p>
                    <p>步数</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_03.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{deviceInfo.km}}</span>千米</p>
                    <p>里程</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_04.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.calorie}}</span>大卡</p>
                    <p>卡里路</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_05.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.sleephour}}</span>小时</p>
                    <p>睡眠</p>
                </div>
            </div>
        </div>

        <div class="device_options">
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_06.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{((Number(LCDDisplayData.heartrate)<30||Number(LCDDisplayData.heartrate)>200)?'F':Number(LCDDisplayData.heartrate))}}</span>次/分钟</p>
                    <p>心率</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_07.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.bodysurfacetemp}}</span>℃</p>
                    <p>手表皮温度</p>
                </div>
            </div>
        </div>

        <div class="device_options">
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_08.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.humidity}}</span>%</p>
                    <p>腕部湿度</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_09.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.temperature}}</span>℃</p>
                    <p>腕部温度</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_10.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.pressure}}</span>mb</p>
                    <p>海拔</p>
                </div>
            </div> 
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_11.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{deviceInfo.nextremind}}</span>天</p>
                    <p>距离下次提醒天数</p>
                </div>
            </div>
        </div>
        <div v-if="prompt" class="prompt_content" @click.self="openPrompt()">
            <div class="content">
                <div class="title">操作说明</div>
                <div class="prompt">
                    <p>这里将显示本app的操作说明，这里暂时使用文字进行填充显示效果</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import battery1 from './../../assets/icon/battery1.svg'
    import battery2 from './../../assets/icon/battery2.svg'
    import battery3 from './../../assets/icon/battery3.svg'
    import battery4 from './../../assets/icon/battery4.svg'
    import battery5 from './../../assets/icon/battery5.svg'
    import { mapState } from 'vuex'
    import { simulationLogin,userInfoEdit } from "./../../sverse/api.js"
    import { l } from './../../utils/base.js'
    export default {
        data () {
            return {
                userInfo:{},
                prompt: false,//用于操作说明的开关
                battery: [battery1, battery2, battery3, battery4, battery5]
            }
        },
        mounted () {
            this.userInfo = {...this.userInfo,...this.userGetInfo}
        },

        computed: {
            ...mapState({
                LCDDisplayData: (state)=>{
                    return state.main.LCDDisplayData
                },
                deviceInfo: (state)=>{
                    return state.main.deviceInfo
                },
                userGetInfo: (state) => {
                    return state.main.userInfo
                },
                tooltipInfo: (state) => {
                    return state.main.tooltipInfo
                },
                braceletVal: (state) =>{
                    return state.main.deviceInfo.bracelet
                }
            })
        },
        watch:{
            // 'LCDDisplayData.heartrate'(val, vals){
            //     console.error(`心率值：${val}`)
            //     const valx = Number(val);
            //     if(valx < 30) return 'F';
            //     if(valx > 200) return 'F';
            //     return valx
            // },
            tooltipInfo(val, vals){
                // l.e('******我是观察属性(tooltipInfo)******')
                // l.e(val)
            }
        },
        methods:{
            openPages (name,param) {
                param = (JSON.stringify(param) == "{}" ? {} : param);
                this.$router.push({name: name, params: param});
            },
            openPrompt (){
                switch(this.prompt) {
                    case false:
                        this.prompt = true;
                        break;
                    case true:
                        this.prompt = false;
                        break;
                }
            },
        },
        // watch: {
        //     // selectedDate: function (newDate, oldDate) {
        //     //     //如果选择的日期等于当天日期，则禁用前进一天的按钮
        //     //     if (this.selectedDate == this.nowDate) {
        //     //         this.btnStatus = true;
        //     //     } else {
        //     //         this.btnStatus = false;
        //     //     }

        //     //     this.getHealthHistorData(this.deviceInfo.deviceId, newDate);
        //     // }
        // },
    }
</script>
<style lang="less" scoped>
    #home {
        padding-top: .25rem;//解决外边距溢出
        .information{

            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            background: white;
            // margin: .25rem 0;
            margin-bottom: .25rem;
            padding: .2rem 0 .2rem .2rem;

            .head {
                display: flex;
                .portrait {
                    width: 1.4rem;
                    height: 1.4rem;
                    border-radius: 50%;
                    overflow: hidden;
                    img{
                        width: 100%;
                        height: 100%;
                    }
                }

                .user_info {
                    width: 4.5rem;
                    padding: .1rem .1rem .1rem .3rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    .user_name {
                        font-size: .33rem;
                        display: flex;
                        align-items: center;
                        span { 
                            font-size: .25rem;
                            color: #1296db;
                            margin-left: .2rem;
                        }

                        .prompt_icon {
                            width:.35rem;
                            height:.35rem;
                            background: #0086ec;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: .28rem;
                            margin-left: .2rem;
                            text-align: center;
                            line-height: normal;
                        }
                    }

                    .user_device {
                        margin-top: .15rem;
                        font-size: .32rem;
                        display: flex;
                        align-items: center;
                        img {
                            width: .4rem;
                            height: .4rem;
                            margin-right: .1rem;
                        }
                        .device_status{
                            font-size: 14px;
                            p{
                                color:#333;
                            }
                            span { color: red; }
                        }
                    }

                    .hisrory{
                        display: inline;
                        line-height: .28rem;
                        padding: .1rem .35rem;
                        border: 1px solid #0c9b8e;
                        border-radius: .28rem;
                        width: .9rem*2;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-top: .1rem;
                    }
                }
            }
            
            .device_info {
                width: 1.2rem;
                height: 1.4rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                img {
                    width: .58rem;
                }
            }

            .history {
                width: 100%;
                padding-right: .2rem;
                button {
                    margin-top: .3rem;
                    height: .6rem;
                    font-size: .28rem;
                }
            }
        }

        .device_options {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            margin-bottom: .2rem;

            .option {
                width: 50%;
                padding: .4rem 0 .4rem .2rem;
                border: 1px solid #ebebeb;
                background: white;
                display: flex;
                align-items: center;
                .option_img {
                    width: .66rem;
                    height: .66rem;
                    display: flex;
                    align-items: center;
                    img {
                        width: 100%;
                    }
                }
                .option_content {
                    box-sizing: border-box;
                    padding-left: .2rem;
                    height: .76rem;
                    p{
                        line-height: .4rem;
                        font-size: .28rem;
                    }

                    p:nth-child(1){
                        span {
                            font-size: .48rem;
                            color: #222;
                            font-weight: 600;
                        }
                    }

                    p:nth-child(2){
                        color: #929292;
                    }
                }
            }
        }

        .prompt_content {
            position: absolute;
            top: 0;
            display: flex;
            height: 100%;
            padding: 0 .8rem;
            align-items: center;
            z-index: 99;
            width: 100%;
            background: rgba(0,0,0,0.5);

            .content {
                width: 100%;
                border-radius: .2rem;
                background: white;
                text-align: center;
                padding: .4rem .3rem; 
                .title{
                    font-size: .35rem;
                }
                .prompt {
                    text-align: left;
                    margin-top: .3rem;
                    font-size: .28rem;
                    line-height: .5rem;
                }

            }

        }
        
    }
</style>