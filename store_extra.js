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

    //方法初始化
    store.set = function(key, value){};
    store.get = function(key, defaultVal){};
    store.has = function(key){};
    store.type = function(key){};
    store.length = function(patten){};
    store.remove = function(key){};
    store.clear = function(){};
    store.forEach = function(callback){};

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
            if(val === undefined || val === null) return store.remove(key);
            storage.setItem(key, store.serialize(val));
            return true;
        }

        store.get = function(key,defaultVal){
            var val = store.deserialize(storage.getItem(key));
            return val !== undefined || val !== null? val:
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
            if(regexp && typeof regexp === 'string'){
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
            window.addEventListener('storage',function(e){
                if(key !== null){
                    if(e.key === key){
                        if(e.newValue === null){
                            callback('remove', e.key, store.deserialize(e.oldValue));
                        }else if(e.oldValue === null){
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
            window.addEventListener('storage',function(e){
                var key = 'event' + event;
                if(e.key === key){
                    if(e.oldValue === null){
                        callback.apply(null,store.deserialize(e.newValue));
                    }
                }
            },false)
        }

        store.emit = function (){
            var arg = Array.prototype.slice.call(arguments);
            if(arg.length >= 1){
                var event = 'event' + arg.shift();
                store.set(event, arg);
                store.remove(event);
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
