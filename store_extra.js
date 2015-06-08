/**
 * Created by 杰朋 on 2015/6/6.
 */
"use strict"
;(function(root,factory){
    if(typeof module !== 'undefined' && typeof exports === 'object'){
        module .exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define([], factory);
    }else{
        root.store = factory();
    }
}(this,function(){
    var store = {},
    win = window,
    storage;

    store.enabled = true;
    store.version = '0.0.1';
    store.storageNull = null;
    store.Sys = {};

    //获取浏览器版本
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? store.Sys.ie = s[1] :
        (s = ua.match(/msie ([\d.]+)/)) ? store.Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? store.Sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? store.Sys.chrome = s[1] :
                    (s = ua.match(/opera.([\d.]+)/)) ? store.Sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? store.Sys.safari = s[1] : 0;

    if(store.Sys.ie){
        store.storageNull = '';
    }

    //方法初始化
    store.set = function(key, value){};
    store.get = function(key, defaultVal){};
    store.has = function(key){};
    store.type = function(key){};
    store.length = function(patten){};
    store.remove = function(key){};
    store.clear = function(){};
    store.forEach = function(callback){};
    store.onChange = function(key, callback){};
    store.on = function(event, callback){};
    store.emit = function(){};

    store.transact = function(){}; //以后添加

    //复杂方法
    store.getAll = function(){
        var ret = {};
        store.forEach(function(key, val){
            ret[key] = val;
        });
        return ret;
    }

    store.setnx = function(key, val) {
        if(store.has(key)){
            return false;
        }else{
            store.set(key,val);
            return true;
        }
    }

    store.serialize = function(val){
        var type = typeof val;
        if(type === 'object'){
            if(val instanceof RegExp){
                type = 'regexp';
                val = val.source;
            }
        }
        return type + '_' +((type === 'string' || type === 'regexp')? val:
            JSON.stringify(val));
    };

    store.deserialize = function(val){
        if(typeof val !== 'string') return undefined;

        var index = val.indexOf('_');
        var type = val.substring(0,index);
        val = val.substring(index + 1);
        try{
            switch(type){
                case 'number':
                    val = Number(val);break;
                case 'boolean':
                    val = Boolean(val);break;
                case 'regexp':
                    val = new RegExp(val);break;
                case 'string':
                    break;
                default:
                    val = JSON.parse(val);
            }
            return val;
        }catch(e) {
            return val || undefined;
        }
    }

    //判断是否支持localStorage
    function isStorageSupported(){
        return win.localStorage?true:false;
    }

    if(isStorageSupported()){
        storage = win.localStorage;

        store.set = function(key, val) {
            if(val == null || val === '') return store.remove(key);
            storage.setItem(key, store.serialize(val));
            return true;
        }

        store.get = function(key,defaultVal){
            var val = store.deserialize(storage.getItem(key));
            return (val != null || val !== '')? val:
                defaultVal;
        }

        store.has = function(key){
            return storage.getItem(key) !== null;
        }

        store.type = function(key){
            var val = storage.getItem(key);
            if(val){
                var index = val.indexOf('_');
                return val.substring(0,index);
            }else{
                return undefined;
            }
        }

        store.length = function(regexp){
            var num = 0, patten;
            if(regexp){
                if(regexp instanceof RegExp){
                    patten = regexp;
                }else {
                    patten = new RegExp(regexp);
                }
                for(var i =0; i<storage.length; i++){
                    if(patten.test(storage.key(i)))
                        ++num;
                }
                return num;
            }else{
                num = storage.length;
            }
            return num;
        }

        store.remove = function (key) {
            if(store.has(key)){
                storage.removeItem(key);
                return true;
            }else{
                return false;
            }
        }

        store.clear = function(){
            var num = storage.length;
            storage.clear();
            return num;
        }

        store.forEach = function(callback){
            for (var i=0; i<storage.length; i++) {
                var key = storage.key(i);
                callback(key,store.get(key));
            }
        }

        store.onChange = function(key, callback){
            win.addEventListener('storage',function(e){
                if(key !== store.storageNull){
                    if(e.key === key){
                        if(e.newValue === store.storageNull){
                            callback('remove', e.key, store.deserialize(e.oldValue));
                        }else if(e.oldValue === store.storageNull){
                            callback('new', e.key, store.deserialize(e.newValue));
                        }else{
                            callback('update', e.key,store.deserialize(e.newValue),
                                store.deserialize(e.oldValue));
                        }
                    }
                }else{
                    callback('clear');
                }

            },false);
        }

        store.on = function(event, callback){
            if(!('onstorage' in document)){
                win.addEventListener('storage',function(e){
                    if(!document.hasFocus()){
                        var key = 'event' + event;
                        if(e.key === key){
                            if(e.oldValue === store.storageNull){
                                callback.apply(this,store.deserialize(e.newValue));
                            }
                        }
                    }
                },false)
            }else{
                /*document.attachEvent('onstorage',function(e){
                    console.log(e);
                    if(!document.hasFocus()){
                        var key = 'event' + event;
                        if(e.key === key){
                            if(e.oldValue === store.storageNull){
                                callback.apply(this,store.deserialize(e.newValue));
                            }
                        }
                    }
                });*/
                document.attachEvent('onstorage',function(e){
                    if(!document.hasFocus()){
                        var key = 'event' + event;
                        var Ekey = store.get('_last_storage_event_key');
                        console.log(_last_sent_key);
                        if(Ekey === key){
                            var args = store.get(Ekey);
                            if(args){
                                callback.apply(this, args);
                            }
                        }
                        //storage.removeItem(Ekey);
                        //storage.removeItem('_last_storage_event_key');
                    }
                });
            }
        }

        store.emit = function (){
            var arg = Array.prototype.slice.call(arguments);
            if(arg.length >= 1){
                if(!('onstorage' in document)) {
                    var event = 'event' + arg.shift();
                    store.set(event, arg);
                    storage.removeItem(event);
                }else{
                    //IE8 fix missing storageEvent.key
                    var event = 'event' + arg.shift();
                    store.set(event, arg);
                    store.set('_last_storage_event_key',event);
                }
            }else{
                throw new TypeError("Failed to execute 'emit' on 'store': 1 argument required, but only 0 present.");
            }
        }

    }

    try{
        var test_key = '__storejs__';
        store.set(test_key, test_key);
        if(store.get(test_key) !== test_key) store.enabled = false;
        store.remove(test_key);
    }catch(e){
        store.enabled = false;
    }

    return store;
}));
