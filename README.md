##1、数据/文件同步协议

###协议通用部分,由中心向医院服务器发出
    {
        cmd: "async_xxx", //协议名    
    }



###1.1文件同步协议
    {
        cmd: "async_filelist",
        asyncName: "cyl_hospital",
        files: [
            {fileName: "http://xxxx.xxx.xx/a.html", size: 199},
            {fileName: "http://xxxx.xxx.xx/b.html", size: 399},
            {fileName: "http://xxxx.xxx.xx/img/c.jpg", size: 2199}        
        ]
    }
####=> 返回
    {
        code: 0,  //状态
        data: {   //同步处理情况
            failedList:  //汇报同步错误的部分
            [ 
                {}
            ]
        }
    }

###1.2数据库同步协议：
    {
        cmd: "async_db",
        tableName: "",
        rows: [
            {id: 11, col1: 'dbval1', col2: 'dbval2'},
            {id: 15, col1: 'dbval2', col2: 'dbval5'},
            {id: 19, col1: 'dbval3', col2: 'dbval9'}
        ]
    }
####=> 返回
    {
        code: 0,  //状态
        data: {   //同步处理情况
            failedList:  //汇报同步错误的部分
            [ 
                {}
            ]
        }
    }
    
###1.3app版本更新协议：
    {
        cmd: "async_appversion",
        version: "2.0.9",
        hospitalAlias: "bjcyl",
        apkurl: "http://xxx.xx.com/apk/app.2.0.9.apk"
    }
####=> 返回
    {
        code: 0,  //同步状态、下载失败状态码...        
    }
    
    
##2、设备查询/监控协议
###2.1、查询设备基本状态,由中心向医院服务器发出
    {
        cmd: "query_deviceinfo"
    }
####=> 返回
    {
        code: 0,  //状态
        data: {   //
            list:  //汇报设备注册情况 
            [ 
                {deviceId:'c37892ui32', department: '骨科', roomnum: '605房', bednum: '6床'},
                {deviceId:'c37892ui32', department: '骨科', roomnum: '605房', bednum: '6床'},
                {deviceId:'c37892ui32', department: '骨科', roomnum: '605房', bednum: '6床'}
            ]
        }
    }
    
    
###2.2、查询设备状态协议,由中心向医院服务器发出
    {
        cmd: "query_devicelive"
    }
####=> 返回
    {
        code: 0,  //状态
        data: {   //
            list: //汇报设备最后登录时间 
            [ 
                {deviceId:'c37892ui32', lastLoginTime: 13398782900},
                {deviceId:'c37892ui32', lastLoginTime: 13398782900},
                {deviceId:'c37892ui32', lastLoginTime: 13398782900},
            ]
        }
    }
    
###2.3、查询服务器日志,由中心向医院服务器发出
    {
        cmd: "query_log",
        starttime: 133987892300,
        endtime: 133987892300
    }
####=> 返回
    {
        code: 0,  //状态
        data: {   //同步处理情况
            failList:  //汇报同步错误的部分 
            [ 
                {deviceId:'c37892ui32', lastLoginTime: 13398782900},
                {deviceId:'c37892ui32', lastLoginTime: 13398782900},
                {deviceId:'c37892ui32', lastLoginTime: 13398782900},
            ]
        }
    }