// api配置
var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    navbar: ['推荐', '排行榜', '搜索'],
    currentTab: 0,
    slider: [],
    radioList: [],
    songList: [],
    topList: [],
    inputShowed: false,
    searchKeyword: "",
    hotkey: [],
    special: '',
    searchSongList: [],
    zhida: {},
    searchPageNum: 1,
    searchLoading: false,
    isFromSearch: true,
    searchLoadingComplete: false
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var that = this;
    //推荐频道
    util.getRecommend(function (data) {
      that.setData({
        slider: data.data.slider,
        radioList: data.data.radioList,
        songList: data.data.songList
      });
    });
    //排行榜数据
    util.getToplist(function (data) {
      that.setData({
        topList: data
      })
    });
    //搜索频道
    util.getHotSearch(function (data) {
      that.setData({
        hotkey: data.data.hotkey,
        special: data.data.special_key
      })
    });
  },
  // 切换tab
  navbarTap: function (ev) {
    this.setData({
      currentTab: ev.currentTarget.dataset.index
    })
  },
  // 展示搜索框
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  // 判断搜索
  searchInput: function () {
    if (this.data.searchKeyword.trim()) {
      this.setData({
        searchSongList: []
      });
      this.fetchSearchList();
    }
  },
  // 上拉加载更多
  searchScrollLower: function () {
    let that = this;
    if (that.data.searchLoading && !that.data.searchLoadingComplete) {
      that.setData({
        searchPageNum: that.data.searchPageNum + 1,
        isFromSearch: false
      });
      that.fetchSearchList();
    }
  },
  // 搜索列表
  fetchSearchList: function () {
    var that = this;
    var searchKeyword = that.data.searchKeyword;
    var searchPageNum = that.data.searchPageNum;
    util.getSearchMusic(searchKeyword, searchPageNum, function (data) {
      
      if (data.data.song.curnum != 0) {
        var searchList = [];
        that.data.isFromSearch ? searchList = data.data.song.list : searchList = that.data.searchSongList.concat(data.data.song.list);
        that.setData({
          searchSongList: searchList,
          zhida: data.data.zhida,
          searchLoading: true
        });
      } else {
        that.setData({
          searchLoadingComplete: true,
          searchLoading: false
        });
      }
    })
  },
  // 清除搜索结果
  clearInput: function () {
    this.setData({
      searchKeyword: "",
      inputShowed: false,
      searchSongList: []
    });
  },
  // 展示搜索框
  inputTyping: function (ev) {
    this.setData({
      searchPageNum: 1,
      isFromSearch: true
    });
    this.setData({
      searchKeyword: ev.detail.value
    });
  },
  // 热门搜索
  hotkeyTap: function (ev) {
    var word = ev.currentTarget.dataset.text;
    this.setData({
      searchKeyword: ev.currentTarget.dataset.text.trim(),
      inputShowed: true
    });
    this.fetchSearchList();
  },
  // 跳转播放歌曲
  playsongTap: function (ev) {
    app.setGlobalData({
      songData: ev.currentTarget.dataset.data
    });
    var id = ev.currentTarget.dataset.id;
    var mid = ev.currentTarget.dataset.mid;
    var albummid = ev.currentTarget.dataset.albummid;
    var songFrom = ev.currentTarget.dataset.from;
    wx.navigateTo({
      url: '../playsong/playsong?id=' + id + '&mid=' + mid + "&albummid=" + albummid + '&songFrom=' + songFrom
    });
  },
  // top排行榜点击跳转
  toplistTap: function (ev) {
    app.setGlobalData({
      topListId: ev.currentTarget.dataset.id
    });
    wx.navigateTo({
      url: '../toplist/toplist'
    });
  },
  // recommend排行榜点击跳转
  cdlistTap: function (ev) {
    app.setGlobalData({
      cdListId: ev.currentTarget.dataset.id
    });
    wx.navigateTo({
      url: '../cdlist/cdlist'
    });
  },
  // 分享
  onShareAppMessage: function () {
    return {
      title: 'QQ音乐',
      desc: '这是仿制QQ音乐的H5版本，由julytian制作',
      path: 'pages/index/index'
    }
  }
})