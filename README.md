##store_extra

本地存储及跨页面事件,支持IE8及以上版本

-----------------------------
####是否支持
点击demo/support.html查看

---------------
####本地存储
**例子：**demo/demo.js.html
```js
/**
 * 设置键值对
 * @param
 * string key
 * mixed value ，value可以为任意类型，如果value为null或者''则删除该key
 * @return
 * boolean success or not 添加成功或删除成功，返回true，否则返回false
 */
store.set(key,value);

/**
 * 不存在时设置
 * @param
 * string key
 * mixed value
 * @return
 * boolean success or not 设置成功返回success，否则返回false
 */
store.setnx(key, value);

/**
 * 设置生命周期键值对
 * @param
 * string key
 * int milliseconds
 * mixed value
 *
 */
store.setex(key, millisec, value);

/**
 * 根据key获取值
 * @param
 * string key
 * mixed defaultValue 默认值
 * @return
 * mixed value 如果值存在，则返回值，否则返回默认值
 */
store.get(key,defaultValue)；

/**
 * 获取所有的键值对
 * @return
 * object key:value
 */
store.getAll();

/**
 * 判断key是否存在
 * @param
 * string key
 * @return
 * boolean exists
 */
store.has(key);


/**
 * 判断key的类型
 * @param
 * string key
 * @return
 * string type or undefined 如果key不存在，则返回undefined
 */
store.type(key);

/**
 * 获取键的数量
 * @param
 * string or regexp patten 不传参数，则返回所有key的数量
 * @return
 * int number
 */
store.length(patten);

/**
 * 删除键
 * @param
 * string key
 * @return
 * boolean success or not 删除成功返回ture，否则返回false
 */
store.remove(key);

/**
 * 清空键
 * @return
 * int number 返回删除了多少键
 */
store.clear();

/**
 * 遍历方法
 * @param
 * function callback
 *  @param
 *      key
 *      value
 */
store.forEach(callback(key,value));
```

-----------------------
####跨页面事件（不监听本页面事件发射）
**例子：**demo/demo.event.html
```js
/**
 * 事件监听
 * @param
 * string event
 * function callback 回调函数的参数为事件发射参数
 * @return
 * string eventId 事件id
 */
store.on(event,callback);

/**
 * 事件发射
 * string event
 * ...params 发射的每一个参数都能在监听函数的回调函数中取得
 */
store.emit(event,...params);

/**
 * 事件取消监听
 * @param
 * stirng eventId
 */
store.off(eventId);
```