###
Created by 杰朋 on 2015/6/14.
###
((root, factory) ->
  if module? and typeof exports is 'object'
    module.exports = do factory
  else if define? and define.amd
    define([], factory)
  else
    root.store = do factory
  0
) window, ->
  win = window
  doc = window.document

  store =
    enabled: true
    version: '0.0.4'
    storageNull: null
    eventFuns: {}
    eventIndex: 0
    Sys: {}

  ua = navigator.userAgent.toLowerCase()
  if s = ua.match /rv:([\d.]+)\) like gecko/ then store.Sys.ie = s[1] else
    if s = ua.match /msie ([\d.]+)/ then  store.Sys.ie = s[1] else
      if s = ua.match /firefox\/([\d.]+)/ then store.Sys.firefox = s[1] else
        if s = ua.match /chrome\/([\d.]+)/ then store.Sys.chrome = s[1] else
          if s = ua.match /opera.([\d.]+)/ then store.Sys.opera = s[1] else
            if s = ua.match /version\/([\d.]+).*safari/ then store.Sys.safari = s[1] else 0

  store.storageNull = '' if store.Sys.ie?

  store.transact = (key, transactionFn, defaultVal) ->
    val = store.get key, defaultVal
    val = transactionFn val
    store.set key, val
    val

  store.getAll = ->
    ret = {}
    store.forEach (key, val) ->
      ret[key] = val
    ret

  store.setnx = (key, val) ->
    if store.has key
      false
    else
      store.set(key, val)
      true

  store.setex = (key, millisec, val) ->
    store.set key, val
    setTimeout ()->
      store.remove key
    , millisec

  store.serialize = (val) ->
    type = typeof val
    if type is 'object'
      if val instanceof RegExp
        type = 'regexp'
        val = val.source
    type + '_' + if (type is 'string' || type is 'regexp') then val else JSON.stringify val

  store.deserialize = (val) ->
    return undefined if typeof val isnt 'string'
    index = val.indexOf '_'
    type = val.substring 0, index
    val = val.substring index+1
    try
      switch type
        when 'number' then val = Number val
        when 'boolean' then val = Boolean val
        when 'regexp' then val = new RegExp val
        when 'string'
        else val = JSON.parse val
      return val
    catch
        val if val?

  isStorageSupported =  -> if win.localStorage then true else false

  if do isStorageSupported
    storage = win.localStorage

    store.set = (key, val) ->
      return store.remove key if not val?
      storage.setItem key, store.serialize val
      true

    store.get = (key, defaultVal) ->
      val = store.deserialize storage.getItem key
      if val? then val else defaultVal

    store.has = (key) ->
      (storage.getItem key) isnt null

    store.type = (key) ->
      val = storage.getItem key;
      if val
        index = val.indexOf '_'
        val.substring 0, index

    store.length = (regexp) ->
      num = 0
      if regexp
        patten = if regexp instanceof RegExp then regexp else new RegExp regexp
        (++num if patten.test val) for val, i in storage
      else
        num = storage.length
      num

    store.remove = (key) ->
      if store.has key
        storage.removeItem key
        true
      else
        false

    store.clear = ->
      num = storage.length
      do storage.clear
      num

    store.forEach = (callback) ->
      for i in [0...storage.length]
        key = storage.key i
        callback key, store.get key

    store.on = (event, callback) ->
      eventFun1 = (e) ->
        unless do doc.hasFocus
          key = 'event' + event
          callback.apply this, store.deserialize e.newValue if e.oldValue is store.storageNull if e.key is key
        0
      eventFun2 = (e) ->
        unless do doc.hasFocus
          args = store.get '_last_storage_event_key_value'
          messageKey = do args.shift
          callback.apply this, args if message is event
        0
      eventId = '#' + (++store.eventIndex)
      unless('onstorage' in doc)
        win.addEventListener 'storage', eventFun1, false
        store.eventFuns[eventId] = eventFun1
      else
        doc.attachEvent 'onstorage', eventFun2
        store.eventFuns[eventId] = eventFuns
      eventId

    store.off = (eventId) ->
      event = store.eventFuns[eventId]
      unless 'onstorage' in doc
        win.removeEventListener 'storage', event, false
      else
        doc.detachEvent('onstorage', event)
      delete store.eventFuns[eventId]

    store.emit = (event, args...)->
      throw new TypeError "Failed to execute 'emit' on 'store': 1 argument required, but only 0 present." unless event?
      unless 'onstorage' in doc
        event = 'event' + event
        store.set event, args
        storage.removeItem event
      else
        store.setex '_last_storage_event_key_value', 500, arg

  try
    test_key = '__storejs__'
    store.set test_key, test_key
    store.enabled = false unless store.get(test_key) is test_key
    store.remove test_key
  catch
    store.enabled = false

  store