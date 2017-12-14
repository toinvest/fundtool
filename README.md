### 基金分析

### 基金工具
- [x] 均线分析
- [ ] 当日偏离均线
- [ ] 最大回撤
- [ ] 夏普值
- [ ] 比较
- [ ] 定投回测计算


### 数据来源

- [历史收益](http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code='+fundCode+'&page=1&per=10000&sdate='+_sdate+'&edate='+_edate+'&rt=0.01230440990261572')
- [时时获取估值](http://fundgz.1234567.com.cn/js/020003.js?rt=1513263470578)
  ```javascript
    jsonpgz(
        {
        fundcode: "020003",
        name: "国泰金龙行业精选",
        jzrq: "2017-12-13",
        dwjz: "0.6560",
        gsz: "0.6520",
        gszzl: "-0.61",
        gztime: "2017-12-14 15:00"
        }
        )
  ```