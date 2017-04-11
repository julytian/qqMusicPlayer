var util = require('../../utils/util.js');
var app = getApp();
var that;
Page({
    data: {
        dissname: '',
        nickname: '',
        visitnum: 0,
        listBgColor: '',
        focusBg: '',
        songlist: [],
        songData: null,
        songlists: null
    },
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
        that = this;
        var id = options.cdListId;
        wx.showLoading({title: '数据加载中...', mask: true});
        util.getCdlistInfo(id, function (data) {
            wx.hideLoading();

            that.setData({
                songlists: data.songlist,
                songData: data,
                dissname: data.dissname,
                nickname: data.nickname,
                visitnum: data.visitnum,
                songlist: data.songlist,
                focusBg: data.logo,
                listBgColor: that.dealColor(data.logo)
            });
        });
    },
    // 计算背景色
    dealColor: function (pic_url) {
        util.calculateBgColor(pic_url, function (data) {
                var magic_color = data.magic_color;

                var r = (magic_color & 0x00ff0000) >> 16,
                    g = (magic_color & 0x0000ff00) >> 8,
                    b = (magic_color & 0x000000ff);
                that.setData({
                    listBgColor: 'rgb(' + r + ',' + g + ',' + b + ')'
                })
                return 'rgb(' + r + ',' + g + ',' + b + ')';
            });
    },
    // 点击跳转播放
    playsongTap: function (ev) {
        app.setGlobalData({songData: ev.currentTarget.dataset.data, songlists: this.data.songlists});
        var id = ev.currentTarget.dataset.id;
        var mid = ev.currentTarget.dataset.mid;
        var albummid = ev.currentTarget.dataset.albummid;
        var songFrom = ev.currentTarget.dataset.from;
        var no = ev.currentTarget.dataset.no;
        wx.navigateTo({
            url: '../playsong/playsong?id=' + id + '&mid=' + mid + "&albummid=" + albummid + '&songFrom=' + songFrom + '&no=' + no
        });
    }
});