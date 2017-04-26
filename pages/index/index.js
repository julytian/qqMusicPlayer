//获取应用实例
var app = getApp();
var util = require('../../utils/util.js');
var that;
Page({
  data: {
    navbar: [
      '推荐', '排行榜', '搜索'
    ],
    currentTab: 0, // 导航栏切换索引
    slider: [],
    radioList: [],
    songList: [],
    topList: [],
    scrollviewH: 0, // 搜索结果的scrollview高度

    inputFocus: false, // 搜索框是否获取焦点
    searchKeyword: "", // 搜索关键词
    searchHotShow: true, // 是否显示热门搜索
    searchHistoryShow: false, // 是否显示搜索历史
    searchResultShow: false, // 是否显示搜索结果
    searchCancelShow: false, // 是否显示取消按钮

    searchHistorys: [], // 搜索历史记录
    searchSongList: [], // 搜索结果
    searchPageNum: 1, // 分页数
    searchLoading: false, // 加载更多
    searchLoadingComplete: false, // 加载更多结束
    scrollFlag: true, // 上拉分页加载条件

    searchPageSize: 0, // 每页多少
    searchTotalNum: 0, // 结果总条数
    scrollToView: 'scrollTop', // 返回顶部位置
    backToTop: false, // 返回顶部
    
  },
  onLoad: function (options) {
    that = this;
    wx.showLoading({title: '数据加载中...', mask: true});
    //推荐频道 热门歌单
    util.getRecommend(function (data) {
      wx.hideLoading();
      that.setData({slider: data.data.slider, radioList: data.data.radioList, songList: data.data.songList});
    });
    //排行榜数据
    util.getToplist(function (data) {
      // 过滤巅峰mv榜
      that.setData({
        topList: data.filter((item, i) => item.id != 201)
      });
    });
    //搜索频道 热门搜索
    util.getHotSearch(function (data) {
      that.setData({hotkey: data.data.hotkey, special: data.data.special_key});
    });
    // 设置search 结果scrollview的高度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollviewH: res.windowHeight - 90
        });
      }
    });

    // 历史浏览记录 从本地缓存中获取前10条数据
    var searchHistorys = wx.getStorageSync('searchHistorys') || [];
    if (searchHistorys.length > 0) {
      that.setData({
        searchHistorys: searchHistorys.length >= 10
          ? searchHistorys.slice(0, 10)
          : searchHistorys
      });
    }
  },
  // 导航栏操作
  onNavbarTap: function (ev) {
    this.setData({currentTab: ev.currentTarget.dataset.index});
  },
  // 搜索框获取焦点
  onSearchFocus: function (ev) {
    var searchKeyword = that.data.searchKeyword;
    if (searchKeyword.trim()) {
      that.setData({searchHotShow: false, searchHistoryShow: false, searchResultShow: true, searchCancelShow: true});
    } else {
      that.setData({searchHotShow: false, searchHistoryShow: true, searchResultShow: false, searchCancelShow: true});
    }

  },
  // 搜索取消
  onSearchCancel: function () {
    that.setData({
      searchHotShow: true,
      searchHistoryShow: false,
      searchResultShow: false,
      searchCancelShow: false,
      searchKeyword: '',
      inputFocus: false
    });
  },
  // 搜索输入值时的操作
  onSearchInput: function (ev) {
    that.setData({searchKeyword: ev.detail.value});
  },
  // 搜索框清除按钮
  onClearInput: function () {
    that.setData({
      searchHotShow: false,
      searchHistoryShow: true,
      searchResultShow: false,
      searchCancelShow: true,
      searchKeyword: '',
      inputFocus: true
    });
  },
  // 搜索确认搜索
  onSearchConfirm: function (ev) {
    var searchKeyword = ev.detail.value;
    var searchHistorys = that.data.searchHistorys;
    that.setData({searchKeyword: searchKeyword});
    if (searchKeyword.trim()) {
      // 添加搜索历史记录
      if (searchHistorys.length > 0) {
        if (searchHistorys.indexOf(searchKeyword) < 0) {
          searchHistorys.unshift(searchKeyword);
        }
      } else {
        searchHistorys.push(searchKeyword);
      }
      wx.setStorage({
        key: "searchHistorysKey",
        data: searchHistorys,
        success: function () {
          that.setData({searchHistorys: searchHistorys});
        }
      });

      this.setData({searchHotShow: false, searchHistoryShow: false, searchResultShow: true, searchSongList: []});
      this.onFetchSearchList(1);
    }
  },
  // 搜索结果
  onFetchSearchList: function (searchPageNum) {
    var searchKeyword = that.data.searchKeyword;
    that.setData({searchLoading: true, scrollFlag: false});
    util.getSearchMusic(searchKeyword, searchPageNum, function (res) {
      var res = res.data;
      that.setData({
        searchSongList: that
          .data
          .searchSongList
          .concat(res.song.list),
        zhida: res.zhida,
        searchLoading: false,
        searchPageNum: res.song.curpage,
        searchTotalNum: res.song.totalnum,
        searchPageSize: res.song.curnum,
        scrollFlag: true
      });
    });
  },
  // 删除单条历史记录
  onSearchHistoryDelete: function (ev) {
    var item = ev.currentTarget.dataset.item;
    var searchHistorys = wx.getStorageSync('searchHistorysKey');
    searchHistorys.splice(searchHistorys.indexOf(item), 1);
    wx.setStorage({
      key: "searchHistorysKey",
      data: searchHistorys,
      success: function () {
        that.setData({searchHistorys: searchHistorys});
      }
    });
  },
  // 清除所有历史记录
  onSearchHistoryDeleteAll: function () {
    wx.removeStorage({
      key: 'searchHistorysKey',
      success: function (res) {
        that.setData({searchHistorys: []});
      }
    });
  },
  // 滚动分页加载
  onScrollLower: function () {
    if (that.data.scrollFlag) {
      var num = that.data.searchPageNum + 1;
      var total = Math.ceil(that.data.searchTotalNum / that.data.searchPageSize);
      if (num > total) {
        that.setData({searchLoadingComplete: true});
        return;
      } else {
        if (num == total) {
          that.setData({searchLoading: true});
        } else {
          that.setData({searchLoading: false});
        }
        that.setData({searchPageNum: num});
        that.onFetchSearchList(that.data.searchPageNum);
      }
    }
  },
  // 滚动计算滚动条距离
  onScroll: function (ev) {
    var scrollTop = ev.detail.scrollTop;
    if (scrollTop > 500) {
      that.setData({backToTop: true});
    } else {
      that.setData({backToTop: false});
    }
  },
  // 返回顶部
  onBackToTop: function () {
    that.setData({scrollToView: 'scrollTop', backToTop: false});
  },
  // 跳转到cdlist
  onCdlistTap: function (ev) {
    var id = ev.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../cdlist/cdlist?cdListId=' + id
    });
  },
  // 跳到到toplist
  onToplistTap: function (ev) {
    var id = ev.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../toplist/toplist?topListId=' + id
    });
  },
  // 热门搜索点击执行搜索
  onHotkeyTap: function (ev) {
    var word = ev.currentTarget.dataset.text;
    this.setData({
      searchSongList: [],
      searchHotShow: false,
      searchHistoryShow: false,
      searchResultShow: true,
      searchCancelShow: true,
      searchKeyword: ev
        .currentTarget
        .dataset
        .text
        .trim(),
      inputFocus: false
    });
    this.onFetchSearchList(1);
  },
  // 搜索结果跳到播放页
  onPlaysongTap: function (ev) {
    app.setGlobalData({songData: ev.currentTarget.dataset.data});
    var id = ev.currentTarget.dataset.id;
    var mid = ev.currentTarget.dataset.mid;
    var albummid = ev.currentTarget.dataset.albummid;
    var songFrom = ev.currentTarget.dataset.from;
    wx.navigateTo({
      url: '../playsong/playsong?id=' + id + '&mid=' + mid + "&albummid=" + albummid + '&songFrom=' + songFrom
    });
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'QQ音乐，陪伴你每一天', // 分享标题
      desc: '这是julytian制作的QQ音乐微信小程序', // 分享描述
      path: '/pages/index/index' // 分享路径
    }
  }
});
