/**
 * Created by masque on 2017/6/22.
 */
$(document).ready(function(){
    WINDOW_MAIN = new WINDOW_MAIN();
    widgetInit();
    auto();
    WINDOW_MAIN.init();
});
var WINDOW_MAIN = function () {
    var fundCode = null;
    var self = this;
    var data = null;
    var dateList = new Array();//日期array
    var dataList = new Array();
    var diff = null;//差值   方便查看走势使用累计净值计算，但是查看现有的走势又需要单位净值 所以这里换算了下，如果差值为0说明无历史分红拆分等
    self.init = function () {
        widgetInit();
        fundCode = getQueryString('fund_code');
        var $ul = $('#left-menu li');
        $.each($ul,function (index, value, array) {
            var $this = $(value);
            $this.bind("click",function () {
                var curIndex = $this.data('index');
                $.each($ul,function (index, value, array) {
                    $(value).removeClass('active');
                    if($(value).data('index') == curIndex){
                        $(value).addClass('active');
                    }
                });
                $.each($('div.right-main').children('div'),function (index, value, array) {
                    if($(value).data('index') != curIndex){
                        $(value).addClass('hidden');
                    }else{
                        $(value).removeClass('hidden');
                    }
                });
                switch (curIndex)
                {
                    case 0:
                        if(isEmpty($('div[data-index=0]').html())){
                            self.pullData();
                        }
                        break;
                    case 1:
                        if(isEmpty($('div[data-index=1]').html())){
                            self.playChart();
                        }
                        break;
                    case 2:
                        if(isEmpty($('div[data-index=2]').html())){
                            self.playBackChart();
                        }
                        break;
                    case 3:
                        break;
                }
            });
        });
        $('#searchBtn').bind("click",function () {
            var _sdate = '',_edate = '';
            var fund_code = $('#fund_code').val();
            if(!fund_code){
                //http://t4t5.github.io/sweetalert/
                swal(
                    {
                        title: "温馨提示:",
                        type: "error",
                        text: "<span style=\"color:#F00\">请先查询基金代码或名称.</span>",
                        timer: 3000,
                        showConfirmButton: true ,
                        html: true
                    }
                );
                return;
            }
            var query_dates = $('#reportrange').val();
            if(query_dates){
                _sdate = query_dates.split('#')[0];
                _edate = query_dates.split('#')[1];
            }
            var _url = window.location.pathname + '?fund_code=' + fund_code + '&sdate=' + _sdate + '&edate=' + _edate;
            window.open(_url);
        });
        $('#autoTest').parent().children('a').bind("click",function () {
            $('#autoTest').val('');
            $('#fund_code').val('');
        });
        self.pullData();
        self.searchDetail();
    };
    /**
     *
     * @param _fund_code 基金代码
     * @param _length    数据天数
     * @param _sdate     开始日期
     * @param _edate     结束日期
     */
    self.pullData = function (_sdate,_edate) {
        if(!_sdate){
            _sdate = getQueryString('sdate');
        }
        if(!_edate){
            _edate = getQueryString('edate');
        }
        var url = 'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code='+fundCode+'&page=1&per=10000&sdate='+_sdate+'&edate='+_edate+'&rt=0.01230440990261572';
        $('head').append('<script id="fundlist" src="'+url+'"></script>');
        var id = 0;
        (function(){
            /*可能由于网络原因还未加载完成*/
            id = setInterval(function () {
                try{
                    if(apidata != undefined){
                        clearInterval(id);
                        data = apidata;
                        $('div[data-index=0]').html(data.content);
                        (function (d) {
                            $.each($(d).find('tbody tr'),function (index) {
                                if(index == 0){
                                    diff = math.chain($($(this).find('td')[2]).html()).subtract($($(this).find('td')[1]).html()).done();
                                }
                                dateList.unshift($($(this).find('td')[0]).html());//取日期
                                dataList.unshift($($(this).find('td')[2]).html());//取累计净值
                            });
                            console.info('diff:'+diff);
                        })(data.content)
                        apidata = null;
                        $('#fundlist').remove();//销毁
                    }
                }catch (e){//apidata是接口返回的接口较慢时会发生异常
                }
            },300);
        })();
    };
    self.searchDetail = function () {
        var url = 'http://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key='+fundCode;
        $.ajax({
            url:url,
            dataType:'jsonp',
            cache:true,
            crossDomain: true,
            async: false,
            success: function(data){
                //console.info(data.Datas[0].NAME);
                if(data.Datas.length != 0)
                $('title').html(data.Datas[0].NAME);
            },
            error:function (data) {
                console.error('获取基金详情异常.');
            }
        });
    }
    self.playChart = function () {
        if(dateList.length == 0 || dataList.length == 0 || dateList.length != dataList.length){
            console.error('数据加载异常');
            return;
        }
        var $dataList = new Array();
        if(diff == 0){
            $dataList = dataList;
        }else{
            for(var i = 0;i<dataList.length;i++){
                $dataList.push((dataList[i] - diff).toPrecision(4));
            }
        }
        var max = math.chain($dataList.max()).multiply(1.05).done().toPrecision(4);
        var min = math.chain($dataList.min()).multiply(0.95).done().toPrecision(4);
        console.info('max:'+max);
        console.info('min:'+min);
        var $data10 = new Array();
        var $data20 = new Array();
        var $data30 = new Array();
        var $data50 = new Array();
        for(var i = $dataList.length;i>0;i--){
            var endIndex10 = i - 10 < 0 ? 0 : i - 10;
            var endIndex20 = i - 20 < 0 ? 0 : i - 20;
            var endIndex30 = i - 30 < 0 ? 0 : i - 30;
            var endIndex50 = i - 50 < 0 ? 0 : i - 50;
            $data10.unshift($dataList.slice(endIndex10,i).avg());
            $data20.unshift($dataList.slice(endIndex20,i).avg());
            $data30.unshift($dataList.slice(endIndex30,i).avg());
            $data50.unshift($dataList.slice(endIndex50,i).avg());
        }
        $('li[data-day=10]').html((($data10[$data10.length-1]/$dataList[$dataList.length-1]-1)*100).toPrecision(2));
        $('li[data-day=20]').html((($data20[$data20.length-1]/$dataList[$dataList.length-1]-1)*100).toPrecision(2));
        $('li[data-day=30]').html((($data30[$data30.length-1]/$dataList[$dataList.length-1]-1)*100).toPrecision(2));
        $('li[data-day=50]').html((($data50[$data50.length-1]/$dataList[$dataList.length-1]-1)*100).toPrecision(2));
        var myChart = echarts.init($('div[data-index=1]').get(0));
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: $('title').html()
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:legendData
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dateList
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: true
                },
                min: min,
                max: max
            },
            series: [
                {
                    name:'今日',
                    type:'line',
                    data:$dataList
                },
                {
                    name:'10日',
                    type:'line',
                    data:$data10
                },
                {
                    name:'20日',
                    type:'line',
                    data:$data20
                },
                {
                    name:'30日',
                    type:'line',
                    data:$data30
                },
                {
                    name:'50日',
                    type:'line',
                    data:$data50
                }
            ]
        };
        myChart.setOption(option);
        //$('div.chart-height').removeClass('chart-height');
    };
    self.playBackChart = function () {
        var backList = new Array();
        var ipList = new Array();
        var hisMax = null;
        for(var i = 0;i<dataList.length;i++){
            if(hisMax == null){
                hisMax = dataList[i];
            }else{
                hisMax = Math.max(dataList[i],hisMax);
            }
            backList.push(hisMax);
        }
        for(var i = 0;i<backList.length;i++){
            ipList.push(incrementProportion(dataList[i],backList[i]));
        }
        var max = math.chain(ipList.max()).multiply(1.05).done().toPrecision(4);
        var min = math.chain(ipList.min()).multiply(0.95).done().toPrecision(4);
        var myChart = echarts.init($('div[data-index=2]').get(0));
        // 指定图表的配置项和数据
        var option = {
            title: {
                text: $('title').html()
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data:['当日']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dateList
            },
            yAxis: {
                type: 'value',
                boundaryGap: [0, '100%'],
                splitLine: {
                    show: true
                },
                min: min,
                max: max
            },
            series: [
                {
                    name:'当日',
                    type:'line',
                    data:ipList
                }
            ]
        };
        myChart.setOption(option);
    }
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

