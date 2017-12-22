import { bytesToNumber, toAscii, bytesToHex } from './HexUtils'
import { Cmd } from './Packet'
import { alert, notify } from './../toast'
import { senddataBytes } from './../device/WXDevice'
import { l } from './../base'
import { addDeviceDataSleep, addDeviceDataSport, addDeviceDataPulse, addDeviceDataTempRHPress } from './../../sverse/api'
/**
*  数据处理程序
 * @param {number} cmd Cmd.枚举 指令
 * @param {number} framesize 数据帧大小
**/
export const getStorage = {
    deviceId: ()=>{
        return window.localStorage.getItem('wecDeviceId')
    }
}
export function DataHandler(cmd, framesize, t_data) {
    const { commit, dispatch } = t_data
    let vm = t_data.state.main
    /**
    * 发送帧次数
    **/
    this.SendCount = 1;
    /**
    * 是否需要回复
    **/
    this.NeedReply = false;
    /**
    * 数据域说明 0请求帧 1-10 数据帧  11发送完成 12接收错误 13接收正确 14允许发送 15数据总长度
    **/
    this.DataDomain = 0;
    /**
    * 最后接收到的数据帧号
    **/
    this.LastDataFrameNum = 0;
    /**
    * 接收到的数据域说明 0请求帧 1-10 数据帧  11发送完成 12接收错误 13接收正确 14允许发送 15数据总长度
    **/
    this.ReceiveDataDomain = 0;
    /**
    * 数据总长度
    **/
    this.DataLen = 0;
    /**
    * 数据帧大小
    **/
    this.DataFrameSize = 0;
    if (!(typeof framesize == "undefined")) {
        this.DataFrameSize = framesize;
    }
    /**
    * 数据列表
    **/
    this.DataList = [];
    /**
    * 指令
    **/
    this.Cmd = 0;
    if (!(typeof cmd == "undefined")) {
        this.Cmd = cmd;
    }
    if (typeof DataHandler._initialized == "undefined") {

        //公共指令解析
        DataHandler.prototype.DecodePacket = function (packet) {

            l.i('DataHandler.DecodePacket')

            // 判断设备返回数据得到 0请求帧 1-10 数据帧  11发送完成 12接收错误 13接收正确 14允许发送 15数据总长度
            switch (packet.Cmd) {
                case Cmd.setTime: {
                    if (packet.FrameNum.datadomain == 13) {
                        console.log('时间设置成功！')
                        dispatch('taskQueueExec', { isSetSuccess: true })
                        commit('configSet', { lastSetTime: new Date() })
                    } else {
                        console.log('时间设置成功！')
                        l.e({ msg: '设置失败！' })
                    }
                    break;
                }
                case Cmd.bracelet:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取电量成功！')
                            dispatch('taskQueueExec', { isSetSuccess: true })
                            let bracelet = bytesToNumber(packet.Data.slice(0, 1));
                            dispatch('deviceInfoSet', { bracelet: bracelet })
                            l.w(`电量${bracelet}`)
                        } else {
                            l.e({ msg: '读取电量失败！' })
                        }
                        break;
                    }
                case Cmd.LCDDisplayDataNew:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取里程成功！')
                            dispatch('taskQueueExec', { isSetSuccess: true })

                            var km = bytesToNumber(packet.Data.slice(4, 6));
                            if (km > 0) km = (km / 10).toFixed(1);

                            dispatch('deviceInfoSet', { km: km })

                            l.w(`里程${km}`)
                        } else {
                            l.e({ msg: '读取里程失败！' })
                        }
                        break;
                    }
                case Cmd.personalInfo:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            if (packet.DataLen == 4) {

                                l.w('读取身高体重成功！')

                                var Height = bytesToNumber(packet.Data.slice(0, 1));
                                var Weight = bytesToNumber(packet.Data.slice(1, 2));

                                dispatch('deviceInfoSet', { Height: Height, Weight: Weight })
                                l.w(`身高${Height}cm,体重${Weight}kg`)


                                dispatch('taskQueueExec', { isSetSuccess: true })
                            }
                            else {
                                l.w('设置身高体重成功！')
                                dispatch('taskQueueExec', { isSetSuccess: true })
                            }
                        } else {
                            l.e({ msg: '读取或设置身高体重失败！' })
                        }
                        break;
                    }
                case Cmd.FlashingWarningThreshold:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            if (packet.DataLen == 6) {
                                l.w('读取提醒阀值成功！')

                                var rawDeviceSetHeartRateMax = bytesToNumber(packet.Data.slice(0, 1));
                                var rawDeviceSetStepTarget = bytesToNumber(packet.Data.slice(1, 3));
                                var rawDeviceSetTempDiff = bytesToNumber(packet.Data.slice(3, 4));

                                var rawDeviceSetTempDiffStr = Number(rawDeviceSetTempDiff).toString(2).PadLeft(8);
                                // var datadomain = parseInt(FrameNumStr.slice(0, 1), 2);
                                rawDeviceSetTempDiff = parseInt(rawDeviceSetTempDiffStr.slice(1, 8), 2);

                                dispatch('deviceInfoSet', {
                                    rawDeviceSetHeartRateMax: rawDeviceSetHeartRateMax,
                                    rawDeviceSetStepTarget: rawDeviceSetStepTarget,
                                    rawDeviceSetTempDiff: rawDeviceSetTempDiff
                                })

                                l.w(`心率${rawDeviceSetHeartRateMax},步数目标${rawDeviceSetStepTarget},温差${rawDeviceSetTempDiff}`)

                                dispatch('taskQueueExec', { isSetSuccess: true })
                            }
                            else {
                                l.w('设置提醒阀值成功！')
                                dispatch('taskQueueExec', { isSetSuccess: true })
                            }
                        } else {
                            l.e({ msg: '读取或设置提醒阀值失败！' })
                        }
                        break;
                    }
                case Cmd.userCodeVer:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取手环版本成功！')
                            dispatch('taskQueueExec', { isSetSuccess: true })

                            var ver = toAscii(bytesToHex(packet.Data)).replace("?", '');

                            dispatch('deviceInfoSet', { userCodeVer: ver })
                            l.w(`版本${ver}`)
                        } else {
                            l.e({ msg: '读取手环版本失败！' })
                        }
                        break;
                    }
                case Cmd.holidayReminder:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取节日提醒成功 女性生理周期成功！')
                            dispatch('taskQueueExec', { isSetSuccess: true })

                            var remindonstate = bytesToNumber(packet.Data.slice(0, 1));
                            var cycle = bytesToNumber(packet.Data.slice(1, 2));
                            var nextremind = bytesToNumber(packet.Data.slice(2, 3));

                            dispatch('deviceInfoSet', { remindonstate: remindonstate, cycle: cycle, nextremind: nextremind })

                            l.w(`开关显示${remindonstate}，周期${cycle}，下次提醒天数${nextremind}`)
                        } else {
                            l.e({ msg: '读取节日提醒失败！' })
                        }
                        break;
                    }
                default: {
                    break;
                }
            }
        };

        //历史数据指令回复
        DataHandler.prototype.HistoryDataReply = function (packet) {
            const { t_data } = packet
            const { commit, state } = packet.t_data
            let vm = state.main
            //需要回复
            if (packet.FrameNum.needreply) {
                //数据域为数据长度
                if (packet.FrameNum.datadomain == 15) {
                    this.DataLen = bytesToNumber(packet.Data);
                    if (this.DataLen > 0) {
                        //重置数据长度和已接收长度
                        commit('configSet', { DataLen: (this.DataLen / this.DataFrameSize), ReceiveDataLen: 0 })

                        //允许发送历史数据
                        this.SendCount = 1;
                        this.NeedReply = true;
                        this.DataDomain = 14;
                        senddataBytes(getStorage.deviceId(), { cmd: this.Cmd, data: '', dataHandler: this, t_data: t_data })
                    }
                    else {
                        l.i('历史数据已经被读空了！');

                        commit('configSet', { DataLen: 0, ReceiveDataLen: 0 })

                        commit('tooltipInfoSet', '')
                        // if (!(typeof this.ReceiveSuccess == "undefined")) {
                        //     //this.ReceiveSuccess();
                        // }
                        dispatch('taskQueueExec', { isSetSuccess: true })
                    }
                }
                //传输完成
                else if (packet.FrameNum.datadomain == 11) {
                   
                    l.i("收到传输完成标志！");
                    if (!(typeof this.ReceiveSuccess == "undefined")) {
                        this.ReceiveSuccess((res) => {

                            if (res.data.status) {
                                l.w('服务器以保存成功')

                                commit('tooltipInfoSet', '')

                                //回复接收完成，清空数据
                                this.SendCount = 1;
                                this.NeedReply = false;
                                this.DataDomain = 11;
                                senddataBytes(getStorage.deviceId(), { cmd: this.Cmd, data: '', dataHandler: this, t_data: t_data })

                            } else {
                                l.w('服务器以保存失败')
                            }

                            setTimeout(()=>{
                                dispatch('taskQueueExec', { isSetSuccess: true })
                            }, 1500)
                            
                        });
                    }
                    //测试用 暂时不回复
                    //senddataBytes(vm.deviceInfo.deviceId, { cmd: this.Cmd, data: '', dataHandler: this })
                }
                //数据帧 >=1  ？ <=10
                else if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10) {
                    //回复接收正确
                    this.SendCount = 1;
                    this.NeedReply = false;
                    this.DataDomain = 13;
                    senddataBytes(getStorage.deviceId(), { cmd: this.Cmd, data: '', dataHandler: this, t_data: t_data })
                }
            }

        };
        DataHandler._initialized = true;
    }
}

