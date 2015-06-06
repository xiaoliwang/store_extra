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
        return type === 'string'? val:JSON.stringify(val)
    };

    store.deserialize = function(val){
        if(typeof val !== 'string') return undefined;
        try{
            return JSON.parse(val)
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
            if(val === undefined) return store.remove(key);

            var type_key = 'type' + key,
                val_key = 'val' + key;
            var type = typeof val;

            storage.setItem(type_key, type);
            storage.setItem(val_key, store.serialize(val));
            return true;
        }

        store.get = function(key,defaultVal){
            var type_key = 'type' + key,
                val_key = 'val' + key,
                val;

            var type = storage.getItem(type_key);
            switch(type){
                case 'number':
                    val = Number(storage.getItem(val_key));break;
                case 'boolean':
                    val = Boolean(storage.getItem(val_key));break;
                case 'string':
                    val = storage.getItem(val_key);break;
                default:
                    val = store.deserialize(storage.getItem(key));
            }
            return val? val: defaultVal;
        }

        store.has = function(key){
            var type_key = 'type' + key;
            return store.get(type_key) !== undefined;
        }

        store.remove = function (key) {
            var type_key = 'type' + key;
            var val_key = 'val' + key;
            if(store.has(key)){
                storage.removeItem(type_key);
                storage.removeItem(val_key);
                return true;
            }else{
                return false;
            }
        }

        store.clear = function(){
            var num = storage.length / 2;
            storage.clear();
            return num;
        }

        store.forEach = function(callback){
            for (var i=0; i<storage.length; i++) {
                var key = storage.key(i);
                if(/^val/.test(key)){
                    callback(key.replace(/^val/,''), store.get(key));
                }
            }
        }

        store.on = function(events, callback, context){
            var test = function(){

            }
            window.addEventListener(events, callback, false);
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
