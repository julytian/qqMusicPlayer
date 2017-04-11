var util = require('../../utils/util.js');

var app = getApp();

Page({
  data: {
    topinfo: {},
    songlist: [],
    update_time: '',
    listBgColor: '',
    isLight: false
  },
  onLoad: function (options) {
    var that = this;
    var id = options.topListId;
    wx.showLoading({title: '数据加载中...', mask: true});
    util.getToplistInfo(id, function (data) {
      wx.hideLoading();
      if (data.color == '14737632') {
        that.setData({isLight: true})
      };
      that.setData({
        topinfo: data.topinfo,
        songlist: data.songlist,
        update_time: data.update_time,
        listBgColor: that.dealColor(data.color)
      });
    })
  },
  dealColor: function (rgb) {
    if (!rgb) {
      return;
    }
    var r = (rgb & 0x00ff0000) >> 16,
      g = (rgb & 0x0000ff00) >> 8,
      b = (rgb & 0x000000ff);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  },
  playsongTap: function (ev) {
    var that = this;
    app.setGlobalData({songData: ev.currentTarget.dataset.data, songlists: that.data.songlist});
    var id = ev.currentTarget.dataset.id;
    var mid = ev.currentTarget.dataset.mid;
    var albummid = ev.currentTarget.dataset.albummid;
    var songFrom = ev.currentTarget.dataset.from;
    var no = ev.currentTarget.dataset.no;
    wx.navigateTo({
      url: '../playsong/playsong?id=' + id + '&mid=' + mid + "&albummid=" + albummid + '&songFrom=' + songFrom + '&no=' + no
    });
  }
})