function incrementProportion(b,s) {
    return ((Math.abs(s/b - 1))*100).toPrecision(2);
}

Array.prototype.sum = function () {
    var sum = math.chain('0');
    for(var i = 0; i < this.length; i++) {
        sum = sum.add(this[i]);
    }
    return sum.done().toPrecision(4);
}

Array.prototype.avg = function () {
    var sum = math.chain('0');
    for(var i = 0; i < this.length; i++) {
        sum = sum.add(this[i]);
    }
    return sum.divide(this.length).done().toPrecision(4);
}

Array.prototype.max = function () {
    var max = null;
    for(var i = 0; i < this.length; i++) {
        if(max == null) max = this[i];
        max = Math.max(max,this[i]);
    }
    return max;
}

Array.prototype.min = function () {
    var min = null;
    for(var i = 0; i < this.length; i++) {
        if(min == null) min = this[i];
        min = Math.min(min,this[i]);
    }
    return min;
}

function isEmpty(data) {
    if(data == null || data == undefined){
        return true;
    }
    return $.trim(data) == '';
}

function widgetInit() {
    var start = moment().subtract(365, 'days');
    var end = moment();

    function cb(start, end) {
        $('#reportrange span').html(start.format('YYYY-MM-DD') + ' ~ ' + end.format('YYYY-MM-DD'));
        $('#reportrange').val(start.format('YYYY-MM-DD') + '#' + end.format('YYYY-MM-DD'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        opens : 'left',
        ranges: {
            //'今天': [moment(), moment()],
            //'昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '最近七天': [moment().subtract(6, 'days'), moment()],
            '最近一个月': [moment().subtract(29, 'days'), moment()],
            '本月': [moment().startOf('month'), moment().endOf('month')],
            '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            '最近三个月':[moment().subtract(89, 'days'), moment()],
            '最近六个月':[moment().subtract(179, 'days'), moment()]
        },
        locale : {
            applyLabel : '确定',
            //cancelLabel : '取消',
            fromLabel : '起始时间',
            toLabel : '结束时间',
            customRangeLabel : '自定义',
            daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],
            monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月' ],
            firstDay : 1  ,
            cancelLabel: '清除'
        }
    }, cb);
    cb(start, end);
    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD') + '#' + picker.endDate.format('YYYY-MM-DD'));
    });
    $('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
        $(this).find('span').html('');
        $(this).val('');
    });
}

function auto() {

    var $input =  $("#autoTest");
    $input.typeahead({
        source: function(query, process) {
            return $.ajax({
                type: "get",
                async: false,
                url: "http://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?_=1499178144334",
                dataType: "jsonp",
                jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
                jsonpCallback:"jQuery18306001083291339724_1499178072719",
                data:{
                    m:'1',
                    key:$('#autoTest').val()
                },
                success: function(json){
                    if(json.Datas.length > 0){
                        var dataShow = new Array();
                        $.each(json.Datas,function () {
                            var obj = new Object();
                            obj.id = this._id;
                            obj.name = this.NAME;
                            dataShow.push(obj);
                        });
                        process(dataShow);
                    }
                },
                error: function(){
                   console.info('fail');
                }
            });
            //ajax loading data  http://www.cnblogs.com/haogj/p/3376874.html
        },
        autoSelect: true,
        displayText: function (item) {
            return  item.name+ "[" + item.id+ "]";
        },
        afterSelect: function (item) {
            $('#autoTest').attr('title',item.name+ "[" + item.id+ "]");
            $('#fund_code').val(item.id);
            return item;
        }

    });
}