export function LCDDisplayDataHandler(t_data) {
    const { commit, dispatch } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.LCDDisplayData, 14, t_data);
    if (typeof LCDDisplayDataHandler._initialized == "undefined") {
        LCDDisplayDataHandler.prototype.DecodePacket = function (packet) {
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            //通用回复处理
            //this.HistoryDataReply(packet);

            //数据帧 >=1  ？ <=10
            if (packet.FrameNum.datadomain == 13 && packet.Data.length == 14) {
                //标记已经读取成功
                // if (!vm.config.LCDDisplayDataHandlerSuccessFlag) {
                //     //立即开始读取
                //     //vm.ReadHistory();
                // }
                //if (!vm.config.LCDDisplayDataHandlerSuccessFlag)
                    dispatch('taskQueueExec', { isSetSuccess: true })

                commit('configSet', { 'LCDDisplayDataHandlerSuccessFlag': true })

                var sportstep = bytesToNumber(packet.Data.slice(0, 4));
                var calorie = bytesToNumber(packet.Data.slice(4, 6));
                var sleephour = bytesToNumber(packet.Data.slice(6, 7)) / 10;
                var heartrate = bytesToNumber(packet.Data.slice(7, 8));
                var bodysurfacetemp = bytesToNumber(packet.Data.slice(8, 10)) / 10;
                var humidity = bytesToNumber(packet.Data.slice(10, 11));
                var temperature = bytesToNumber(packet.Data.slice(11, 12));
                var pressure = bytesToNumber(packet.Data.slice(12, 14)) / 10;

                commit('LCDDisplayDataSet', {
                    sportstep: sportstep,
                    calorie: calorie,
                    sleephour: sleephour,
                    heartrate: heartrate,
                    bodysurfacetemp: bodysurfacetemp,
                    humidity: humidity,
                    temperature: temperature,
                    pressure: pressure,
                })
                l.w(vm.LCDDisplayData)
            }
        };
        LCDDisplayDataHandler._initialized = true;
    }
}

