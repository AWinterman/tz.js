(function() {
  var tz =      typeof TZINFO !== 'undefined' ? TZINFO : require('./tz')
    , is_dst =  typeof is_dst !== 'undefined' ? is_dst : require('dst')

  function get_offset_fmt(tzoffs) {
    var offs = ~~(tzoffs / 60)
      , mins = ('00' + ~~Math.abs(tzoffs % 60)).slice(-2)

    offs = ((tzoffs > 0) ? '-' : '+') + ('00' + Math.abs(offs)).slice(-2) + mins

    return offs
  }

  function tzinfo(date, tz_list, determine_dst, TZ) {

    var fmt = get_offset_fmt(date.getTimezoneOffset())

    TZ = TZ || tz
    tz_list = tz_list || TZ[fmt]
    determine_dst = determine_dst || is_dst

    var date_is_dst = determine_dst(date)
      , date_dst_thresholds = determine_dst.find_thresholds()
      , has_dst = date_dst_thresholds.spring_forward !== date_dst_thresholds.fall_back
      , is_north = has_dst && date_dst_thresholds.spring_forward < date_dst_thresholds.fall_back 
      , list = (tz_list || []).slice()
      , filtered = []

    if(!is_north)
      list = list.reverse()

    for(var i = 0, len = list.length; i < len; ++i) {
      if(date_is_dst === /([Dd]aylight|[Ss]ummer)/.test(list[i].name)) {
        filtered.push(list[i])
      }
    }
    list = filtered
    if(!list.length) return {}

    return {
        'name':     list[0].name
      , 'loc':      list[0].loc
      , 'abbr':     list[0].abbr
      , 'offset':   fmt
    }
  } 

  tzinfo.get_offset_format = get_offset_fmt
  tzinfo.tz_list = tz
  
  Date.prototype.tzinfo = function() {
    return tzinfo(this)
  }

  Date.prototype.tzoffset = function() {
    return 'GMT'+get_offset_fmt(this)
  }

  if(typeof module !== undefined)
    module.exports = tzinfo
  else
    window.tzinfo = tzinfo
})()
