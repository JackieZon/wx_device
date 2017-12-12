import { base_url } from './../subei_config'
export let DataInterface =
    {
        AddDeviceDataSport: function (param) {
            ajaxPostJson_Json(base_url + '/api/Device/AddDeviceDataSport?DeviceDeviceId=' + vm.deviceInfo.deviceId, param, function (b, data) {

                if (!data.status) {
                    l.e(data.info);
                    return;
                }

            })
        },
        AddDeviceDataSleep: function (param) {
            ajaxPostJson_Json(base_url + '/api/Device/AddDeviceDataSleep?DeviceDeviceId=' + vm.deviceInfo.deviceId + '&OpeinId=' + vm.userInfo.openId, param, function (b, data) {

                if (!data.status) {
                    l.e(data.info);
                    return;
                }

            })
        },
        AddDeviceDataPulse: function (param) {
            ajaxPostJson_Json(base_url + '/api/Device/AddDeviceDataPulse?DeviceDeviceId=' + vm.deviceInfo.deviceId + '&OpeinId=' + vm.userInfo.openId, param, function (b, data) {

                if (!data.status) {
                    l.e(data.info);
                    return;
                }

            })
        },
        AddDeviceDataTempRHPress: function (param) {
            ajaxPostJson_Json(base_url + '/api/Device/AddDeviceDataTempRHPress?DeviceDeviceId=' + vm.deviceInfo.deviceId, param, function (b, data) {

                if (!data.status) {
                    l.e(data.info);
                    return;
                }

            })
        },

        GetHistoryData: function (data, deviceId,callback) {

            if (typeof deviceId == "undefined")
                deviceId = 'gh_7aa2dfc37acb_62a7c7778fc6d0a2';
            ajaxPostJson_Json(base_url + '/api/Device/GetHistoryData?DeviceDeviceId=' + deviceId + '&datatime=' + data, {}, function (b, data) {

                if (!data.status) {
                    l.e(data.info);
                    return;
                }
                 

            })
        },
    }