export function SleepDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.sleep, 10, t_data);

    this.SleepDataSchema =
        {
            SleepStatus: null,
            SleepStartTime: null,
            SleepDuration: null,
            SleepStepCount: null,
            SleepCalorie: null,
            RawHex: null,
        };
    if (typeof SleepDataHandler._initialized == "undefined") {
        SleepDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataSleep(this.DataList);
            let param = {
                deviceId: vm.deviceInfo.wecDeviceId,
                dataList: this.DataList
            }
            console.log('****睡眠历史提交(SleepDataHandler)***')
            console.log(param)
            addDeviceDataSleep(param).then((res) => {
                console.log(res)
                if (res.data.status) {
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { SleepDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        SleepDataHandler.prototype.DecodePacket = function (packet) {

            l.i('SleepDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 10) {
                /* 状态	        开始时间	      持续时间
                0x01：深睡；
                0x02：浅睡；
                0x03：清醒；	年月日时分秒      时分秒
                */
                this.LastDataFrameNum = packet.FrameNum.datadomain;

                var SleepStatus = bytesToNumber(packet.Data.slice(0, 1));
                var SleepStartTimeYear = bytesToNumber(packet.Data.slice(1, 2));
                var SleepStartTimeMonth = bytesToNumber(packet.Data.slice(2, 3));
                var SleepStartTimeDay = bytesToNumber(packet.Data.slice(3, 4));
                var SleepStartTimeHours = bytesToNumber(packet.Data.slice(4, 5));
                var SleepStartTimeMinutes = bytesToNumber(packet.Data.slice(5, 6));
                var SleepStartTimeSeconds = bytesToNumber(packet.Data.slice(6, 7));
                var SleepStartTime = '20' + String(SleepStartTimeYear).PadLeft(2) + '-' + SleepStartTimeMonth + '-' + SleepStartTimeDay + ' ' + SleepStartTimeHours + ':' + SleepStartTimeMinutes + ':' + SleepStartTimeSeconds;

                var SleepDurationHours = bytesToNumber(packet.Data.slice(7, 8));
                var SleepDurationMinutes = bytesToNumber(packet.Data.slice(8, 9));
                var SleepDurationSeconds = bytesToNumber(packet.Data.slice(9, 10));
                var SleepDuration = (SleepDurationHours * 60 + SleepDurationMinutes) * 60 + SleepDurationSeconds;

                let postData = {
                    "userId": 1, //用户ID
                    "deviceType": 2, //设备类型 0:h1,1:G1,2:S3,3:S4
                    "type": 0,     //0：走路，1：跑步
                    "stepNum": 12000,  //步数
                    "caloric": 5000.2, //卡路里
                    "mileage": 10000,  //里程，米
                    "startTime": "2017-08-31 18:25:21",
                    "endTime": "2017-08-31 19:28:21",
                    "durationTime": 63,  //持续时间，秒
                    "deviceId": 998      //设备id必填项
                }

                var param = {
                    userId: '',
                    type: SleepStatus,
                    deviceType: 2,
                    startTime: SleepStartTime,
                    endTime: '',
                    durationTime: SleepDuration,
                    belongDate: '',
                    wecDeviceId: getStorage.deviceId()
                }

                // let arrs = [
                //     {
                //         "userId":1,
                //         "type":1,
                //         "deviceType":1,
                //         "startTime":"2017-11-11 11:11:11",
                //         "endTime":"2017-11-11 11:11:11",
                //         "durationTime":60,
                //         "belongDate":"2017-11-11",
                //         "deviceId":1
                //     }
                // ]
                
                this.DataList.push(param);
                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                commit('tooltipInfoSet', `睡眠数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)

                //DataInterface.AddDeviceDataSleep(param)
            }
        };
        SleepDataHandler._initialized = true;
    }
}

export function SportDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.sports, 14, t_data);

    this.SportDataSchema =
        {
            SportStatus: null,
            SportStartTime: null,
            SportDuration: null,
            SportStepCount: null,
            SportCalorie: null,
            RawHex: null,
        };
    if (typeof SportDataHandler._initialized == "undefined") {
        SportDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataSport(this.DataList);

            let param = {
                deviceId: vm.deviceInfo.deviceId,
                dataList: this.DataList
            }
            l.e('****运动历史提交(SportDataHandler)***')
            console.log(param)
            addDeviceDataSport(param).then((res)=>{
                if(res.data.status){
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { SportDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        SportDataHandler.prototype.DecodePacket = function (packet) {

            l.i('SportDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10 
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 14) {
                /* 状态	        开始时间	    持续时间	总步数	        检测卡路里
                             0x01：走路；
                             0x02：跑步	    年月日时分秒      时分秒	低字节高字节      低字节高字节
                             */
                var SportStatus = bytesToNumber(packet.Data.slice(0, 1));
                var SportStartTimeYear = bytesToNumber(packet.Data.slice(1, 2));
                var SportStartTimeMonth = bytesToNumber(packet.Data.slice(2, 3));
                var SportStartTimeDay = bytesToNumber(packet.Data.slice(3, 4));
                var SportStartTimeHours = bytesToNumber(packet.Data.slice(4, 5));
                var SportStartTimeMinutes = bytesToNumber(packet.Data.slice(5, 6));
                var SportStartTimeSeconds = bytesToNumber(packet.Data.slice(6, 7));
                var SportStartTime = '20' + String(SportStartTimeYear).PadLeft(2) + '-' + SportStartTimeMonth + '-' + SportStartTimeDay + ' ' + SportStartTimeHours + ':' + SportStartTimeMinutes + ':' + SportStartTimeSeconds;

                var SportDurationHours = bytesToNumber(packet.Data.slice(7, 8));
                var SportDurationMinutes = bytesToNumber(packet.Data.slice(8, 9));
                var SportDurationSeconds = bytesToNumber(packet.Data.slice(9, 10));
                var SportDuration = (SportDurationHours * 60 + SportDurationMinutes) * 60 + SportDurationSeconds;

                var SportStepCount = bytesToNumber(packet.Data.slice(10, 12));
                var SportCalorie = bytesToNumber(packet.Data.slice(12, 14));

                var param = {
                    userId: '',
                    deviceType: 2,//设备类型
                    type: SportStatus,//运动状态
                    stepNum: SportStepCount,//步数
                    caloric: SportCalorie,//卡路里
                    mileage: '',
                    startTime: SportStartTime,//运动开始时间
                    endTime: '',
                    durationTime: SportDuration,//持续时间
                    wecDeviceId: getStorage.deviceId()
                }

                // var data = [
                //     {
                //         "userId": 1, //用户ID
                //         "deviceType": 2, //设备类型 0:h1,1:G1,2:S3,3:S4
                //         "type": 0,     //0：走路，1：跑步
                //         "stepNum": 12000,  //步数
                //         "caloric": 5000.2, //卡路里
                //         "mileage": 10000,  //里程，米
                //         "startTime": "2017-08-31 18:25:21",
                //         "endTime": "2017-08-31 19:28:21",
                //         "durationTime": 63,  //持续时间，秒
                //         "deviceId": 998      //设备id必填项
                //     }
                // ]

                this.DataList.push(param);
                l.w(param);

                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                commit('tooltipInfoSet', `运动数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
            }
        };
        SportDataHandler._initialized = true;
    }
}

export function TempRHPressDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.Temphumpres, 13, t_data);

    this.TempRHPressDataSchema =
        {
            Temp: null,
            RH: null,
            Press: null,
            RecordTime: null,
            RawHex: null,
        };
    if (typeof TempRHPressDataHandler._initialized == "undefined") {
        TempRHPressDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataTempRHPress(this.DataList);

            let param = {
                deviceId: vm.deviceInfo.deviceId,
                dataList: this.DataList
            }
            console.log('****历史数据提交(TempRHPressDataHandler)***')
            console.log(param)
            addDeviceDataTempRHPress(param).then((res) => {
                console.log(res)
                if (res.data.status) {
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { TempRHPressDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        TempRHPressDataHandler.prototype.DecodePacket = function (packet) {

            l.i('TempRHPressDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10 
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 13) {
                /*温度	          湿度	                气压	            时间
                低字节	高字节	低字节	高字节	低字节	中字节	高字节	年	月	日	时	分	秒
                内存低位	……	内存高位
                */
                var Temp = (bytesToNumber(packet.Data.slice(0, 2)) * 175.72 / 65536 - 46.85).toFixed(2);
                var RH = (bytesToNumber(packet.Data.slice(2, 4)) * 125 / 65535 - 6).toFixed(2);
                var Press = (bytesToNumber(packet.Data.slice(4, 7)) / 4096).toFixed(2);
                var RecordTimeYear = bytesToNumber(packet.Data.slice(7, 8));
                var RecordTimeMonth = bytesToNumber(packet.Data.slice(8, 9));
                var RecordTimeDay = bytesToNumber(packet.Data.slice(9, 10));
                var RecordTimeHours = bytesToNumber(packet.Data.slice(10, 11));
                var RecordTimeMinutes = bytesToNumber(packet.Data.slice(11, 12));
                var RecordTimeSeconds = bytesToNumber(packet.Data.slice(12, 13));
                var RecordTime = '20' + String(RecordTimeYear).PadLeft(2) + '-' + RecordTimeMonth + '-' + RecordTimeDay + ' ' + RecordTimeHours + ':' + (RecordTimeMinutes<10?'0'+RecordTimeMinutes:RecordTimeMinutes) + ':' + (RecordTimeSeconds<10?'0'+RecordTimeSeconds:RecordTimeSeconds);

                var param = {
                    userId: 0,
                    deviceType: 2,
                    wecDeviceId: getStorage.deviceId(),
                    temperature: Number(Temp),
                    humidity: Number(RH),
                    press: Number(Press),
                    measureType: 2,
                    testTime: RecordTime
                }

                // var data = [
                //     {
                //      "userId":369,       //用户主键ID
                //      "deviceType":2,     //设备类型0:h1,1:G1，2：S3,3:S4
                //      "deviceId":3,       //设备id
                //      "temperature": 35.3,//温度：摄氏度
                //      "humidity": 28,     //湿度：%
                //      "press": 1020.5,    //气压：mb    
                //      "measureType": 2,   //1手动，2自动(S4没有手动)
                //      "testTime": "2017-07-14 15:00:00"//测试时间
                //     }
                //  ]

                this.DataList.push(param);
                l.w(param);

                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                commit('tooltipInfoSet', `温湿度气压数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
            }
        };
        TempRHPressDataHandler._initialized = true;
    }
}

export function PulseDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.historicalPulse, 11, t_data);

    this.PulseDataSchema =
        {
            Pulse: null,
            SportStatus: null,
            StartType: null,
            BodySurfaceTemp: null,
            RecordTime: null,
            RawHex: null,
        };
    if (typeof PulseDataHandler._initialized == "undefined") {
        PulseDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataTempRHPress(this.DataList);

            let param = {
                deviceId: vm.deviceInfo.deviceId,
                dataList: this.DataList
            }
            console.log('****历史数据提交(PulseDataHandler)***')
            console.log(param)
            addDeviceDataPulse(param).then((res) => {
                console.log(res)
                if (res.data.status) {
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { PulseDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        PulseDataHandler.prototype.DecodePacket = function (packet) {

            l.i('PulseDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10 
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 11) {
                /*
                脉搏数	    运动状态	        启动方式	    体表温度	        时间
                1~254：脉搏值
                0xFF：无效数据	0x01：表示静止；
                                0x02：表示运动	    0x01：手动
                                                    0x02：自动	    低字节	高字节	     年	月	日	时	分	秒
                */
                var Pulse = bytesToNumber(packet.Data.slice(0, 1));
                var SportStatus = bytesToNumber(packet.Data.slice(1, 2));
                var StartType = bytesToNumber(packet.Data.slice(2, 3));

                var BodySurfaceTemp = bytesToNumber(packet.Data.slice(3, 5)) / 10;
                l.w(`体表温度|${BodySurfaceTemp}`)

                var RecordTimeYear = bytesToNumber(packet.Data.slice(5, 6));
                var RecordTimeMonth = bytesToNumber(packet.Data.slice(6, 7));
                var RecordTimeDay = bytesToNumber(packet.Data.slice(7, 8));
                var RecordTimeHours = bytesToNumber(packet.Data.slice(8, 9));
                var RecordTimeMinutes = bytesToNumber(packet.Data.slice(9, 10));
                var RecordTimeSeconds = bytesToNumber(packet.Data.slice(10, 11));
                var RecordTime = '20' + String(RecordTimeYear).PadLeft(2) + '-' + RecordTimeMonth + '-' + RecordTimeDay + ' ' + RecordTimeHours + ':' + RecordTimeMinutes + ':' + RecordTimeSeconds;

                var param = {
                    userId: '',
                    wecDeviceId: getStorage.deviceId(),
                    hrCount: Pulse,
                    result: '',
                    deviceType: 2,
                    type: SportStatus,
                    measureType: StartType,
                    surfaceTem: BodySurfaceTemp,
                    testTime: RecordTime
                }

                // var data = [
                //     {
                //     "userId": 72,       //用户id
                //     "deviceId":1,       //设备id
                //     "hrCount": 95,       //心率值
                //     "result": 1,       //-1偏低、0理想、1正常、2偏快
                //     "deviceType": 0,   //设备类型 0:h1,1:G1,2:S3,3:S4
                //     "type": 0,           //所处状态：0 静止、1动态,默认0
                //     "measureType": 1,  //检测模式 1：手动 2：自动,3:未带手环,4：整点测量 5：动态心率
                //     "surfaceTem": 37.5,//体表温度：摄氏度
                //     "testTime": "2016-12-25 18:00:00", //测试时间：yyyy-MM-dd HH:mm:ss
                //     }
                // ]

                this.DataList.push(param);
                l.w(param);

                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                commit('tooltipInfoSet', `历史脉搏数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
            }
        };
        PulseDataHandler._initialized = true;
    }
}

