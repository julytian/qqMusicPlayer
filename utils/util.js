function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


//过滤器
function formatWan(n) {
  n = n.toString();
  return (n / 10000).toFixed(1) + '万';
}

//获取推荐频道数据
function getRecommend(callback) {
  wx.request({
    url: 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      _: Date.now()
    },
    method: 'GET',
    header: { 'content-Type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data;
        var songlist = data.data.songList;
        for (var i = 0; i < songlist.length; i++) {
          songlist[i].accessnum = formatWan(songlist[i].accessnum);
        }
        callback(data);
      }
    }
  })
}

//获取热门搜索
function getHotSearch(callback) {
  wx.request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'jsonp',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      _: Date.now()
    },
    method: 'GET',
    header: { 'content-Type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data;
        data.data.hotkey = data.data.hotkey.slice(0, 8)
        callback(data);
      }
    }
  })
}

//获取搜索结果
function getSearchMusic(keyword, page, callback) {
  wx.request({
    url: 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      w: keyword,
      zhidaqu: 1,
      catZhida: 1,
      t: 0,
      flag: 1,
      ie: 'utf-8',
      sem: 1,
      aggr: 0,
      perpage: 20,
      n: 20,
      p: page,
      remoteplace: 'txt.mqq.all',
      _: Date.now()
    },
    method: 'GET',
    header: { 'content-Type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        callback(res.data);
      }
    }
  })
}


/*
** 排行榜相关api
*/

//获取排行榜频道数据
function getToplist(callback) {
  wx.request({
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg',
    data: {
      format: 'json',
      g_tk: 5381,
      uin: 0,
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      _: Date.now()
    },
    method: 'GET',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data;
        var toplist = data.data.topList;
        for (var i = 0; i < toplist.length; i++) {
          toplist[i].listenCount = formatWan(toplist[i].listenCount);
        }
        callback(toplist);
      }
    }
  })
}
//获取排行榜详细信息
function getToplistInfo(id, callback) {
  wx.request({
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      tpl: 3,
      page: 'detail',
      type: 'top',
      topid: id,
      _: Date.now()
    },
    method: 'GET',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        callback(res.data);
      }
    }
  })
}
//获取热门歌单数据
function getCdlistInfo(id, callback) {
  wx.request({
    url: 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      new_format: 1,
      pic: 500,
      disstid: id,
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      nosign: 1,
      _: new Date().getTime()
    },
    method: 'GET',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data;
        var cdlist = data.cdlist;
        for (var i = 0; i < cdlist.length; i++) {
          cdlist[i].visitnum = formatWan(cdlist[i].visitnum);
        }
        callback(cdlist[0]);
      }
    }
  });
}

/**
 * 设置背景色
 */
function calculateBgColor(pic_url, callback) {
  wx.request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_gedanpic_magiccolor.fcg',
    data: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      platform: 'h5',
      needNewCode: 1,
      pic_url: pic_url,
      _: new Date().getTime()
    },
    method: 'GET',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data;
        callback(res.data);
      }
    }
  });
}


/**
 * 获取歌词
 */
function getLyric(id, callback) {
  wx.request({
    url: 'https://route.showapi.com/213-2',
    data: {
      musicid: id,
      showapi_appid: '23654',
      showapi_timestamp: new Date().getTime(),
      showapi_sign: 'd23793312daf46ad88a06294772b7aac'
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      if (res.statusCode == 200) {
        callback(res.data);
      }
    }
  });
}

/**
 * 获取单首歌曲的信息
 */
function getSongInfo(id, mid, callback) {
  wx.request({
    url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_list_songinfo_cp.fcg',
    data: {
      url: 1,
      idlist: id,
      midlist: mid,
      typelist: 0
    },
    method: 'GET',
    header: { 'content-type': 'application/json' },
    success: function (res) {
      if (res.statusCode == 200) {
        var data = res.data.data;
        callback(data);
      }
    }
  });
}

module.exports = {
  formatTime: formatTime,
  getRecommend: getRecommend,
  getHotSearch: getHotSearch,
  getSearchMusic: getSearchMusic,
  getToplist: getToplist,
  getToplistInfo: getToplistInfo,
  getCdlistInfo: getCdlistInfo,
  calculateBgColor: calculateBgColor,
  getLyric: getLyric,
  getSongInfo:getSongInfo
}