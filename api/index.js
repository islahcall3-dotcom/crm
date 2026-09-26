var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc9) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc9 = __getOwnPropDesc(from, key)) || desc9.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/fastify-plugin/lib/getPluginName.js
var require_getPluginName = __commonJS({
  "node_modules/fastify-plugin/lib/getPluginName.js"(exports, module) {
    "use strict";
    var fpStackTracePattern = /at\s{1}(?:.*\.)?plugin\s{1}.*\n\s*(.*)/;
    var fileNamePattern = /(\w*(\.\w*)*)\..*/;
    module.exports = function getPluginName(fn) {
      if (fn.name.length > 0) return fn.name;
      const stackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = 10;
      try {
        throw new Error("anonymous function");
      } catch (e) {
        Error.stackTraceLimit = stackTraceLimit;
        return extractPluginName(e.stack);
      }
    };
    function extractPluginName(stack) {
      const m = stack.match(fpStackTracePattern);
      return m ? m[1].split(/[/\\]/).slice(-1)[0].match(fileNamePattern)[1] : "anonymous";
    }
    module.exports.extractPluginName = extractPluginName;
  }
});

// node_modules/fastify-plugin/lib/toCamelCase.js
var require_toCamelCase = __commonJS({
  "node_modules/fastify-plugin/lib/toCamelCase.js"(exports, module) {
    "use strict";
    module.exports = function toCamelCase(name) {
      if (name[0] === "@") {
        name = name.slice(1).replace("/", "-");
      }
      const newName = name.replace(/-(.)/g, function(match, g1) {
        return g1.toUpperCase();
      });
      return newName;
    };
  }
});

// node_modules/fastify-plugin/plugin.js
var require_plugin = __commonJS({
  "node_modules/fastify-plugin/plugin.js"(exports, module) {
    "use strict";
    var getPluginName = require_getPluginName();
    var toCamelCase = require_toCamelCase();
    var count = 0;
    function plugin(fn, options = {}) {
      let autoName = false;
      if (typeof fn.default !== "undefined") {
        fn = fn.default;
      }
      if (typeof fn !== "function") {
        throw new TypeError(
          `fastify-plugin expects a function, instead got a '${typeof fn}'`
        );
      }
      if (typeof options === "string") {
        options = {
          fastify: options
        };
      }
      if (typeof options !== "object" || Array.isArray(options) || options === null) {
        throw new TypeError("The options object should be an object");
      }
      if (options.fastify !== void 0 && typeof options.fastify !== "string") {
        throw new TypeError(`fastify-plugin expects a version string, instead got '${typeof options.fastify}'`);
      }
      if (!options.name) {
        autoName = true;
        options.name = getPluginName(fn) + "-auto-" + count++;
      }
      fn[Symbol.for("skip-override")] = options.encapsulate !== true;
      fn[Symbol.for("fastify.display-name")] = options.name;
      fn[Symbol.for("plugin-meta")] = options;
      if (!fn.default) {
        fn.default = fn;
      }
      const camelCase = toCamelCase(options.name);
      if (!autoName && !fn[camelCase]) {
        fn[camelCase] = fn;
      }
      return fn;
    }
    module.exports = plugin;
    module.exports.default = plugin;
    module.exports.fastifyPlugin = plugin;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/tiny-lru/dist/tiny-lru.cjs
var require_tiny_lru = __commonJS({
  "node_modules/tiny-lru/dist/tiny-lru.cjs"(exports) {
    "use strict";
    var LRU = class {
      /**
       * Creates a new LRU cache instance.
       * Note: Constructor does not validate parameters. Use lru() factory function for parameter validation.
       *
       * @constructor
       * @param {number} [max=0] - Maximum number of items to store. 0 means unlimited.
       * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
       * @param {boolean} [resetTtl=false] - Whether to reset TTL when accessing existing items via get().
       * @example
       * const cache = new LRU(1000, 60000, true); // 1000 items, 1 minute TTL, reset on access
       * @see {@link lru} For parameter validation
       * @since 1.0.0
       */
      constructor(max = 0, ttl = 0, resetTtl = false) {
        this.first = null;
        this.items = /* @__PURE__ */ Object.create(null);
        this.last = null;
        this.max = max;
        this.resetTtl = resetTtl;
        this.size = 0;
        this.ttl = ttl;
      }
      /**
       * Removes all items from the cache.
       *
       * @method clear
       * @memberof LRU
       * @returns {LRU} The LRU instance for method chaining.
       * @example
       * cache.clear();
       * console.log(cache.size); // 0
       * @since 1.0.0
       */
      clear() {
        this.first = null;
        this.items = /* @__PURE__ */ Object.create(null);
        this.last = null;
        this.size = 0;
        return this;
      }
      /**
       * Removes an item from the cache by key.
       *
       * @method delete
       * @memberof LRU
       * @param {string} key - The key of the item to delete.
       * @returns {LRU} The LRU instance for method chaining.
       * @example
       * cache.set('key1', 'value1');
       * cache.delete('key1');
       * console.log(cache.has('key1')); // false
       * @see {@link LRU#has}
       * @see {@link LRU#clear}
       * @since 1.0.0
       */
      delete(key) {
        if (this.has(key)) {
          const item = this.items[key];
          delete this.items[key];
          this.size--;
          if (item.prev !== null) {
            item.prev.next = item.next;
          }
          if (item.next !== null) {
            item.next.prev = item.prev;
          }
          if (this.first === item) {
            this.first = item.next;
          }
          if (this.last === item) {
            this.last = item.prev;
          }
        }
        return this;
      }
      /**
       * Returns an array of [key, value] pairs for the specified keys.
       * Order follows LRU order (least to most recently used).
       *
       * @method entries
       * @memberof LRU
       * @param {string[]} [keys=this.keys()] - Array of keys to get entries for. Defaults to all keys.
       * @returns {Array<Array<*>>} Array of [key, value] pairs in LRU order.
       * @example
       * cache.set('a', 1).set('b', 2);
       * console.log(cache.entries()); // [['a', 1], ['b', 2]]
       * console.log(cache.entries(['a'])); // [['a', 1]]
       * @see {@link LRU#keys}
       * @see {@link LRU#values}
       * @since 11.1.0
       */
      entries(keys = this.keys()) {
        const result = new Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          result[i] = [key, this.get(key)];
        }
        return result;
      }
      /**
       * Removes the least recently used item from the cache.
       *
       * @method evict
       * @memberof LRU
       * @param {boolean} [bypass=false] - Whether to force eviction even when cache is empty.
       * @returns {LRU} The LRU instance for method chaining.
       * @example
       * cache.set('old', 'value').set('new', 'value');
       * cache.evict(); // Removes 'old' item
       * @see {@link LRU#setWithEvicted}
       * @since 1.0.0
       */
      evict(bypass = false) {
        if (bypass || this.size > 0) {
          const item = this.first;
          delete this.items[item.key];
          if (--this.size === 0) {
            this.first = null;
            this.last = null;
          } else {
            this.first = item.next;
            this.first.prev = null;
          }
        }
        return this;
      }
      /**
       * Returns the expiration timestamp for a given key.
       *
       * @method expiresAt
       * @memberof LRU
       * @param {string} key - The key to check expiration for.
       * @returns {number|undefined} The expiration timestamp in milliseconds, or undefined if key doesn't exist.
       * @example
       * const cache = new LRU(100, 5000); // 5 second TTL
       * cache.set('key1', 'value1');
       * console.log(cache.expiresAt('key1')); // timestamp 5 seconds from now
       * @see {@link LRU#get}
       * @see {@link LRU#has}
       * @since 1.0.0
       */
      expiresAt(key) {
        let result;
        if (this.has(key)) {
          result = this.items[key].expiry;
        }
        return result;
      }
      /**
       * Retrieves a value from the cache by key. Updates the item's position to most recently used.
       *
       * @method get
       * @memberof LRU
       * @param {string} key - The key to retrieve.
       * @returns {*} The value associated with the key, or undefined if not found or expired.
       * @example
       * cache.set('key1', 'value1');
       * console.log(cache.get('key1')); // 'value1'
       * console.log(cache.get('nonexistent')); // undefined
       * @see {@link LRU#set}
       * @see {@link LRU#has}
       * @since 1.0.0
       */
      get(key) {
        const item = this.items[key];
        if (item !== void 0) {
          if (this.ttl > 0) {
            if (item.expiry <= Date.now()) {
              this.delete(key);
              return void 0;
            }
          }
          this.moveToEnd(item);
          return item.value;
        }
        return void 0;
      }
      /**
       * Checks if a key exists in the cache.
       *
       * @method has
       * @memberof LRU
       * @param {string} key - The key to check for.
       * @returns {boolean} True if the key exists, false otherwise.
       * @example
       * cache.set('key1', 'value1');
       * console.log(cache.has('key1')); // true
       * console.log(cache.has('nonexistent')); // false
       * @see {@link LRU#get}
       * @see {@link LRU#delete}
       * @since 9.0.0
       */
      has(key) {
        return key in this.items;
      }
      /**
       * Efficiently moves an item to the end of the LRU list (most recently used position).
       * This is an internal optimization method that avoids the overhead of the full set() operation
       * when only LRU position needs to be updated.
       *
       * @method moveToEnd
       * @memberof LRU
       * @param {Object} item - The cache item with prev/next pointers to reposition.
       * @private
       * @since 11.3.5
       */
      moveToEnd(item) {
        if (this.last === item) {
          return;
        }
        if (item.prev !== null) {
          item.prev.next = item.next;
        }
        if (item.next !== null) {
          item.next.prev = item.prev;
        }
        if (this.first === item) {
          this.first = item.next;
        }
        item.prev = this.last;
        item.next = null;
        if (this.last !== null) {
          this.last.next = item;
        }
        this.last = item;
        if (this.first === null) {
          this.first = item;
        }
      }
      /**
       * Returns an array of all keys in the cache, ordered from least to most recently used.
       *
       * @method keys
       * @memberof LRU
       * @returns {string[]} Array of keys in LRU order.
       * @example
       * cache.set('a', 1).set('b', 2);
       * cache.get('a'); // Move 'a' to most recent
       * console.log(cache.keys()); // ['b', 'a']
       * @see {@link LRU#values}
       * @see {@link LRU#entries}
       * @since 9.0.0
       */
      keys() {
        const result = new Array(this.size);
        let x = this.first;
        let i = 0;
        while (x !== null) {
          result[i++] = x.key;
          x = x.next;
        }
        return result;
      }
      /**
       * Sets a value in the cache and returns any evicted item.
       *
       * @method setWithEvicted
       * @memberof LRU
       * @param {string} key - The key to set.
       * @param {*} value - The value to store.
       * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
       * @returns {Object|null} The evicted item (if any) with shape {key, value, expiry, prev, next}, or null.
       * @example
       * const cache = new LRU(2);
       * cache.set('a', 1).set('b', 2);
       * const evicted = cache.setWithEvicted('c', 3); // evicted = {key: 'a', value: 1, ...}
       * @see {@link LRU#set}
       * @see {@link LRU#evict}
       * @since 11.3.0
       */
      setWithEvicted(key, value, resetTtl = this.resetTtl) {
        let evicted = null;
        if (this.has(key)) {
          this.set(key, value, true, resetTtl);
        } else {
          if (this.max > 0 && this.size === this.max) {
            evicted = { ...this.first };
            this.evict(true);
          }
          let item = this.items[key] = {
            expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
            key,
            prev: this.last,
            next: null,
            value
          };
          if (++this.size === 1) {
            this.first = item;
          } else {
            this.last.next = item;
          }
          this.last = item;
        }
        return evicted;
      }
      /**
       * Sets a value in the cache. Updates the item's position to most recently used.
       *
       * @method set
       * @memberof LRU
       * @param {string} key - The key to set.
       * @param {*} value - The value to store.
       * @param {boolean} [bypass=false] - Internal parameter for setWithEvicted method.
       * @param {boolean} [resetTtl=this.resetTtl] - Whether to reset the TTL for this operation.
       * @returns {LRU} The LRU instance for method chaining.
       * @example
       * cache.set('key1', 'value1')
       *      .set('key2', 'value2')
       *      .set('key3', 'value3');
       * @see {@link LRU#get}
       * @see {@link LRU#setWithEvicted}
       * @since 1.0.0
       */
      set(key, value, bypass = false, resetTtl = this.resetTtl) {
        let item = this.items[key];
        if (bypass || item !== void 0) {
          item.value = value;
          if (bypass === false && resetTtl) {
            item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
          }
          this.moveToEnd(item);
        } else {
          if (this.max > 0 && this.size === this.max) {
            this.evict(true);
          }
          item = this.items[key] = {
            expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
            key,
            prev: this.last,
            next: null,
            value
          };
          if (++this.size === 1) {
            this.first = item;
          } else {
            this.last.next = item;
          }
          this.last = item;
        }
        return this;
      }
      /**
       * Returns an array of all values in the cache for the specified keys.
       * Order follows LRU order (least to most recently used).
       *
       * @method values
       * @memberof LRU
       * @param {string[]} [keys=this.keys()] - Array of keys to get values for. Defaults to all keys.
       * @returns {Array<*>} Array of values corresponding to the keys in LRU order.
       * @example
       * cache.set('a', 1).set('b', 2);
       * console.log(cache.values()); // [1, 2]
       * console.log(cache.values(['a'])); // [1]
       * @see {@link LRU#keys}
       * @see {@link LRU#entries}
       * @since 11.1.0
       */
      values(keys = this.keys()) {
        const result = new Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
          result[i] = this.get(keys[i]);
        }
        return result;
      }
    };
    function lru(max = 1e3, ttl = 0, resetTtl = false) {
      if (isNaN(max) || max < 0) {
        throw new TypeError("Invalid max value");
      }
      if (isNaN(ttl) || ttl < 0) {
        throw new TypeError("Invalid ttl value");
      }
      if (typeof resetTtl !== "boolean") {
        throw new TypeError("Invalid resetTtl value");
      }
      return new LRU(max, ttl, resetTtl);
    }
    exports.LRU = LRU;
    exports.lru = lru;
  }
});

// server/node_modules/@fastify/rate-limit/store/LocalStore.js
var require_LocalStore = __commonJS({
  "server/node_modules/@fastify/rate-limit/store/LocalStore.js"(exports, module) {
    "use strict";
    var lru = require_tiny_lru().lru;
    function LocalStore(timeWindow, cache, app, continueExceeding) {
      this.lru = lru(cache || 5e3, timeWindow);
      this.app = app;
      this.timeWindow = timeWindow;
      this.continueExceeding = continueExceeding;
    }
    LocalStore.prototype.incr = function(ip, cb, max) {
      const nowInMs = Date.now();
      const current = this.lru.get(ip) || { count: 0, iterationStartMs: nowInMs };
      current.count++;
      if (this.continueExceeding) {
        if (current.count > max) {
          this.lru.delete(ip);
        }
        this.lru.set(ip, current);
        cb(null, { current: current.count, ttl: this.timeWindow });
      } else {
        this.lru.set(ip, current);
        cb(null, { current: current.count, ttl: this.timeWindow - (nowInMs - current.iterationStartMs) });
      }
    };
    LocalStore.prototype.child = function(routeOptions) {
      return new LocalStore(
        routeOptions.timeWindow,
        routeOptions.cache,
        this.app,
        routeOptions.continueExceeding
      );
    };
    module.exports = LocalStore;
  }
});

// server/node_modules/@fastify/rate-limit/store/RedisStore.js
var require_RedisStore = __commonJS({
  "server/node_modules/@fastify/rate-limit/store/RedisStore.js"(exports, module) {
    "use strict";
    var noop = () => {
    };
    function RedisStore(redis, key, timeWindow, continueExceeding) {
      this.redis = redis;
      this.timeWindow = timeWindow;
      this.key = key;
      this.continueExceeding = continueExceeding;
    }
    RedisStore.prototype.incr = function(ip, cb) {
      const key = this.key + ip;
      if (this.continueExceeding) {
        this.redis.pipeline().incr(key).pexpire(key, this.timeWindow).exec((err, result) => {
          if (err) return cb(err, { current: 0 });
          if (result[0][0]) return cb(result[0][0], { current: 0 });
          cb(null, { current: result[0][1], ttl: this.timeWindow });
        });
      } else {
        this.redis.pipeline().incr(key).pttl(key).exec((err, result) => {
          if (err) return cb(err, { current: 0 });
          if (result[0][0]) return cb(result[0][0], { current: 0 });
          if (result[1][1] === -1) {
            this.redis.pexpire(key, this.timeWindow, noop);
            result[1][1] = this.timeWindow;
          }
          cb(null, { current: result[0][1], ttl: result[1][1] });
        });
      }
    };
    RedisStore.prototype.child = function(routeOptions) {
      const child = Object.create(this);
      child.key = this.key + routeOptions.routeInfo.method + routeOptions.routeInfo.url + "-";
      child.timeWindow = routeOptions.timeWindow;
      child.continueExceeding = routeOptions.continueExceeding;
      return child;
    };
    module.exports = RedisStore;
  }
});

// server/node_modules/@fastify/rate-limit/index.js
var require_rate_limit = __commonJS({
  "server/node_modules/@fastify/rate-limit/index.js"(exports, module) {
    "use strict";
    var fp = require_plugin();
    var ms = require_ms();
    var LocalStore = require_LocalStore();
    var RedisStore = require_RedisStore();
    var defaultHook = "onRequest";
    async function fastifyRateLimit(fastify2, settings) {
      let labels = {
        rateLimit: "x-ratelimit-limit",
        rateRemaining: "x-ratelimit-remaining",
        rateReset: "x-ratelimit-reset",
        retryAfter: "retry-after"
      };
      const draftSpecHeaders = {
        rateLimit: "ratelimit-limit",
        rateRemaining: "ratelimit-remaining",
        rateReset: "ratelimit-reset",
        retryAfter: "retry-after"
      };
      const globalParams = {
        global: typeof settings.global === "boolean" ? settings.global : true
      };
      if (typeof settings.enableDraftSpec === "boolean" && settings.enableDraftSpec) {
        globalParams.enableDraftSpec = true;
        labels = draftSpecHeaders;
      }
      globalParams.addHeaders = Object.assign({
        [labels.rateLimit]: true,
        [labels.rateRemaining]: true,
        [labels.rateReset]: true,
        [labels.retryAfter]: true
      }, settings.addHeaders);
      globalParams.addHeadersOnExceeding = Object.assign({
        [labels.rateLimit]: true,
        [labels.rateRemaining]: true,
        [labels.rateReset]: true
      }, settings.addHeadersOnExceeding);
      globalParams.labels = labels;
      globalParams.max = typeof settings.max === "number" && !isNaN(settings.max) || typeof settings.max === "function" ? settings.max : 1e3;
      globalParams.timeWindow = typeof settings.timeWindow === "string" ? ms(settings.timeWindow) : typeof settings.timeWindow === "number" && !isNaN(settings.timeWindow) ? settings.timeWindow : 1e3 * 60;
      globalParams.timeWindowInSeconds = globalParams.timeWindow / 1e3 | 0;
      globalParams.hook = settings.hook || defaultHook;
      globalParams.allowList = settings.allowList || settings.whitelist || null;
      globalParams.ban = settings.ban || null;
      globalParams.onBanReach = defaultOnBanReach;
      if (typeof settings.onBanReach === "function") {
        globalParams.onBanReach = settings.onBanReach;
      }
      globalParams.continueExceeding = settings.continueExceeding || false;
      const pluginComponent = {
        allowList: globalParams.allowList
      };
      if (settings.store) {
        const Store = settings.store;
        pluginComponent.store = new Store(globalParams);
      } else {
        if (settings.redis) {
          pluginComponent.store = new RedisStore(settings.redis, settings.nameSpace || "fastify-rate-limit-", globalParams.timeWindow, settings.continueExceeding);
        } else {
          pluginComponent.store = new LocalStore(globalParams.timeWindow, settings.cache, fastify2, settings.continueExceeding);
        }
      }
      globalParams.keyGenerator = typeof settings.keyGenerator === "function" ? settings.keyGenerator : (req) => req.ip;
      globalParams.errorResponseBuilder = defaultErrorResponse;
      globalParams.isCustomErrorMessage = false;
      globalParams.onExceeded = settings.onExceeded;
      globalParams.onExceeding = settings.onExceeding;
      if (typeof settings.errorResponseBuilder === "function") {
        globalParams.errorResponseBuilder = settings.errorResponseBuilder;
        globalParams.isCustomErrorMessage = true;
      }
      globalParams.skipOnError = settings.skipOnError || false;
      const run = Symbol("rate-limit-did-run");
      pluginComponent.run = run;
      fastify2.decorateRequest(run, false);
      if (!fastify2.hasDecorator("rateLimit")) {
        fastify2.decorate("rateLimit", function rateLimit2(options) {
          let params = globalParams;
          if (options) {
            params = makeParams(options);
          }
          if (params.timeWindow && params.timeWindow !== globalParams.timeWindow) {
            const newPluginComponent = Object.create(pluginComponent);
            const newStore = newPluginComponent.store.child(Object.assign({}, { routeInfo: {} }, params));
            newPluginComponent.store = newStore;
            return rateLimitRequestHandler(params, newPluginComponent);
          }
          return rateLimitRequestHandler(params, pluginComponent);
        });
      }
      fastify2.addHook("onRoute", (routeOptions) => {
        if (routeOptions.config && typeof routeOptions.config.rateLimit !== "undefined") {
          if (typeof routeOptions.config.rateLimit === "object") {
            const current = Object.create(pluginComponent);
            const mergedRateLimitParams = makeParams(routeOptions.config.rateLimit);
            mergedRateLimitParams.routeInfo = routeOptions;
            current.store = pluginComponent.store.child(mergedRateLimitParams);
            addRouteRateHook(current, mergedRateLimitParams, routeOptions);
          } else if (routeOptions.config.rateLimit === false) {
          } else {
            throw new Error("Unknown value for route rate-limit configuration");
          }
        } else if (globalParams.global) {
          addRouteRateHook(pluginComponent, globalParams, routeOptions);
        }
      });
      function makeParams(routeParams) {
        const result = Object.assign({}, globalParams, routeParams);
        if (typeof result.timeWindow === "string") {
          result.timeWindow = ms(result.timeWindow);
        }
        if (typeof result.timeWindow === "number") {
          result.timeWindowInSeconds = result.timeWindow / 1e3 | 0;
        }
        return result;
      }
    }
    async function addRouteRateHook(pluginComponent, params, routeOptions) {
      const hook = params.hook || defaultHook;
      const hookHandler = rateLimitRequestHandler(params, pluginComponent);
      if (Array.isArray(routeOptions[hook])) {
        routeOptions[hook].push(hookHandler);
      } else if (typeof routeOptions[hook] === "function") {
        routeOptions[hook] = [routeOptions[hook], hookHandler];
      } else {
        routeOptions[hook] = [hookHandler];
      }
    }
    function rateLimitRequestHandler(params, pluginComponent) {
      const theStore = pluginComponent.store;
      return async function onRequestRateLimiter(req, res) {
        const run = pluginComponent.run;
        const after = ms(params.timeWindow, { long: true });
        if (req[run]) {
          return;
        }
        req[run] = true;
        const key = await params.keyGenerator(req);
        if (params.allowList) {
          if (typeof pluginComponent.allowList === "function") {
            if (await params.allowList(req, key)) {
              return;
            }
          } else if (params.allowList.indexOf(key) > -1) {
            return;
          }
        }
        let current = 0;
        let ttl = 0;
        let maximum;
        if (typeof params.max === "number" && !isNaN(params.max)) {
          maximum = params.max;
        } else {
          maximum = await params.max(req, key);
        }
        try {
          const res2 = await new Promise(function(resolve, reject) {
            theStore.incr(key, function(err, res3) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res3);
            }, maximum);
          });
          current = res2.current;
          ttl = res2.ttl;
        } catch (err) {
          if (!params.skipOnError) {
            throw err;
          }
        }
        const timeLeft = Math.floor(ttl / 1e3);
        if (current <= maximum) {
          if (params.addHeadersOnExceeding[params.labels.rateLimit]) {
            res.header(params.labels.rateLimit, maximum);
          }
          if (params.addHeadersOnExceeding[params.labels.rateRemaining]) {
            res.header(params.labels.rateRemaining, maximum - current);
          }
          if (params.addHeadersOnExceeding[params.labels.rateReset]) {
            res.header(params.labels.rateReset, timeLeft);
          }
          if (typeof params.onExceeding === "function") {
            params.onExceeding(req, key);
          }
          return;
        }
        if (typeof params.onExceeded === "function") {
          params.onExceeded(req, key);
        }
        if (params.addHeaders[params.labels.rateLimit]) {
          res.header(params.labels.rateLimit, maximum);
        }
        if (params.addHeaders[params.labels.rateRemaining]) {
          res.header(params.labels.rateRemaining, 0);
        }
        if (params.addHeaders[params.labels.rateReset]) {
          res.header(params.labels.rateReset, timeLeft);
        }
        if (params.addHeaders[params.labels.retryAfter]) {
          const resetAfterTime = params.enableDraftSpec ? timeLeft : params.timeWindowInSeconds;
          res.header(params.labels.retryAfter, resetAfterTime);
        }
        const code = params.ban && current - maximum > params.ban ? 403 : 429;
        const respCtx = {
          statusCode: code,
          after,
          max: maximum,
          ttl
        };
        if (code === 403) {
          respCtx.ban = true;
          params.onBanReach(req, key);
        }
        throw params.errorResponseBuilder(req, respCtx);
      };
    }
    function defaultErrorResponse(req, context) {
      const err = new Error(`Rate limit exceeded, retry in ${context.after}`);
      err.statusCode = context.statusCode;
      return err;
    }
    function defaultOnBanReach(req, key) {
    }
    module.exports = fp(fastifyRateLimit, {
      fastify: "4.x",
      name: "@fastify/rate-limit"
    });
    module.exports.default = fastifyRateLimit;
    module.exports.fastifyRateLimit = fastifyRateLimit;
  }
});

// server/node_modules/helmet/index.cjs
var require_helmet = __commonJS({
  "server/node_modules/helmet/index.cjs"(exports, module) {
    "use strict";
    Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
    var dangerouslyDisableDefaultSrc = Symbol("dangerouslyDisableDefaultSrc");
    var DEFAULT_DIRECTIVES = {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "font-src": ["'self'", "https:", "data:"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
      "upgrade-insecure-requests": []
    };
    var SHOULD_BE_QUOTED = /* @__PURE__ */ new Set(["none", "self", "strict-dynamic", "report-sample", "inline-speculation-rules", "unsafe-inline", "unsafe-eval", "unsafe-hashes", "wasm-unsafe-eval"]);
    var getDefaultDirectives = () => Object.assign({}, DEFAULT_DIRECTIVES);
    var dashify = (str) => str.replace(/[A-Z]/g, (capitalLetter) => "-" + capitalLetter.toLowerCase());
    var isDirectiveValueInvalid = (directiveValue) => /;|,/.test(directiveValue);
    var shouldDirectiveValueEntryBeQuoted = (directiveValueEntry) => SHOULD_BE_QUOTED.has(directiveValueEntry) || directiveValueEntry.startsWith("nonce-") || directiveValueEntry.startsWith("sha256-") || directiveValueEntry.startsWith("sha384-") || directiveValueEntry.startsWith("sha512-");
    var warnIfDirectiveValueEntryShouldBeQuoted = (value) => {
      if (shouldDirectiveValueEntryBeQuoted(value)) {
        console.warn(`Content-Security-Policy got directive value \`${value}\` which should be single-quoted and changed to \`'${value}'\`. This will be an error in future versions of Helmet.`);
      }
    };
    var has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
    function normalizeDirectives(options) {
      const defaultDirectives = getDefaultDirectives();
      const { useDefaults = true, directives: rawDirectives = defaultDirectives } = options;
      const result = /* @__PURE__ */ new Map();
      const directiveNamesSeen = /* @__PURE__ */ new Set();
      const directivesExplicitlyDisabled = /* @__PURE__ */ new Set();
      for (const rawDirectiveName in rawDirectives) {
        if (!has(rawDirectives, rawDirectiveName)) {
          continue;
        }
        if (rawDirectiveName.length === 0 || /[^a-zA-Z0-9-]/.test(rawDirectiveName)) {
          throw new Error(`Content-Security-Policy received an invalid directive name ${JSON.stringify(rawDirectiveName)}`);
        }
        const directiveName = dashify(rawDirectiveName);
        if (directiveNamesSeen.has(directiveName)) {
          throw new Error(`Content-Security-Policy received a duplicate directive ${JSON.stringify(directiveName)}`);
        }
        directiveNamesSeen.add(directiveName);
        const rawDirectiveValue = rawDirectives[rawDirectiveName];
        let directiveValue;
        if (rawDirectiveValue === null) {
          if (directiveName === "default-src") {
            throw new Error("Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.");
          }
          directivesExplicitlyDisabled.add(directiveName);
          continue;
        } else if (typeof rawDirectiveValue === "string") {
          directiveValue = [rawDirectiveValue];
        } else if (!rawDirectiveValue) {
          throw new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`);
        } else if (rawDirectiveValue === dangerouslyDisableDefaultSrc) {
          if (directiveName === "default-src") {
            directivesExplicitlyDisabled.add("default-src");
            continue;
          } else {
            throw new Error(`Content-Security-Policy: tried to disable ${JSON.stringify(directiveName)} as if it were default-src; simply omit the key`);
          }
        } else {
          directiveValue = rawDirectiveValue;
        }
        for (const element of directiveValue) {
          if (typeof element === "string") {
            if (isDirectiveValueInvalid(element)) {
              throw new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`);
            }
            warnIfDirectiveValueEntryShouldBeQuoted(element);
          }
        }
        result.set(directiveName, directiveValue);
      }
      if (useDefaults) {
        Object.entries(defaultDirectives).forEach(([defaultDirectiveName, defaultDirectiveValue]) => {
          if (!result.has(defaultDirectiveName) && !directivesExplicitlyDisabled.has(defaultDirectiveName)) {
            result.set(defaultDirectiveName, defaultDirectiveValue);
          }
        });
      }
      if (!result.size) {
        throw new Error("Content-Security-Policy has no directives. Either set some or disable the header");
      }
      if (!result.has("default-src") && !directivesExplicitlyDisabled.has("default-src")) {
        throw new Error("Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.");
      }
      return result;
    }
    function getHeaderValue(req, res, normalizedDirectives) {
      let err;
      const result = [];
      normalizedDirectives.forEach((rawDirectiveValue, directiveName) => {
        let directiveValue = "";
        for (const element of rawDirectiveValue) {
          if (typeof element === "function") {
            const newElement = element(req, res);
            warnIfDirectiveValueEntryShouldBeQuoted(newElement);
            directiveValue += " " + newElement;
          } else {
            directiveValue += " " + element;
          }
        }
        if (!directiveValue) {
          result.push(directiveName);
        } else if (isDirectiveValueInvalid(directiveValue)) {
          err = new Error(`Content-Security-Policy received an invalid directive value for ${JSON.stringify(directiveName)}`);
        } else {
          result.push(`${directiveName}${directiveValue}`);
        }
      });
      return err ? err : result.join(";");
    }
    var contentSecurityPolicy = function contentSecurityPolicy2(options = {}) {
      const headerName = options.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";
      const normalizedDirectives = normalizeDirectives(options);
      return function contentSecurityPolicyMiddleware(req, res, next) {
        const result = getHeaderValue(req, res, normalizedDirectives);
        if (result instanceof Error) {
          next(result);
        } else {
          res.setHeader(headerName, result);
          next();
        }
      };
    };
    contentSecurityPolicy.getDefaultDirectives = getDefaultDirectives;
    contentSecurityPolicy.dangerouslyDisableDefaultSrc = dangerouslyDisableDefaultSrc;
    var ALLOWED_POLICIES$2 = /* @__PURE__ */ new Set(["require-corp", "credentialless", "unsafe-none"]);
    function getHeaderValueFromOptions$6({ policy = "require-corp" }) {
      if (ALLOWED_POLICIES$2.has(policy)) {
        return policy;
      } else {
        throw new Error(`Cross-Origin-Embedder-Policy does not support the ${JSON.stringify(policy)} policy`);
      }
    }
    function crossOriginEmbedderPolicy(options = {}) {
      const headerValue = getHeaderValueFromOptions$6(options);
      return function crossOriginEmbedderPolicyMiddleware(_req, res, next) {
        res.setHeader("Cross-Origin-Embedder-Policy", headerValue);
        next();
      };
    }
    var ALLOWED_POLICIES$1 = /* @__PURE__ */ new Set(["same-origin", "same-origin-allow-popups", "unsafe-none"]);
    function getHeaderValueFromOptions$5({ policy = "same-origin" }) {
      if (ALLOWED_POLICIES$1.has(policy)) {
        return policy;
      } else {
        throw new Error(`Cross-Origin-Opener-Policy does not support the ${JSON.stringify(policy)} policy`);
      }
    }
    function crossOriginOpenerPolicy(options = {}) {
      const headerValue = getHeaderValueFromOptions$5(options);
      return function crossOriginOpenerPolicyMiddleware(_req, res, next) {
        res.setHeader("Cross-Origin-Opener-Policy", headerValue);
        next();
      };
    }
    var ALLOWED_POLICIES = /* @__PURE__ */ new Set(["same-origin", "same-site", "cross-origin"]);
    function getHeaderValueFromOptions$4({ policy = "same-origin" }) {
      if (ALLOWED_POLICIES.has(policy)) {
        return policy;
      } else {
        throw new Error(`Cross-Origin-Resource-Policy does not support the ${JSON.stringify(policy)} policy`);
      }
    }
    function crossOriginResourcePolicy(options = {}) {
      const headerValue = getHeaderValueFromOptions$4(options);
      return function crossOriginResourcePolicyMiddleware(_req, res, next) {
        res.setHeader("Cross-Origin-Resource-Policy", headerValue);
        next();
      };
    }
    function originAgentCluster() {
      return function originAgentClusterMiddleware(_req, res, next) {
        res.setHeader("Origin-Agent-Cluster", "?1");
        next();
      };
    }
    var ALLOWED_TOKENS = /* @__PURE__ */ new Set(["no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url", ""]);
    function getHeaderValueFromOptions$3({ policy = ["no-referrer"] }) {
      const tokens = typeof policy === "string" ? [policy] : policy;
      if (tokens.length === 0) {
        throw new Error("Referrer-Policy received no policy tokens");
      }
      const tokensSeen = /* @__PURE__ */ new Set();
      tokens.forEach((token) => {
        if (!ALLOWED_TOKENS.has(token)) {
          throw new Error(`Referrer-Policy received an unexpected policy token ${JSON.stringify(token)}`);
        } else if (tokensSeen.has(token)) {
          throw new Error(`Referrer-Policy received a duplicate policy token ${JSON.stringify(token)}`);
        }
        tokensSeen.add(token);
      });
      return tokens.join(",");
    }
    function referrerPolicy(options = {}) {
      const headerValue = getHeaderValueFromOptions$3(options);
      return function referrerPolicyMiddleware(_req, res, next) {
        res.setHeader("Referrer-Policy", headerValue);
        next();
      };
    }
    var DEFAULT_MAX_AGE = 180 * 24 * 60 * 60;
    function parseMaxAge(value = DEFAULT_MAX_AGE) {
      if (value >= 0 && Number.isFinite(value)) {
        return Math.floor(value);
      } else {
        throw new Error(`Strict-Transport-Security: ${JSON.stringify(value)} is not a valid value for maxAge. Please choose a positive integer.`);
      }
    }
    function getHeaderValueFromOptions$2(options) {
      if ("maxage" in options) {
        throw new Error("Strict-Transport-Security received an unsupported property, `maxage`. Did you mean to pass `maxAge`?");
      }
      if ("includeSubdomains" in options) {
        console.warn('Strict-Transport-Security middleware should use `includeSubDomains` instead of `includeSubdomains`. (The correct one has an uppercase "D".)');
      }
      const directives = [`max-age=${parseMaxAge(options.maxAge)}`];
      if (options.includeSubDomains === void 0 || options.includeSubDomains) {
        directives.push("includeSubDomains");
      }
      if (options.preload) {
        directives.push("preload");
      }
      return directives.join("; ");
    }
    function strictTransportSecurity(options = {}) {
      const headerValue = getHeaderValueFromOptions$2(options);
      return function strictTransportSecurityMiddleware(_req, res, next) {
        res.setHeader("Strict-Transport-Security", headerValue);
        next();
      };
    }
    function xContentTypeOptions() {
      return function xContentTypeOptionsMiddleware(_req, res, next) {
        res.setHeader("X-Content-Type-Options", "nosniff");
        next();
      };
    }
    function xDnsPrefetchControl(options = {}) {
      const headerValue = options.allow ? "on" : "off";
      return function xDnsPrefetchControlMiddleware(_req, res, next) {
        res.setHeader("X-DNS-Prefetch-Control", headerValue);
        next();
      };
    }
    function xDownloadOptions() {
      return function xDownloadOptionsMiddleware(_req, res, next) {
        res.setHeader("X-Download-Options", "noopen");
        next();
      };
    }
    function getHeaderValueFromOptions$1({ action = "sameorigin" }) {
      const normalizedAction = typeof action === "string" ? action.toUpperCase() : action;
      switch (normalizedAction) {
        case "SAME-ORIGIN":
          return "SAMEORIGIN";
        case "DENY":
        case "SAMEORIGIN":
          return normalizedAction;
        default:
          throw new Error(`X-Frame-Options received an invalid action ${JSON.stringify(action)}`);
      }
    }
    function xFrameOptions(options = {}) {
      const headerValue = getHeaderValueFromOptions$1(options);
      return function xFrameOptionsMiddleware(_req, res, next) {
        res.setHeader("X-Frame-Options", headerValue);
        next();
      };
    }
    var ALLOWED_PERMITTED_POLICIES = /* @__PURE__ */ new Set(["none", "master-only", "by-content-type", "all"]);
    function getHeaderValueFromOptions({ permittedPolicies = "none" }) {
      if (ALLOWED_PERMITTED_POLICIES.has(permittedPolicies)) {
        return permittedPolicies;
      } else {
        throw new Error(`X-Permitted-Cross-Domain-Policies does not support ${JSON.stringify(permittedPolicies)}`);
      }
    }
    function xPermittedCrossDomainPolicies(options = {}) {
      const headerValue = getHeaderValueFromOptions(options);
      return function xPermittedCrossDomainPoliciesMiddleware(_req, res, next) {
        res.setHeader("X-Permitted-Cross-Domain-Policies", headerValue);
        next();
      };
    }
    function xPoweredBy() {
      return function xPoweredByMiddleware(_req, res, next) {
        res.removeHeader("X-Powered-By");
        next();
      };
    }
    function xXssProtection() {
      return function xXssProtectionMiddleware(_req, res, next) {
        res.setHeader("X-XSS-Protection", "0");
        next();
      };
    }
    function getMiddlewareFunctionsFromOptions(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const result = [];
      switch (options.contentSecurityPolicy) {
        case void 0:
        case true:
          result.push(contentSecurityPolicy());
          break;
        case false:
          break;
        default:
          result.push(contentSecurityPolicy(options.contentSecurityPolicy));
          break;
      }
      switch (options.crossOriginEmbedderPolicy) {
        case void 0:
        case false:
          break;
        case true:
          result.push(crossOriginEmbedderPolicy());
          break;
        default:
          result.push(crossOriginEmbedderPolicy(options.crossOriginEmbedderPolicy));
          break;
      }
      switch (options.crossOriginOpenerPolicy) {
        case void 0:
        case true:
          result.push(crossOriginOpenerPolicy());
          break;
        case false:
          break;
        default:
          result.push(crossOriginOpenerPolicy(options.crossOriginOpenerPolicy));
          break;
      }
      switch (options.crossOriginResourcePolicy) {
        case void 0:
        case true:
          result.push(crossOriginResourcePolicy());
          break;
        case false:
          break;
        default:
          result.push(crossOriginResourcePolicy(options.crossOriginResourcePolicy));
          break;
      }
      switch (options.originAgentCluster) {
        case void 0:
        case true:
          result.push(originAgentCluster());
          break;
        case false:
          break;
        default:
          console.warn("Origin-Agent-Cluster does not take options. Remove the property to silence this warning.");
          result.push(originAgentCluster());
          break;
      }
      switch (options.referrerPolicy) {
        case void 0:
        case true:
          result.push(referrerPolicy());
          break;
        case false:
          break;
        default:
          result.push(referrerPolicy(options.referrerPolicy));
          break;
      }
      if ("strictTransportSecurity" in options && "hsts" in options) {
        throw new Error("Strict-Transport-Security option was specified twice. Remove `hsts` to silence this warning.");
      }
      const strictTransportSecurityOption = (_a = options.strictTransportSecurity) !== null && _a !== void 0 ? _a : options.hsts;
      switch (strictTransportSecurityOption) {
        case void 0:
        case true:
          result.push(strictTransportSecurity());
          break;
        case false:
          break;
        default:
          result.push(strictTransportSecurity(strictTransportSecurityOption));
          break;
      }
      if ("xContentTypeOptions" in options && "noSniff" in options) {
        throw new Error("X-Content-Type-Options option was specified twice. Remove `noSniff` to silence this warning.");
      }
      const xContentTypeOptionsOption = (_b = options.xContentTypeOptions) !== null && _b !== void 0 ? _b : options.noSniff;
      switch (xContentTypeOptionsOption) {
        case void 0:
        case true:
          result.push(xContentTypeOptions());
          break;
        case false:
          break;
        default:
          console.warn("X-Content-Type-Options does not take options. Remove the property to silence this warning.");
          result.push(xContentTypeOptions());
          break;
      }
      if ("xDnsPrefetchControl" in options && "dnsPrefetchControl" in options) {
        throw new Error("X-DNS-Prefetch-Control option was specified twice. Remove `dnsPrefetchControl` to silence this warning.");
      }
      const xDnsPrefetchControlOption = (_c = options.xDnsPrefetchControl) !== null && _c !== void 0 ? _c : options.dnsPrefetchControl;
      switch (xDnsPrefetchControlOption) {
        case void 0:
        case true:
          result.push(xDnsPrefetchControl());
          break;
        case false:
          break;
        default:
          result.push(xDnsPrefetchControl(xDnsPrefetchControlOption));
          break;
      }
      if ("xDownloadOptions" in options && "ieNoOpen" in options) {
        throw new Error("X-Download-Options option was specified twice. Remove `ieNoOpen` to silence this warning.");
      }
      const xDownloadOptionsOption = (_d = options.xDownloadOptions) !== null && _d !== void 0 ? _d : options.ieNoOpen;
      switch (xDownloadOptionsOption) {
        case void 0:
        case true:
          result.push(xDownloadOptions());
          break;
        case false:
          break;
        default:
          console.warn("X-Download-Options does not take options. Remove the property to silence this warning.");
          result.push(xDownloadOptions());
          break;
      }
      if ("xFrameOptions" in options && "frameguard" in options) {
        throw new Error("X-Frame-Options option was specified twice. Remove `frameguard` to silence this warning.");
      }
      const xFrameOptionsOption = (_e = options.xFrameOptions) !== null && _e !== void 0 ? _e : options.frameguard;
      switch (xFrameOptionsOption) {
        case void 0:
        case true:
          result.push(xFrameOptions());
          break;
        case false:
          break;
        default:
          result.push(xFrameOptions(xFrameOptionsOption));
          break;
      }
      if ("xPermittedCrossDomainPolicies" in options && "permittedCrossDomainPolicies" in options) {
        throw new Error("X-Permitted-Cross-Domain-Policies option was specified twice. Remove `permittedCrossDomainPolicies` to silence this warning.");
      }
      const xPermittedCrossDomainPoliciesOption = (_f = options.xPermittedCrossDomainPolicies) !== null && _f !== void 0 ? _f : options.permittedCrossDomainPolicies;
      switch (xPermittedCrossDomainPoliciesOption) {
        case void 0:
        case true:
          result.push(xPermittedCrossDomainPolicies());
          break;
        case false:
          break;
        default:
          result.push(xPermittedCrossDomainPolicies(xPermittedCrossDomainPoliciesOption));
          break;
      }
      if ("xPoweredBy" in options && "hidePoweredBy" in options) {
        throw new Error("X-Powered-By option was specified twice. Remove `hidePoweredBy` to silence this warning.");
      }
      const xPoweredByOption = (_g = options.xPoweredBy) !== null && _g !== void 0 ? _g : options.hidePoweredBy;
      switch (xPoweredByOption) {
        case void 0:
        case true:
          result.push(xPoweredBy());
          break;
        case false:
          break;
        default:
          console.warn("X-Powered-By does not take options. Remove the property to silence this warning.");
          result.push(xPoweredBy());
          break;
      }
      if ("xXssProtection" in options && "xssFilter" in options) {
        throw new Error("X-XSS-Protection option was specified twice. Remove `xssFilter` to silence this warning.");
      }
      const xXssProtectionOption = (_h = options.xXssProtection) !== null && _h !== void 0 ? _h : options.xssFilter;
      switch (xXssProtectionOption) {
        case void 0:
        case true:
          result.push(xXssProtection());
          break;
        case false:
          break;
        default:
          console.warn("X-XSS-Protection does not take options. Remove the property to silence this warning.");
          result.push(xXssProtection());
          break;
      }
      return result;
    }
    var helmet2 = Object.assign(
      function helmet3(options = {}) {
        var _a;
        if (((_a = options.constructor) === null || _a === void 0 ? void 0 : _a.name) === "IncomingMessage") {
          throw new Error("It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.");
        }
        const middlewareFunctions = getMiddlewareFunctionsFromOptions(options);
        return function helmetMiddleware(req, res, next) {
          let middlewareIndex = 0;
          (function internalNext(err) {
            if (err) {
              next(err);
              return;
            }
            const middlewareFunction = middlewareFunctions[middlewareIndex];
            if (middlewareFunction) {
              middlewareIndex++;
              middlewareFunction(req, res, internalNext);
            } else {
              next();
            }
          })();
        };
      },
      {
        contentSecurityPolicy,
        crossOriginEmbedderPolicy,
        crossOriginOpenerPolicy,
        crossOriginResourcePolicy,
        originAgentCluster,
        referrerPolicy,
        strictTransportSecurity,
        xContentTypeOptions,
        xDnsPrefetchControl,
        xDownloadOptions,
        xFrameOptions,
        xPermittedCrossDomainPolicies,
        xPoweredBy,
        xXssProtection,
        // Legacy aliases
        dnsPrefetchControl: xDnsPrefetchControl,
        xssFilter: xXssProtection,
        permittedCrossDomainPolicies: xPermittedCrossDomainPolicies,
        ieNoOpen: xDownloadOptions,
        noSniff: xContentTypeOptions,
        frameguard: xFrameOptions,
        hidePoweredBy: xPoweredBy,
        hsts: strictTransportSecurity
      }
    );
    exports.contentSecurityPolicy = contentSecurityPolicy;
    exports.crossOriginEmbedderPolicy = crossOriginEmbedderPolicy;
    exports.crossOriginOpenerPolicy = crossOriginOpenerPolicy;
    exports.crossOriginResourcePolicy = crossOriginResourcePolicy;
    exports.default = helmet2;
    exports.dnsPrefetchControl = xDnsPrefetchControl;
    exports.frameguard = xFrameOptions;
    exports.hidePoweredBy = xPoweredBy;
    exports.hsts = strictTransportSecurity;
    exports.ieNoOpen = xDownloadOptions;
    exports.noSniff = xContentTypeOptions;
    exports.originAgentCluster = originAgentCluster;
    exports.permittedCrossDomainPolicies = xPermittedCrossDomainPolicies;
    exports.referrerPolicy = referrerPolicy;
    exports.strictTransportSecurity = strictTransportSecurity;
    exports.xContentTypeOptions = xContentTypeOptions;
    exports.xDnsPrefetchControl = xDnsPrefetchControl;
    exports.xDownloadOptions = xDownloadOptions;
    exports.xFrameOptions = xFrameOptions;
    exports.xPermittedCrossDomainPolicies = xPermittedCrossDomainPolicies;
    exports.xPoweredBy = xPoweredBy;
    exports.xXssProtection = xXssProtection;
    exports.xssFilter = xXssProtection;
    module.exports = exports.default;
    module.exports.default = module.exports;
  }
});

// server/node_modules/@fastify/helmet/index.js
var require_helmet2 = __commonJS({
  "server/node_modules/@fastify/helmet/index.js"(exports, module) {
    "use strict";
    var { randomBytes: randomBytes2 } = __require("node:crypto");
    var fp = require_plugin();
    var helmet2 = require_helmet();
    async function fastifyHelmet(fastify2, options) {
      const { enableCSPNonces, global, ...globalConfiguration } = options;
      const isGlobal = typeof global === "boolean" ? global : true;
      if (!fastify2.hasReplyDecorator("helmet")) {
        fastify2.decorateReply("helmet", null);
      }
      if (!fastify2.hasReplyDecorator("cspNonce")) {
        fastify2.decorateReply("cspNonce", null);
      }
      fastify2.addHook("onRoute", (routeOptions) => {
        if (typeof routeOptions.helmet !== "undefined") {
          if (typeof routeOptions.helmet === "object") {
            routeOptions.config = Object.assign(routeOptions.config || /* @__PURE__ */ Object.create(null), { helmet: routeOptions.helmet });
          } else if (routeOptions.helmet === false) {
            routeOptions.config = Object.assign(routeOptions.config || /* @__PURE__ */ Object.create(null), { helmet: { skipRoute: true } });
          } else {
            throw new Error("Unknown value for route helmet configuration");
          }
        }
      });
      fastify2.addHook("onRequest", async (request, reply) => {
        const { helmet: routeOptions } = request.routeOptions?.config || request.routeConfig;
        if (typeof routeOptions !== "undefined") {
          const { enableCSPNonces: enableRouteCSPNonces, skipRoute, ...helmetRouteConfiguration } = routeOptions;
          const mergedHelmetConfiguration = Object.assign(/* @__PURE__ */ Object.create(null), globalConfiguration, helmetRouteConfiguration);
          return replyDecorators(request, reply, mergedHelmetConfiguration, enableRouteCSPNonces);
        } else {
          return replyDecorators(request, reply, globalConfiguration, enableCSPNonces);
        }
      });
      fastify2.addHook("onRequest", (request, reply, next) => {
        const { helmet: routeOptions } = request.routeOptions?.config || request.routeConfig;
        if (typeof routeOptions !== "undefined") {
          const { enableCSPNonces: enableRouteCSPNonces, skipRoute, ...helmetRouteConfiguration } = routeOptions;
          if (skipRoute === true) {
          } else {
            const mergedHelmetConfiguration = Object.assign(/* @__PURE__ */ Object.create(null), globalConfiguration, helmetRouteConfiguration);
            return buildHelmetOnRoutes(request, reply, mergedHelmetConfiguration, enableRouteCSPNonces);
          }
          return next();
        } else if (isGlobal) {
          return buildHelmetOnRoutes(request, reply, globalConfiguration, enableCSPNonces);
        } else {
        }
        return next();
      });
    }
    async function replyDecorators(request, reply, configuration, enableCSP) {
      if (enableCSP) {
        reply.cspNonce = {
          script: randomBytes2(16).toString("hex"),
          style: randomBytes2(16).toString("hex")
        };
      }
      reply.helmet = function(opts) {
        const helmetConfiguration = opts ? Object.assign(/* @__PURE__ */ Object.create(null), configuration, opts) : configuration;
        return helmet2(helmetConfiguration)(request.raw, reply.raw, done);
      };
    }
    async function buildHelmetOnRoutes(request, reply, configuration, enableCSP) {
      if (enableCSP === true) {
        const cspDirectives = configuration.contentSecurityPolicy ? configuration.contentSecurityPolicy.directives : helmet2.contentSecurityPolicy.getDefaultDirectives();
        const cspReportOnly = configuration.contentSecurityPolicy ? configuration.contentSecurityPolicy.reportOnly : void 0;
        const cspUseDefaults = configuration.contentSecurityPolicy ? configuration.contentSecurityPolicy.useDefaults : void 0;
        const { script: scriptCSPNonce, style: styleCSPNonce } = reply.cspNonce;
        const directives = { ...cspDirectives };
        const scriptKey = Array.isArray(directives["script-src"]) ? "script-src" : "scriptSrc";
        directives[scriptKey] = Array.isArray(directives[scriptKey]) ? [...directives[scriptKey]] : [];
        directives[scriptKey].push(`'nonce-${scriptCSPNonce}'`);
        const styleKey = Array.isArray(directives["style-src"]) ? "style-src" : "styleSrc";
        directives[styleKey] = Array.isArray(directives[styleKey]) ? [...directives[styleKey]] : [];
        directives[styleKey].push(`'nonce-${styleCSPNonce}'`);
        const contentSecurityPolicy = { directives, reportOnly: cspReportOnly, useDefaults: cspUseDefaults };
        const mergedHelmetConfiguration = Object.assign(/* @__PURE__ */ Object.create(null), configuration, { contentSecurityPolicy });
        helmet2(mergedHelmetConfiguration)(request.raw, reply.raw, done);
      } else {
        helmet2(configuration)(request.raw, reply.raw, done);
      }
    }
    function done(error) {
      if (error) throw error;
    }
    module.exports = fp(fastifyHelmet, {
      fastify: "4.x",
      name: "@fastify/helmet"
    });
    module.exports.default = fastifyHelmet;
    module.exports.fastifyHelmet = fastifyHelmet;
    module.exports.contentSecurityPolicy = helmet2.contentSecurityPolicy;
  }
});

// server/src/server.ts
var import_rate_limit = __toESM(require_rate_limit(), 1);
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import dotenv2 from "dotenv";
import path3 from "path";

// server/src/db/db.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
var dbPath = path.resolve(process.cwd(), "elgammal.db");
if (!fs.existsSync(dbPath)) {
  const parentDb = path.resolve(process.cwd(), "../elgammal.db");
  if (fs.existsSync(parentDb)) {
    dbPath = parentDb;
  }
}
dotenv.config();
var url = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;
var authToken = process.env.TURSO_AUTH_TOKEN;
console.log("Connecting to database:", url.startsWith("libsql") ? "\u2601\uFE0F TURSO CLOUD" : "\u{1F4BB} LOCAL SQLITE");
var client = createClient({
  url,
  authToken
});
var db = drizzle(client, { schema: {} });

// server/src/server.ts
import { sql as sql5 } from "drizzle-orm";

// server/src/db/schema.ts
import {
  sqliteTable,
  text,
  integer,
  real
} from "drizzle-orm/sqlite-core";
var governorates = sqliteTable("governorates", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull()
});
var cities = sqliteTable("cities", {
  id: text("id").primaryKey(),
  governorateId: text("governorate_id").notNull().references(() => governorates.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull()
});
var filterTypes = sqliteTable("filter_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull()
});
var maintenanceIntervals = sqliteTable("maintenance_intervals", {
  id: text("id").primaryKey(),
  months: integer("months").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull()
});
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  role: text("role").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  version: integer("version").default(1).notNull()
});
var sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  idleExpiresAt: integer("idle_expires_at", { mode: "timestamp" }).notNull()
});
var customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  customerCode: integer("customer_code").notNull().unique(),
  name: text("name").notNull(),
  phone1: text("phone_1").notNull(),
  phone2: text("phone_2"),
  landline: text("landline"),
  governorateId: text("governorate_id").notNull().references(() => governorates.id),
  cityId: text("city_id").notNull().references(() => cities.id),
  village: text("village"),
  addressDetails: text("address_details"),
  filterTypeId: text("filter_type_id").references(() => filterTypes.id),
  maintenanceIntervalId: text("maintenance_interval_id").notNull().references(() => maintenanceIntervals.id),
  lastMaintenanceDate: text("last_maintenance_date"),
  nextMaintenanceDate: text("next_maintenance_date"),
  notes: text("notes"),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  version: integer("version").default(1).notNull()
});
var employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isTechnician: integer("is_technician", { mode: "boolean" }).default(true).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" })
});
var visits = sqliteTable("visits", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").references(() => employees.id, { onDelete: "restrict" }),
  visitDate: text("visit_date").notNull(),
  workflowStatus: text("workflow_status").notNull(),
  isBaseline: integer("is_baseline", { mode: "boolean" }).default(false).notNull(),
  item1: integer("item_1", { mode: "boolean" }).default(false).notNull(),
  item2: integer("item_2", { mode: "boolean" }).default(false).notNull(),
  item3: integer("item_3", { mode: "boolean" }).default(false).notNull(),
  itemPost: integer("item_post", { mode: "boolean" }).default(false).notNull(),
  itemCalcium: integer("item_calcium", { mode: "boolean" }).default(false).notNull(),
  itemInfrared: integer("item_infrared", { mode: "boolean" }).default(false).notNull(),
  itemSalts: integer("item_salts", { mode: "boolean" }).default(false).notNull(),
  notes: text("notes"),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  version: integer("version").default(1).notNull()
});
var installments = sqliteTable("installments", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  dueDate: text("due_date").notNull(),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false).notNull(),
  paidDate: text("paid_date"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
});
var expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  // e.g. رواتب, بنزين, إيجار
  description: text("description").notNull(),
  expenseDate: text("expense_date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
});
var inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  itemName: text("item_name").notNull().unique(),
  category: text("category").default("spare"),
  quantity: integer("quantity").notNull().default(0),
  unitPrice: real("unit_price").notNull().default(0)
});
var auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  entityName: text("entity_name").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  oldValues: text("old_values", { mode: "json" }),
  newValues: text("new_values", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
});
var systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

// server/src/routes/auth.ts
import { eq as eq2 } from "drizzle-orm";

// server/src/utils/auth.ts
import crypto2 from "crypto";

// node_modules/bcryptjs/index.js
import nodeCrypto from "crypto";
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return nodeCrypto.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function") callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined") rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash2) {
  if (typeof password !== "string" || typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash2);
  if (hash2.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash2.substring(0, hash2.length - 31)),
    hash2
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err) callback2(err);
        else callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
}
function getRounds(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  return parseInt(hash2.split("$")[2], 10);
}
function getSalt(hash2) {
  if (typeof hash2 !== "string")
    throw Error("Illegal arguments: " + typeof hash2);
  if (hash2.length !== 60)
    throw Error("Illegal hash length: " + hash2.length + " != 60");
  return hash2.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
var bcryptjs_default = {
  setRandomFallback,
  genSaltSync,
  genSalt,
  hashSync,
  hash,
  compareSync,
  compare,
  getRounds,
  getSalt,
  truncates,
  encodeBase64,
  decodeBase64
};

// server/src/utils/auth.ts
import { eq } from "drizzle-orm";
async function hashPassword(password) {
  return bcryptjs_default.hash(password, 10);
}
async function verifyPassword(password, hash2) {
  return bcryptjs_default.compare(password, hash2);
}
function generateSessionToken() {
  return crypto2.randomBytes(32).toString("hex");
}
function hashSessionToken(token) {
  return crypto2.createHash("sha256").update(token).digest("hex");
}
async function createSession(userId) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const maxAge = 7 * 24 * 60 * 60 * 1e3;
  const idleMaxAge = 1 * 24 * 60 * 60 * 1e3;
  await db.insert(sessions).values({
    id: tokenHash,
    userId,
    expiresAt: new Date(Date.now() + maxAge),
    idleExpiresAt: new Date(Date.now() + idleMaxAge)
  });
  return { token, maxAge };
}
async function invalidateSession(token) {
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.id, tokenHash));
}
async function verifyAuth(request, reply) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D" });
  }
  const tokenHash = hashSessionToken(sessionId);
  const sessionList = await db.select().from(sessions).where(eq(sessions.id, tokenHash));
  const session = sessionList[0];
  if (!session || new Date(session.expiresAt) < /* @__PURE__ */ new Date()) {
    reply.clearCookie("sessionId", { path: "/" });
    return reply.status(401).send({ error: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629" });
  }
  const userList = await db.select().from(users).where(eq(users.id, session.userId));
  const user = userList[0];
  if (!user || !user.isActive) {
    reply.clearCookie("sessionId", { path: "/" });
    return reply.status(401).send({ error: "\u062D\u0633\u0627\u0628\u0643 \u0645\u0639\u0637\u0644 \u0623\u0648 \u0645\u062D\u0630\u0648\u0641" });
  }
  request.user = user;
}

// server/src/utils/rbac.ts
var ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  TECHNICIAN: "TECHNICIAN",
  DATA_ENTRY: "DATA_ENTRY"
};
var PERMISSIONS = {
  [ROLES.ADMIN]: [
    "users.view",
    "users.manage",
    "roles.view",
    "roles.manage",
    "customers.view",
    "customers.create",
    "customers.update",
    "customers.delete",
    "customers.import",
    "visits.view",
    "visits.create",
    "reports.view",
    "reports.export",
    "settings.update",
    "audit.view",
    "employees.view",
    "employees.create",
    "employees.update",
    "employees.delete",
    "inventory.view",
    "inventory.create",
    "inventory.update",
    "inventory.delete",
    "installments.view",
    "installments.create",
    "installments.update",
    "installments.delete",
    "expenses.view",
    "expenses.create",
    "expenses.update",
    "expenses.delete"
  ],
  [ROLES.MANAGER]: [
    "customers.view",
    "customers.create",
    "customers.update",
    "visits.view",
    "visits.create",
    "reports.view",
    "reports.export",
    "employees.view",
    "inventory.view",
    "installments.view",
    "expenses.view",
    "expenses.create"
  ],
  [ROLES.TECHNICIAN]: [
    "customers.view",
    "visits.view",
    "visits.create",
    "inventory.view"
  ],
  [ROLES.DATA_ENTRY]: [
    "customers.view",
    "customers.create",
    "customers.update",
    "visits.view",
    "visits.create",
    "installments.view",
    "installments.create",
    "expenses.view",
    "expenses.create"
  ]
};
function getRolePermissions(role) {
  return PERMISSIONS[role] || [];
}
function hasPermission(role, permission) {
  return getRolePermissions(role).includes(permission);
}

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path4, errorMaps, issueData } = params;
  const fullPath = [...path4, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path4, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path4;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// node_modules/zod/index.js
var zod_default = external_exports;

// server/src/routes/auth.ts
var loginSchema = zod_default.object({
  username: zod_default.string().min(1),
  password: zod_default.string().min(1)
});
async function authRoutes(fastify2) {
  fastify2.post("/login", {
    config: {
      rateLimit: {
        max: 50,
        // Increased for development
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);
      const userList = await db.select().from(users).where(eq2(users.username, username));
      const user = userList[0];
      if (!user || !user.isActive) {
        return reply.status(401).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629 \u0623\u0648 \u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0639\u0637\u0644" });
      }
      const isValid2 = await verifyPassword(password, user.passwordHash);
      if (!isValid2) {
        return reply.status(401).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
      }
      const { token, maxAge } = await createSession(user.id);
      reply.setCookie("sessionId", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAge / 1e3
      });
      return { success: true, role: user.role };
    } catch (e) {
      console.error("Login error:", e);
      return reply.status(400).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
  });
  fastify2.post("/logout", async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (sessionId) {
      await invalidateSession(sessionId);
    }
    reply.clearCookie("sessionId", { path: "/" });
    return { success: true };
  });
  fastify2.get("/me", async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      return reply.status(401).send({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D" });
    }
    const tokenHash = hashSessionToken(sessionId);
    const sessionList = await db.select().from(sessions).where(eq2(sessions.id, tokenHash));
    const session = sessionList[0];
    if (!session || new Date(session.expiresAt) < /* @__PURE__ */ new Date()) {
      reply.clearCookie("sessionId", { path: "/" });
      return reply.status(401).send({ error: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u062C\u0644\u0633\u0629" });
    }
    const userList = await db.select().from(users).where(eq2(users.id, session.userId));
    const user = userList[0];
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u0639\u0637\u0644" });
    }
    return {
      user: { id: user.id, username: user.username, role: user.role },
      permissions: getRolePermissions(user.role)
    };
  });
}

// server/src/routes/customers.ts
import { eq as eq3, like, or, and, desc, sql } from "drizzle-orm";
import crypto3 from "crypto";

// server/src/utils/textUtils.ts
function normalizeArabic(text2) {
  if (!text2) return "";
  return text2.toString().trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآٱ]/g, "\u0627").replace(/ة/g, "\u0647").replace(/ى/g, "\u064A");
}
function matchesSearch(target, query) {
  if (!query || !query.trim()) return true;
  if (target === null || target === void 0) return false;
  return normalizeArabic(String(target)).includes(normalizeArabic(query));
}
function matchesAnyField(targets, query) {
  if (!query || !query.trim()) return true;
  return targets.some((target) => matchesSearch(target, query));
}
function getArabicSearchVariants(query) {
  const q = query.trim();
  if (!q) return [];
  const variants = /* @__PURE__ */ new Set();
  variants.add(q);
  const bareAlef = q.replace(/[أإآٱ]/g, "\u0627");
  variants.add(bareAlef);
  variants.add(q.replace(/[ا]/g, "\u0623"));
  variants.add(q.replace(/[ا]/g, "\u0625"));
  variants.add(q.replace(/ة/g, "\u0647"));
  variants.add(q.replace(/ه/g, "\u0629"));
  variants.add(q.replace(/ي/g, "\u0649"));
  variants.add(q.replace(/ى/g, "\u064A"));
  return Array.from(variants);
}

// server/src/routes/customers.ts
var customerSchema = zod_default.object({
  name: zod_default.string().min(2),
  phone1: zod_default.string().min(5),
  phone2: zod_default.string().optional().nullable(),
  landline: zod_default.string().optional().nullable(),
  governorateId: zod_default.string().min(1),
  cityId: zod_default.string().min(1),
  village: zod_default.string().optional().nullable(),
  addressDetails: zod_default.string().optional().nullable(),
  filterTypeId: zod_default.string().optional().nullable(),
  maintenanceIntervalId: zod_default.string().min(1),
  lastMaintenanceDate: zod_default.string().optional().nullable(),
  notes: zod_default.string().optional().nullable()
});
function uuidv4() {
  return crypto3.randomUUID();
}
function calculateNextMaintenance(lastDateStr, intervalMonths) {
  if (!lastDateStr) return null;
  const date = new Date(lastDateStr);
  if (isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + intervalMonths);
  return date.toISOString().split("T")[0];
}
async function customerRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("customers.view")]
  }, async (request, reply) => {
    const query = request.query.q || "";
    const govId = request.query.govId || "";
    const cityId = request.query.cityId || "";
    const filterTypeId = request.query.filterTypeId || "";
    const status = request.query.status || "";
    const fromDate = request.query.from || "";
    const toDate = request.query.to || "";
    const dateType2 = request.query.dateType || "nextMaintenance";
    const isArchived = request.query.isArchived === "true";
    const page = parseInt(request.query.page) || 1;
    const limit = 500;
    const offset = (page - 1) * limit;
    let conditions = isArchived ? [eq3(customers.isDeleted, true)] : [or(eq3(customers.isDeleted, false), sql`${customers.isDeleted} IS NULL`)];
    if (query) {
      const isNumber = !isNaN(Number(query));
      const variants = getArabicSearchVariants(query);
      const orClauses = [];
      for (const v of variants) {
        orClauses.push(like(customers.name, `%${v}%`));
        orClauses.push(like(customers.phone1, `%${v}%`));
        orClauses.push(like(customers.phone2, `%${v}%`));
        orClauses.push(like(customers.village, `%${v}%`));
        orClauses.push(like(customers.notes, `%${v}%`));
      }
      if (isNumber) {
        orClauses.push(eq3(customers.customerCode, Number(query)));
      }
      conditions.push(or(...orClauses));
    }
    if (govId) conditions.push(eq3(customers.governorateId, govId));
    if (cityId) conditions.push(eq3(customers.cityId, cityId));
    if (filterTypeId) conditions.push(eq3(customers.filterTypeId, filterTypeId));
    if (status === "overdue") {
      conditions.push(sql`${customers.nextMaintenanceDate} < date('now', 'localtime')`);
    } else if (status === "today") {
      conditions.push(sql`${customers.nextMaintenanceDate} = date('now', 'localtime')`);
    } else if (status === "upcoming") {
      conditions.push(sql`${customers.nextMaintenanceDate} > date('now', 'localtime') AND ${customers.nextMaintenanceDate} <= date('now', '+7 days', 'localtime')`);
    } else if (status === "valid") {
      conditions.push(sql`${customers.nextMaintenanceDate} > date('now', '+7 days', 'localtime')`);
    }
    if (fromDate) {
      if (dateType2 === "created") {
        conditions.push(sql`date(${customers.createdAt} / 1000, 'unixepoch', 'localtime') >= ${fromDate}`);
      } else if (dateType2 === "lastMaintenance") {
        conditions.push(sql`${customers.lastMaintenanceDate} >= ${fromDate}`);
      } else {
        conditions.push(sql`${customers.nextMaintenanceDate} >= ${fromDate}`);
      }
    }
    if (toDate) {
      if (dateType2 === "created") {
        conditions.push(sql`date(${customers.createdAt} / 1000, 'unixepoch', 'localtime') <= ${toDate}`);
      } else if (dateType2 === "lastMaintenance") {
        conditions.push(sql`${customers.lastMaintenanceDate} <= ${toDate}`);
      } else {
        conditions.push(sql`${customers.nextMaintenanceDate} <= ${toDate}`);
      }
    }
    const results = await db.select().from(customers).where(and(...conditions)).limit(limit).offset(offset).orderBy(desc(customers.createdAt));
    const activeCountRes = await db.select({ count: sql`COUNT(*)` }).from(customers).where(eq3(customers.isDeleted, false));
    const archivedCountRes = await db.select({ count: sql`COUNT(*)` }).from(customers).where(eq3(customers.isDeleted, true));
    return {
      data: results,
      stats: {
        active: Number(activeCountRes[0]?.count || 0),
        archived: Number(archivedCountRes[0]?.count || 0)
      }
    };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("customers.create")]
  }, async (request, reply) => {
    try {
      const data = customerSchema.parse(request.body);
      const intervalRow = await db.select().from(maintenanceIntervals).where(eq3(maintenanceIntervals.id, data.maintenanceIntervalId));
      if (!intervalRow[0]) throw new Error("\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
      const nextDate = data.lastMaintenanceDate ? calculateNextMaintenance(data.lastMaintenanceDate, intervalRow[0].months) : null;
      const maxCodeResult = await db.select({ maxCode: sql`MAX(customer_code)` }).from(customers);
      const nextCode = (maxCodeResult[0]?.maxCode || 0) + 1;
      const customerId = uuidv4();
      await db.insert(customers).values({
        id: customerId,
        customerCode: nextCode,
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        landline: data.landline,
        governorateId: data.governorateId,
        cityId: data.cityId,
        village: data.village,
        addressDetails: data.addressDetails,
        filterTypeId: data.filterTypeId,
        maintenanceIntervalId: data.maintenanceIntervalId,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        notes: data.notes,
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, id: customerId, customerCode: nextCode };
    } catch (err) {
      return reply.status(400).send({ error: err.message || "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
  });
  fastify2.put("/:id", {
    preHandler: [requirePermission("customers.update")]
  }, async (request, reply) => {
    const { id } = request.params;
    try {
      const data = customerSchema.parse(request.body);
      const intervalRow = await db.select().from(maintenanceIntervals).where(eq3(maintenanceIntervals.id, data.maintenanceIntervalId));
      if (!intervalRow[0]) throw new Error("\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
      const nextDate = data.lastMaintenanceDate ? calculateNextMaintenance(data.lastMaintenanceDate, intervalRow[0].months) : null;
      await db.update(customers).set({
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        landline: data.landline,
        governorateId: data.governorateId,
        cityId: data.cityId,
        village: data.village,
        addressDetails: data.addressDetails,
        filterTypeId: data.filterTypeId,
        maintenanceIntervalId: data.maintenanceIntervalId,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        notes: data.notes,
        version: sql`version + 1`
      }).where(eq3(customers.id, id));
      return { success: true };
    } catch (err) {
      return reply.status(400).send({ error: err.message || "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
  });
  fastify2.get("/:id", {
    preHandler: [requirePermission("customers.view")]
  }, async (request, reply) => {
    const { id } = request.params;
    const custRes = await db.select().from(customers).where(eq3(customers.id, id));
    if (!custRes[0]) return reply.status(404).send({ error: "\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const customer = custRes[0];
    const govs = await db.select().from(governorates).where(eq3(governorates.id, customer.governorateId));
    const cits = await db.select().from(cities).where(eq3(cities.id, customer.cityId));
    const filters = customer.filterTypeId ? await db.select().from(filterTypes).where(eq3(filterTypes.id, customer.filterTypeId)) : [];
    const intervals = await db.select().from(maintenanceIntervals).where(eq3(maintenanceIntervals.id, customer.maintenanceIntervalId));
    const visitsList = await db.select({
      id: visits.id,
      employeeId: visits.employeeId,
      visitDate: visits.visitDate,
      employeeName: employees.name,
      item1: visits.item1,
      item2: visits.item2,
      item3: visits.item3,
      itemPost: visits.itemPost,
      itemCalcium: visits.itemCalcium,
      itemInfrared: visits.itemInfrared,
      itemSalts: visits.itemSalts,
      notes: visits.notes
    }).from(visits).leftJoin(employees, eq3(visits.employeeId, employees.id)).where(eq3(visits.customerId, id)).orderBy(desc(visits.visitDate));
    return {
      data: {
        ...customer,
        governorateName: govs[0]?.name || "",
        cityName: cits[0]?.name || "",
        filterTypeName: filters[0]?.name || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        maintenanceIntervalMonths: intervals[0]?.months || 0,
        visits: visitsList
      }
    };
  });
  fastify2.put("/:id/archive", {
    preHandler: [requirePermission("customers.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.update(customers).set({ isDeleted: true }).where(eq3(customers.id, id));
    return { success: true };
  });
  fastify2.put("/:id/restore", {
    preHandler: [requirePermission("customers.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.update(customers).set({ isDeleted: false }).where(eq3(customers.id, id));
    return { success: true };
  });
  fastify2.delete("/:id", {
    preHandler: [requirePermission("customers.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.delete(customers).where(eq3(customers.id, id));
    return { success: true };
  });
}

// server/src/routes/lookups.ts
async function lookupRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    let govs = await db.select().from(governorates);
    let cits = await db.select().from(cities);
    const filters = await db.select().from(filterTypes);
    const intervals = await db.select().from(maintenanceIntervals);
    govs = govs.sort((a, b) => {
      if (a.name === "\u0627\u0644\u063A\u0631\u0628\u064A\u0629") return -1;
      if (b.name === "\u0627\u0644\u063A\u0631\u0628\u064A\u0629") return 1;
      if (a.name === "\u0627\u0644\u062F\u0642\u0647\u0644\u064A\u0629") return -1;
      if (b.name === "\u0627\u0644\u062F\u0642\u0647\u0644\u064A\u0629") return 1;
      return a.name.localeCompare(b.name, "ar");
    });
    cits = cits.sort((a, b) => {
      if (a.name === "\u0633\u0645\u0646\u0648\u062F") return -1;
      if (b.name === "\u0633\u0645\u0646\u0648\u062F") return 1;
      if (a.name === "\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629") return -1;
      if (b.name === "\u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629") return 1;
      return a.name.localeCompare(b.name, "ar");
    });
    return {
      governorates: govs,
      cities: cits,
      filterTypes: filters,
      maintenanceIntervals: intervals
    };
  });
}

// server/src/server.ts
var import_helmet = __toESM(require_helmet2(), 1);

// server/src/routes/maintenance.ts
import { eq as eq4, and as and2, lte, isNotNull, sql as sql2, desc as desc2 } from "drizzle-orm";
import crypto4 from "crypto";
async function maintenanceRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0625\u062C\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("visits.view")]
  }, async (request, reply) => {
    const type = request.query.type || "today";
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let condition;
    if (type === "today") {
      condition = eq4(customers.nextMaintenanceDate, today);
    } else if (type === "overdue") {
      condition = and2(isNotNull(customers.nextMaintenanceDate), lte(customers.nextMaintenanceDate, today));
    }
    const allCustomers = await db.select().from(customers).where(
      and2(isNotNull(customers.nextMaintenanceDate), eq4(customers.isDeleted, false))
    );
    const in3DaysDate = /* @__PURE__ */ new Date();
    in3DaysDate.setDate(in3DaysDate.getDate() + 3);
    const in3Days = in3DaysDate.toISOString().split("T")[0];
    const todayTasks = allCustomers.filter((c) => c.nextMaintenanceDate === today);
    const overdueTasks = allCustomers.filter((c) => c.nextMaintenanceDate < today);
    const upcomingTasks = allCustomers.filter((c) => c.nextMaintenanceDate > today && c.nextMaintenanceDate <= in3Days).sort((a, b) => a.nextMaintenanceDate.localeCompare(b.nextMaintenanceDate));
    const historyRes = await db.select({ count: sql2`COUNT(*)` }).from(visits);
    const historyCount = Number(historyRes[0]?.count || 0);
    const stats = {
      today: todayTasks.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
      history: historyCount
    };
    let dataToReturn = [];
    if (type === "today") dataToReturn = todayTasks;
    else if (type === "overdue") dataToReturn = overdueTasks;
    else if (type === "upcoming") dataToReturn = upcomingTasks;
    if (type === "history") {
      const allVisits = await db.select({
        id: visits.id,
        customerId: customers.id,
        customerCode: customers.customerCode,
        name: customers.name,
        phone1: customers.phone1,
        visitDate: visits.visitDate,
        notes: visits.notes,
        isBaseline: visits.isBaseline
      }).from(visits).leftJoin(customers, eq4(visits.customerId, customers.id)).orderBy(desc2(visits.visitDate)).limit(100);
      dataToReturn = allVisits;
    }
    return { data: dataToReturn, stats };
  });
  fastify2.put("/:customerId/done", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const { customerId } = request.params;
    const custRes = await db.select().from(customers).where(eq4(customers.id, customerId));
    const cust = custRes[0];
    if (!cust) throw new Error("\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    const intervalRes = await db.select().from(maintenanceIntervals).where(eq4(maintenanceIntervals.id, cust.maintenanceIntervalId));
    const interval = intervalRes[0];
    if (!interval) throw new Error("\u0641\u062A\u0631\u0629 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629");
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const dateObj = new Date(todayStr);
    dateObj.setMonth(dateObj.getMonth() + interval.months);
    const nextDateStr = dateObj.toISOString().split("T")[0];
    await db.update(customers).set({
      lastMaintenanceDate: todayStr,
      nextMaintenanceDate: nextDateStr
    }).where(eq4(customers.id, customerId));
    return { success: true, nextMaintenanceDate: nextDateStr };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const data = request.body;
    let finalEmployeeId = data.employeeId;
    if (!finalEmployeeId) {
      const defaultEmp = await db.select().from(employees).where(eq4(employees.name, "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"));
      if (defaultEmp[0]) {
        finalEmployeeId = defaultEmp[0].id;
      } else {
        finalEmployeeId = crypto4.randomUUID();
        await db.insert(employees).values({
          id: finalEmployeeId,
          name: "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
          isTechnician: true
        });
      }
    }
    const visitId = crypto4.randomUUID();
    await db.insert(visits).values({
      id: visitId,
      customerId: data.customerId,
      employeeId: finalEmployeeId,
      visitDate: data.visitDate,
      workflowStatus: "COMPLETED",
      isBaseline: false,
      item1: data.item1 || false,
      item2: data.item2 || false,
      item3: data.item3 || false,
      itemPost: data.itemPost || false,
      itemCalcium: data.itemCalcium || false,
      itemInfrared: data.itemInfrared || false,
      itemSalts: data.itemSalts || false,
      notes: data.notes || "",
      createdAt: /* @__PURE__ */ new Date()
    });
    try {
      const allInv = await db.select().from(inventory);
      const candleKeywords = {
        item1: ["\u0645\u0631\u062D\u0644\u0629 1", "\u0645\u0631\u062D\u0644\u0629 \u0623\u0648\u0644\u0649", "\u0623\u0648\u0644\u0649"],
        item2: ["\u0645\u0631\u062D\u0644\u0629 2", "\u0645\u0631\u062D\u0644\u0629 \u062B\u0627\u0646\u064A\u0629", "\u062B\u0627\u0646\u064A\u0629"],
        item3: ["\u0645\u0631\u062D\u0644\u0629 3", "\u0645\u0631\u062D\u0644\u0629 \u062B\u0627\u0644\u062B\u0629", "\u062B\u0627\u0644\u062B\u0629"],
        itemSalts: ["\u0645\u0631\u062D\u0644\u0629 4", "\u0645\u0645\u0628\u0631\u064A\u0646", "\u0623\u0645\u0644\u0627\u062D"],
        itemPost: ["\u0645\u0631\u062D\u0644\u0629 5", "\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646", "\u0628\u0648\u0633\u062A"],
        itemCalcium: ["\u0645\u0631\u062D\u0644\u0629 6", "\u0643\u0627\u0644\u0633\u064A\u062A", "\u0643\u0627\u0644\u0633\u064A\u0648\u0645"],
        itemInfrared: ["\u0645\u0631\u062D\u0644\u0629 7", "\u0625\u0646\u0641\u0631\u0627\u0631\u064A\u062F", "\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F"]
      };
      for (const [key, keywords] of Object.entries(candleKeywords)) {
        if (data[key]) {
          const matched = allInv.find(
            (inv) => (inv.category === "candle" || !inv.category) && keywords.some((kw) => inv.itemName.includes(kw))
          );
          if (matched) {
            console.log(`[INVENTORY DEDUCTION] Candle ${key} matched '${matched.itemName}'. Deducting 1 from stock.`);
            await db.update(inventory).set({
              quantity: sql2`MAX(0, quantity - 1)`
            }).where(eq4(inventory.id, matched.id));
          }
        }
      }
      if (Array.isArray(data.spareParts)) {
        for (const sp of data.spareParts) {
          const partId = sp.id || sp.inventoryId;
          const qty = Number(sp.quantity) || 1;
          if (partId && qty > 0) {
            const matchedPart = allInv.find((inv) => inv.id === partId);
            if (matchedPart) {
              console.log(`[INVENTORY DEDUCTION] Spare part '${matchedPart.itemName}' used. Deducting ${qty} from stock.`);
              await db.update(inventory).set({
                quantity: sql2`MAX(0, quantity - ${qty})`
              }).where(eq4(inventory.id, matchedPart.id));
            }
          }
        }
      }
    } catch (invErr) {
      console.error("Error auto-deducting inventory for visit:", invErr);
    }
    const custRes = await db.select().from(customers).where(eq4(customers.id, data.customerId));
    const cust = custRes[0];
    if (!cust) throw new Error("\u0627\u0644\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    const intervalRes = await db.select().from(maintenanceIntervals).where(eq4(maintenanceIntervals.id, cust.maintenanceIntervalId));
    const interval = intervalRes[0];
    if (interval) {
      const dateObj = new Date(data.visitDate);
      dateObj.setMonth(dateObj.getMonth() + interval.months);
      const nextDateStr = dateObj.toISOString().split("T")[0];
      await db.update(customers).set({
        lastMaintenanceDate: data.visitDate,
        nextMaintenanceDate: nextDateStr
      }).where(eq4(customers.id, data.customerId));
    }
    return { success: true, visitId };
  });
  fastify2.put("/:id", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const { id } = request.params;
    const data = request.body;
    const visitRes = await db.select().from(visits).where(eq4(visits.id, id));
    const visit = visitRes[0];
    if (!visit) {
      return reply.status(404).send({ error: "\u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const updateFields = {};
    if (data.visitDate !== void 0) updateFields.visitDate = data.visitDate;
    if (data.employeeId !== void 0) updateFields.employeeId = data.employeeId || null;
    if (data.item1 !== void 0) updateFields.item1 = Boolean(data.item1);
    if (data.item2 !== void 0) updateFields.item2 = Boolean(data.item2);
    if (data.item3 !== void 0) updateFields.item3 = Boolean(data.item3);
    if (data.itemPost !== void 0) updateFields.itemPost = Boolean(data.itemPost);
    if (data.itemCalcium !== void 0) updateFields.itemCalcium = Boolean(data.itemCalcium);
    if (data.itemInfrared !== void 0) updateFields.itemInfrared = Boolean(data.itemInfrared);
    if (data.itemSalts !== void 0) updateFields.itemSalts = Boolean(data.itemSalts);
    if (data.notes !== void 0) updateFields.notes = data.notes;
    await db.update(visits).set(updateFields).where(eq4(visits.id, id));
    const customerId = visit.customerId;
    if (customerId) {
      const allVisits = await db.select().from(visits).where(eq4(visits.customerId, customerId)).orderBy(desc2(visits.visitDate));
      const custRes = await db.select().from(customers).where(eq4(customers.id, customerId));
      const cust = custRes[0];
      if (cust && allVisits.length > 0) {
        const intervalRes = await db.select().from(maintenanceIntervals).where(eq4(maintenanceIntervals.id, cust.maintenanceIntervalId));
        const interval = intervalRes[0];
        const months = interval?.months || 3;
        const latestVisitDate = allVisits[0].visitDate;
        const dateObj = new Date(latestVisitDate);
        dateObj.setMonth(dateObj.getMonth() + months);
        const nextDateStr = dateObj.toISOString().split("T")[0];
        await db.update(customers).set({
          lastMaintenanceDate: latestVisitDate,
          nextMaintenanceDate: nextDateStr
        }).where(eq4(customers.id, customerId));
      }
    }
    return { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u0628\u0646\u062C\u0627\u062D" };
  });
  fastify2.delete("/:id", {
    preHandler: [requirePermission("visits.create")]
  }, async (request, reply) => {
    const { id } = request.params;
    const visitRes = await db.select().from(visits).where(eq4(visits.id, id));
    const visit = visitRes[0];
    if (!visit) {
      return reply.status(404).send({ error: "\u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const customerId = visit.customerId;
    await db.delete(visits).where(eq4(visits.id, id));
    if (customerId) {
      const remainingVisits = await db.select().from(visits).where(eq4(visits.customerId, customerId)).orderBy(desc2(visits.visitDate));
      const custRes = await db.select().from(customers).where(eq4(customers.id, customerId));
      const cust = custRes[0];
      if (cust) {
        const intervalRes = await db.select().from(maintenanceIntervals).where(eq4(maintenanceIntervals.id, cust.maintenanceIntervalId));
        const interval = intervalRes[0];
        const months = interval?.months || 3;
        if (remainingVisits.length > 0) {
          const latestVisitDate = remainingVisits[0].visitDate;
          const dateObj = new Date(latestVisitDate);
          dateObj.setMonth(dateObj.getMonth() + months);
          const nextDateStr = dateObj.toISOString().split("T")[0];
          await db.update(customers).set({
            lastMaintenanceDate: latestVisitDate,
            nextMaintenanceDate: nextDateStr
          }).where(eq4(customers.id, customerId));
        } else {
          await db.update(customers).set({
            lastMaintenanceDate: null,
            nextMaintenanceDate: null
          }).where(eq4(customers.id, customerId));
        }
      }
    }
    return { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0632\u064A\u0627\u0631\u0629 \u0628\u0646\u062C\u0627\u062D" };
  });
}

// server/src/routes/installments.ts
import { eq as eq5, desc as desc3 } from "drizzle-orm";
import crypto5 from "crypto";
var installmentSchema = zod_default.object({
  customerId: zod_default.string().min(1),
  amount: zod_default.number().positive(),
  dueDate: zod_default.string(),
  notes: zod_default.string().optional().nullable()
});
function uuidv42() {
  return crypto5.randomUUID();
}
async function installmentsRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("installments.view")]
  }, async (request, reply) => {
    const status = request.query.status || "pending";
    const allInstallments = await db.select({
      id: installments.id,
      amount: installments.amount,
      dueDate: installments.dueDate,
      isPaid: installments.isPaid,
      paidDate: installments.paidDate,
      customerName: customers.name,
      customerPhone: customers.phone1,
      customerCode: customers.customerCode
    }).from(installments).leftJoin(customers, eq5(installments.customerId, customers.id)).where(eq5(installments.isPaid, status === "paid")).orderBy(desc3(installments.dueDate));
    return { data: allInstallments };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("installments.create")]
  }, async (request, reply) => {
    const data = installmentSchema.parse(request.body);
    const id = uuidv42();
    await db.insert(installments).values({
      id,
      customerId: data.customerId,
      amount: data.amount,
      dueDate: data.dueDate,
      notes: data.notes,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { success: true, id };
  });
  fastify2.put("/:id/pay", {
    preHandler: [requirePermission("installments.update")]
  }, async (request, reply) => {
    const { id } = request.params;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await db.update(installments).set({
      isPaid: true,
      paidDate: today
    }).where(eq5(installments.id, id));
    return { success: true };
  });
}

// server/src/routes/expenses.ts
import { desc as desc4 } from "drizzle-orm";
import crypto6 from "crypto";
var expenseSchema = zod_default.object({
  amount: zod_default.number().positive(),
  category: zod_default.string().min(1),
  description: zod_default.string().min(1),
  expenseDate: zod_default.string()
});
function uuidv43() {
  return crypto6.randomUUID();
}
async function expensesRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("expenses.view")]
  }, async (request, reply) => {
    const allExpenses = await db.select().from(expenses).orderBy(desc4(expenses.expenseDate));
    return { data: allExpenses };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("expenses.create")]
  }, async (request, reply) => {
    const data = expenseSchema.parse(request.body);
    const id = uuidv43();
    await db.insert(expenses).values({
      id,
      amount: data.amount,
      category: data.category,
      description: data.description,
      expenseDate: data.expenseDate,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { success: true, id };
  });
}

// server/src/routes/inventory.ts
import { eq as eq7 } from "drizzle-orm";
import crypto7 from "crypto";
var inventorySchema = zod_default.object({
  itemName: zod_default.string().min(1),
  category: zod_default.string().optional().default("spare"),
  quantity: zod_default.number().int().min(0),
  unitPrice: zod_default.number().min(0)
});
function uuidv44() {
  return crypto7.randomUUID();
}
async function inventoryRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("inventory.view")]
  }, async (request, reply) => {
    const allItems = await db.select().from(inventory);
    const totalItems = allItems.length;
    const totalQuantity = allItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalValue = allItems.reduce((acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0), 0);
    const lowStockCount = allItems.filter((i) => (i.quantity || 0) <= 5).length;
    const totalCandles = allItems.filter((i) => i.category === "candle").reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalSpares = allItems.filter((i) => i.category === "spare").reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    return {
      data: allItems,
      stats: {
        totalItems,
        totalQuantity,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        totalCandles,
        totalSpares
      }
    };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("inventory.create")]
  }, async (request, reply) => {
    try {
      const data = inventorySchema.parse(request.body);
      const existing = await db.select().from(inventory).where(eq7(inventory.itemName, data.itemName));
      if (existing[0]) {
        const newQty = existing[0].quantity + data.quantity;
        const newPrice = data.unitPrice > 0 ? data.unitPrice : existing[0].unitPrice;
        await db.update(inventory).set({
          quantity: newQty,
          unitPrice: newPrice,
          category: data.category || existing[0].category
        }).where(eq7(inventory.id, existing[0].id));
        return {
          success: true,
          id: existing[0].id,
          merged: true,
          message: `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 ${data.quantity} \u0642\u0637\u0639\u0629 \u0625\u0644\u0649 \u0631\u0635\u064A\u062F \u0627\u0644\u0635\u0646\u0641 \u0644\u064A\u0635\u0628\u062D ${newQty} \u0642\u0637\u0639\u0629`
        };
      }
      const id = uuidv44();
      await db.insert(inventory).values({
        id,
        itemName: data.itemName,
        category: data.category || "spare",
        quantity: data.quantity,
        unitPrice: data.unitPrice
      });
      return { success: true, id };
    } catch (err) {
      return reply.status(400).send({ error: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0635\u0646\u0641" });
    }
  });
  fastify2.put("/:id", {
    preHandler: [requirePermission("inventory.update")]
  }, async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    const itemRes = await db.select().from(inventory).where(eq7(inventory.id, id));
    if (!itemRes[0]) return reply.status(404).send({ error: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    const updateData = {};
    if (typeof body.itemName === "string") updateData.itemName = body.itemName;
    if (typeof body.unitPrice === "number") updateData.unitPrice = body.unitPrice;
    if (typeof body.quantity === "number") {
      updateData.quantity = body.quantity;
    } else if (typeof body.adjustment === "number") {
      updateData.quantity = Math.max(0, itemRes[0].quantity + body.adjustment);
    }
    await db.update(inventory).set(updateData).where(eq7(inventory.id, id));
    return { success: true };
  });
  fastify2.delete("/:id", {
    preHandler: [requirePermission("inventory.delete")]
  }, async (request, reply) => {
    const { id } = request.params;
    await db.delete(inventory).where(eq7(inventory.id, id));
    return { success: true };
  });
}

// server/src/routes/employees.ts
import crypto8 from "crypto";
var employeeSchema = zod_default.object({
  name: zod_default.string().min(1),
  isTechnician: zod_default.boolean()
});
function uuidv45() {
  return crypto8.randomUUID();
}
async function employeesRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  const requirePermission = (permission) => async (request, reply) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629" });
    }
  };
  fastify2.get("/", {
    preHandler: [requirePermission("employees.view")]
  }, async (request, reply) => {
    const allEmployees = await db.select().from(employees);
    return { data: allEmployees };
  });
  fastify2.post("/", {
    preHandler: [requirePermission("employees.create")]
  }, async (request, reply) => {
    const data = employeeSchema.parse(request.body);
    const id = uuidv45();
    await db.insert(employees).values({
      id,
      name: data.name,
      isTechnician: data.isTechnician
    });
    return { success: true, id };
  });
}

// server/src/routes/reports.ts
import { desc as desc5 } from "drizzle-orm";
async function reportsRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", {
    preHandler: async (request, reply) => {
      if (!hasPermission(request.user.role, "reports.view")) {
        return reply.status(403).send({ error: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631" });
      }
    }
  }, async (request, reply) => {
    const query = request.query || {};
    const { from, to, period, search, technicianId, governorateId, filterTypeId } = query;
    const allCustomers = await db.select().from(customers);
    const allVisits = await db.select().from(visits).orderBy(desc5(visits.visitDate));
    const allEmployees = await db.select().from(employees);
    const allInventory = await db.select().from(inventory);
    const allGovs = await db.select().from(governorates);
    const allCities = await db.select().from(cities);
    const allFilterTypes = await db.select().from(filterTypes);
    const govMap = new Map(allGovs.map((g) => [g.id, g.name]));
    const cityMap = new Map(allCities.map((c) => [c.id, c.name]));
    const filterTypeMap = new Map(allFilterTypes.map((f) => [f.id, f.name]));
    const employeeMap = new Map(allEmployees.map((e) => [e.id, e.name]));
    const customerMap = new Map(allCustomers.map((c) => [c.id, c]));
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let startDate = from || "";
    let endDate = to || "";
    if (period && !from && !to) {
      const now = /* @__PURE__ */ new Date();
      if (period === "today") {
        startDate = today;
        endDate = today;
      } else if (period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 864e5);
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = today;
      } else if (period === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 864e5);
        startDate = monthAgo.toISOString().split("T")[0];
        endDate = today;
      } else if (period === "quarter") {
        const quarterAgo = new Date(now.getTime() - 90 * 864e5);
        startDate = quarterAgo.toISOString().split("T")[0];
        endDate = today;
      } else if (period === "year") {
        const yearAgo = new Date(now.getTime() - 365 * 864e5);
        startDate = yearAgo.toISOString().split("T")[0];
        endDate = today;
      }
    }
    const filteredVisits = allVisits.filter((v) => {
      if (startDate && v.visitDate < startDate) return false;
      if (endDate && v.visitDate > endDate) return false;
      if (technicianId && v.employeeId !== technicianId) return false;
      const cust = customerMap.get(v.customerId);
      if (!cust) return false;
      if (governorateId && cust.governorateId !== governorateId) return false;
      if (filterTypeId && cust.filterTypeId !== filterTypeId) return false;
      if (search) {
        if (!matchesAnyField([cust.name, cust.phone1, cust.phone2, cust.customerCode, cust.village], search)) {
          return false;
        }
      }
      return true;
    });
    const filteredCustomers = allCustomers.filter((c) => {
      if (governorateId && c.governorateId !== governorateId) return false;
      if (filterTypeId && c.filterTypeId !== filterTypeId) return false;
      if (search) {
        if (!matchesAnyField([c.name, c.phone1, c.phone2, c.customerCode, c.village], search)) {
          return false;
        }
      }
      return true;
    });
    const getInventoryPrice = (keyword, fallback) => {
      const found = allInventory.find((i) => i.itemName.includes(keyword));
      return found ? found.unitPrice : fallback;
    };
    const stagesConfig = [
      { key: "item1", name: "\u0634\u0645\u0639\u0629 \u0623\u0648\u0644\u0649", fallbackPrice: 45, interval: "3 \u0623\u0634\u0647\u0631", stageNum: 1 },
      { key: "item2", name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0646\u064A\u0629", fallbackPrice: 55, interval: "6 \u0623\u0634\u0647\u0631", stageNum: 2 },
      { key: "item3", name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0644\u062B\u0629", fallbackPrice: 55, interval: "6 \u0623\u0634\u0647\u0631", stageNum: 3 },
      { key: "itemSalts", name: "\u0623\u0645\u0644\u0627\u062D (\u0645\u0645\u0628\u0631\u064A\u0646)", fallbackPrice: 350, interval: "12 - 24 \u0634\u0647\u0631", stageNum: 4 },
      { key: "itemPost", name: "\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646", fallbackPrice: 75, interval: "12 \u0634\u0647\u0631", stageNum: 5 },
      { key: "itemCalcium", name: "\u0643\u0627\u0644\u0633\u064A\u0648\u0645 (\u0643\u0627\u0644\u0633\u064A\u062A)", fallbackPrice: 75, interval: "12 \u0634\u0647\u0631", stageNum: 6 },
      { key: "itemInfrared", name: "\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F", fallbackPrice: 95, interval: "12 - 24 \u0634\u0647\u0631", stageNum: 7 }
    ];
    let totalCandlesConsumed = 0;
    let totalCandlesCost = 0;
    const candleStats = stagesConfig.map((cfg) => {
      let count = 0;
      filteredVisits.forEach((v) => {
        if (v[cfg.key]) count += 1;
      });
      const unitPrice = getInventoryPrice(cfg.name.split("(")[0].trim(), cfg.fallbackPrice);
      const totalCost = count * unitPrice;
      totalCandlesConsumed += count;
      totalCandlesCost += totalCost;
      return {
        stageNum: cfg.stageNum,
        name: cfg.name,
        interval: cfg.interval,
        count,
        unitPrice,
        totalCost,
        percentage: filteredVisits.length > 0 ? Math.round(count / filteredVisits.length * 100) : 0
      };
    });
    const overdueCount = allCustomers.filter((c) => c.nextMaintenanceDate && c.nextMaintenanceDate < today).length;
    const todayCount = allCustomers.filter((c) => c.nextMaintenanceDate === today).length;
    const upcomingCount = allCustomers.filter((c) => c.nextMaintenanceDate && c.nextMaintenanceDate > today).length;
    const onTimeRate = allCustomers.length > 0 ? Math.round((allCustomers.length - overdueCount) / allCustomers.length * 100) : 100;
    const maintenanceByFilterType = allFilterTypes.map((ft) => {
      const custCount = allCustomers.filter((c) => c.filterTypeId === ft.id).length;
      const visitsCount = filteredVisits.filter((v) => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.filterTypeId === ft.id;
      }).length;
      return {
        id: ft.id,
        name: ft.name,
        customerCount: custCount,
        visitsCount
      };
    });
    const technicianStats = allEmployees.filter((e) => e.isTechnician).map((tech) => {
      const techVisits = filteredVisits.filter((v) => v.employeeId === tech.id);
      let candlesInstalled = 0;
      techVisits.forEach((v) => {
        if (v.item1) candlesInstalled++;
        if (v.item2) candlesInstalled++;
        if (v.item3) candlesInstalled++;
        if (v.itemSalts) candlesInstalled++;
        if (v.itemPost) candlesInstalled++;
        if (v.itemCalcium) candlesInstalled++;
        if (v.itemInfrared) candlesInstalled++;
      });
      const lastVisit = techVisits.length > 0 ? techVisits[0].visitDate : "-";
      const score = techVisits.length >= 6 ? "\u0645\u0645\u062A\u0627\u0632" : techVisits.length >= 3 ? "\u062C\u064A\u062F \u062C\u062F\u0627\u064B" : "\u0646\u0634\u0637";
      return {
        id: tech.id,
        name: tech.name,
        visitsCount: techVisits.length,
        candlesInstalled,
        lastVisitDate: lastVisit,
        score,
        isActive: tech.isActive
      };
    }).sort((a, b) => b.visitsCount - a.visitsCount);
    const all27GovernoratesStats = allGovs.map((g) => {
      const custs = filteredCustomers.filter((c) => c.governorateId === g.id);
      const visitsInGov = filteredVisits.filter((v) => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.governorateId === g.id;
      });
      return {
        id: g.id,
        name: g.name,
        customerCount: custs.length,
        visitsCount: visitsInGov.length,
        percentage: filteredCustomers.length > 0 ? Math.round(custs.length / filteredCustomers.length * 100) : 0,
        coverageStatus: custs.length > 0 ? "\u0645\u063A\u0637\u0627\u0629 \u0628\u0646\u0634\u0627\u0637 \u0645\u064A\u062F\u0627\u0646\u064A" : "\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0634\u063A\u064A\u0644 \u0648\u0627\u0644\u062A\u0648\u0633\u0639"
      };
    }).sort((a, b) => b.customerCount - a.customerCount);
    const governorateStats = all27GovernoratesStats.filter((g) => g.customerCount > 0 || g.visitsCount > 0);
    const cityStats = allCities.map((ct) => {
      const custs = filteredCustomers.filter((c) => c.cityId === ct.id);
      const visitsInCity = filteredVisits.filter((v) => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.cityId === ct.id;
      });
      return {
        id: ct.id,
        name: ct.name,
        governorateName: govMap.get(ct.governorateId) || "",
        customerCount: custs.length,
        visitsCount: visitsInCity.length
      };
    }).filter((ct) => ct.customerCount > 0).sort((a, b) => b.customerCount - a.customerCount);
    const totalInventoryValue = allInventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalInventoryUnits = allInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const categorizeItem = (name, cat) => {
      const n = name.toLowerCase();
      if (cat === "candle" || n.includes("\u0634\u0645\u0639") || n.includes("\u0645\u0645\u0628\u0631\u064A\u0646")) return "\u0634\u0645\u0639 \u0648\u0645\u0645\u0628\u0631\u064A\u0646 \u0627\u0644\u0641\u0644\u0627\u062A\u0631";
      if (n.includes("\u0645\u0648\u062A\u0648\u0631") || n.includes("\u0645\u0636\u062E\u0629") || n.includes("\u0645\u062D\u0648\u0644") || n.includes("\u062A\u0631\u0627\u0646\u0633")) return "\u0645\u0648\u0627\u062A\u064A\u0631 \u0648\u0645\u062D\u0648\u0644\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629";
      if (n.includes("\u0645\u062D\u0628\u0633") || n.includes("\u062E\u0631\u0637\u0648\u0645") || n.includes("\u0643\u0648\u0639") || n.includes("\u0648\u0635\u0644\u0629")) return "\u0645\u062D\u0627\u0628\u0633 \u0648\u062E\u0631\u0627\u0637\u064A\u0645 \u0648\u0633\u0628\u0627\u0643\u0629";
      if (n.includes("\u062E\u0632\u0627\u0646") || n.includes("\u0635\u0646\u0628\u0648\u0631") || n.includes("\u062D\u0646\u0642\u064A\u0629") || n.includes("\u0647\u0627\u0648\u0633\u0646\u062C")) return "\u0642\u0637\u0639 \u063A\u064A\u0627\u0631 \u0648\u0647\u064A\u0627\u0643\u0644 \u0627\u0644\u062A\u0634\u063A\u064A\u0644";
      if (n.includes("\u0637\u0642\u0645") || n.includes("\u0645\u062D\u0637\u0629") || n.includes("\u0641\u0644\u062A\u0631 \u0643\u0627\u0645\u0644")) return "\u0623\u0637\u0642\u0645 \u0648\u0641\u0644\u0627\u062A\u0631 \u0645\u062A\u0643\u0627\u0645\u0644\u0629";
      return "\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0639\u0627\u0645\u0629";
    };
    const categoriesMap = {};
    allInventory.forEach((item) => {
      const cat = categorizeItem(item.itemName, item.category);
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { name: cat, count: 0, units: 0, value: 0 };
      }
      categoriesMap[cat].count += 1;
      categoriesMap[cat].units += item.quantity;
      categoriesMap[cat].value += item.quantity * item.unitPrice;
    });
    const categoryBreakdown = Object.values(categoriesMap).map((c) => ({
      ...c,
      value: Math.round(c.value),
      percentage: totalInventoryValue > 0 ? Math.round(c.value / totalInventoryValue * 100) : 0
    })).sort((a, b) => b.value - a.value);
    const itemConsumptionMap = {};
    filteredVisits.forEach((v) => {
      if (v.item1) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 1"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 1"] || 0) + 1;
      if (v.item2) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 2"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 2"] || 0) + 1;
      if (v.item3) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 3"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 3"] || 0) + 1;
      if (v.itemSalts) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 4"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 4"] || 0) + 1;
      if (v.itemPost) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 5"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 5"] || 0) + 1;
      if (v.itemCalcium) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 6"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 6"] || 0) + 1;
      if (v.itemInfrared) itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 7"] = (itemConsumptionMap["\u0634\u0645\u0639\u0629 \u0645\u0631\u062D\u0644\u0629 7"] || 0) + 1;
    });
    const detailedInventoryTable = allInventory.map((item) => {
      let consumed = 0;
      for (const [k, v] of Object.entries(itemConsumptionMap)) {
        if (item.itemName.includes(k) || k.includes(item.itemName.substring(0, 10))) {
          consumed = v;
          break;
        }
      }
      let status = "\u0622\u0645\u0646 \u0648\u0645\u062A\u0648\u0641\u0631";
      let statusColor = "emerald";
      if (item.quantity === 0) {
        status = "\u0646\u0641\u062F \u0628\u0627\u0644\u0643\u0627\u0645\u0644";
        statusColor = "red";
      } else if (item.quantity <= 5) {
        status = "\u062D\u0631\u062C - \u064A\u0644\u0632\u0645 \u0627\u0644\u062A\u0648\u0631\u064A\u062F";
        statusColor = "amber";
      } else if (item.quantity <= 15) {
        status = "\u0645\u062A\u0648\u0633\u0637";
        statusColor = "sky";
      }
      const monthlyRunRate = Math.max(0.5, consumed / (filteredVisits.length > 0 ? 3 : 1));
      const coverageMonths = (item.quantity / monthlyRunRate).toFixed(1);
      return {
        id: item.id,
        name: item.itemName,
        category: categorizeItem(item.itemName, item.category),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        retailPrice: Math.round(item.unitPrice * 1.35),
        totalCostValue: Math.round(item.quantity * item.unitPrice),
        totalRetailValue: Math.round(item.quantity * item.unitPrice * 1.35),
        consumedInVisits: consumed,
        coverageMonths: Number(coverageMonths),
        status,
        statusColor
      };
    }).sort((a, b) => b.totalCostValue - a.totalCostValue);
    const lowStockItems = detailedInventoryTable.filter((i) => i.quantity <= 5);
    const fastMovingItems = [...detailedInventoryTable].sort((a, b) => b.consumedInVisits - a.consumedInVisits).slice(0, 5);
    const slowMovingItems = detailedInventoryTable.filter((i) => i.consumedInVisits === 0).slice(0, 5);
    const warehouseReport = {
      summary: {
        totalItemTypes: allInventory.length,
        totalUnitsInStock: totalInventoryUnits,
        totalCapitalCost: Math.round(totalInventoryValue),
        totalEstimatedRetailValue: Math.round(totalInventoryValue * 1.35),
        expectedGrossProfit: Math.round(totalInventoryValue * 0.35),
        lowStockCount: lowStockItems.length,
        outOfStockCount: detailedInventoryTable.filter((i) => i.quantity === 0).length,
        healthyStockCount: detailedInventoryTable.filter((i) => i.quantity > 5).length,
        totalCandlesConsumedInVisits: totalCandlesConsumed,
        totalCandlesCostInVisits: totalCandlesCost
      },
      categoryBreakdown,
      fastMovingItems,
      slowMovingItems,
      lowStockItems,
      detailedItems: detailedInventoryTable
    };
    const detailedVisits = filteredVisits.slice(0, 100).map((v) => {
      const cust = customerMap.get(v.customerId);
      const changedCandles = [];
      if (v.item1) changedCandles.push("\u0634\u0645\u0639\u0629 \u0623\u0648\u0644\u0649");
      if (v.item2) changedCandles.push("\u0634\u0645\u0639\u0629 \u062B\u0627\u0646\u064A\u0629");
      if (v.item3) changedCandles.push("\u0634\u0645\u0639\u0629 \u062B\u0627\u0644\u062B\u0629");
      if (v.itemPost) changedCandles.push("\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646");
      if (v.itemCalcium) changedCandles.push("\u0643\u0627\u0644\u0633\u064A\u0648\u0645 (\u0643\u0627\u0644\u0633\u064A\u062A)");
      if (v.itemInfrared) changedCandles.push("\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F");
      if (v.itemSalts) changedCandles.push("\u0623\u0645\u0644\u0627\u062D (\u0645\u0645\u0628\u0631\u064A\u0646)");
      return {
        id: v.id,
        visitDate: v.visitDate,
        customerName: cust ? cust.name : "\u0639\u0645\u064A\u0644 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644",
        customerCode: cust ? cust.customerCode : "-",
        phone: cust ? cust.phone1 : "-",
        technicianName: v.employeeId ? employeeMap.get(v.employeeId) || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F" : "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
        governorateName: cust ? govMap.get(cust.governorateId) || "" : "",
        cityName: cust ? cityMap.get(cust.cityId) || "" : "",
        filterTypeName: cust ? filterTypeMap.get(cust.filterTypeId || "") || "\u0641\u0644\u062A\u0631 \u0645\u0646\u0632\u0644\u064A" : "",
        candlesSummary: changedCandles.join(" + ") || "\u0641\u062D\u0635 \u0648\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u0645\u0629",
        candlesCount: changedCandles.length,
        notes: v.notes || ""
      };
    });
    return {
      data: {
        filtersApplied: {
          from: startDate,
          to: endDate,
          period: period || "all",
          search: search || "",
          technicianId: technicianId || "",
          governorateId: governorateId || "",
          filterTypeId: filterTypeId || ""
        },
        overview: {
          totalCustomers: allCustomers.length,
          filteredCustomersCount: filteredCustomers.length,
          totalVisits: filteredVisits.length,
          onTimeRate,
          overdueCount,
          todayCount,
          upcomingCount,
          totalCandlesConsumed,
          totalCandlesCost,
          totalInventoryValue: Math.round(totalInventoryValue),
          totalInventoryUnits,
          totalEstimatedRetailValue: Math.round(totalInventoryValue * 1.35),
          lowStockCount: lowStockItems.length,
          activeTechniciansCount: technicianStats.length,
          totalGovernoratesCount: allGovs.length,
          activeGovernoratesCount: governorateStats.length
        },
        candleStats,
        maintenanceByFilterType,
        technicianStats,
        governorateStats,
        all27GovernoratesStats,
        cityStats,
        warehouseReport,
        lowStockItems: lowStockItems.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          category: i.category
        })),
        detailedVisits,
        lookups: {
          technicians: allEmployees.filter((e) => e.isTechnician).map((e) => ({ id: e.id, name: e.name })),
          governorates: allGovs.map((g) => ({ id: g.id, name: g.name })),
          filterTypes: allFilterTypes.map((f) => ({ id: f.id, name: f.name }))
        }
      }
    };
  });
}

// server/src/routes/dashboard.ts
import { eq as eq9, desc as desc6, sql as sql3 } from "drizzle-orm";
async function dashboardRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];
    const totalCustomersRes = await db.select({ count: sql3`COUNT(*)` }).from(customers);
    const totalCustomers = Number(totalCustomersRes[0]?.count || 0);
    const todayCountRes = await db.select({ count: sql3`COUNT(*)` }).from(customers).where(eq9(customers.nextMaintenanceDate, today));
    const todayCount = Number(todayCountRes[0]?.count || 0);
    const overdueCountRes = await db.select({ count: sql3`COUNT(*)` }).from(customers).where(sql3`${customers.nextMaintenanceDate} < ${today}`);
    const overdueCount = Number(overdueCountRes[0]?.count || 0);
    const upcomingCountRes = await db.select({ count: sql3`COUNT(*)` }).from(customers).where(sql3`${customers.nextMaintenanceDate} > ${today}`);
    const upcomingCount = Number(upcomingCountRes[0]?.count || 0);
    const filterStatsRes = await db.select({
      id: filterTypes.id,
      name: filterTypes.name,
      count: sql3`COUNT(${customers.id})`
    }).from(filterTypes).leftJoin(customers, eq9(filterTypes.id, customers.filterTypeId)).groupBy(filterTypes.id, filterTypes.name);
    const govStatsRes = await db.select({
      name: governorates.name,
      value: sql3`COUNT(${customers.id})`
    }).from(governorates).innerJoin(customers, eq9(governorates.id, customers.governorateId)).groupBy(governorates.name).orderBy(desc6(sql3`COUNT(${customers.id})`));
    const totalVisitsRes = await db.select({ count: sql3`COUNT(*)` }).from(visits);
    const totalVisits = Number(totalVisitsRes[0]?.count || 0);
    const monthlyVisitsRes = await db.select({ count: sql3`COUNT(*)` }).from(visits).where(sql3`${visits.visitDate} >= ${thirtyDaysAgo}`);
    const monthlyVisits = Number(monthlyVisitsRes[0]?.count || 0);
    const candleStatsRes = await db.select({
      item1: sql3`SUM(CASE WHEN ${visits.item1} = 1 THEN 1 ELSE 0 END)`,
      item2: sql3`SUM(CASE WHEN ${visits.item2} = 1 THEN 1 ELSE 0 END)`,
      item3: sql3`SUM(CASE WHEN ${visits.item3} = 1 THEN 1 ELSE 0 END)`,
      itemPost: sql3`SUM(CASE WHEN ${visits.itemPost} = 1 THEN 1 ELSE 0 END)`,
      itemCalcium: sql3`SUM(CASE WHEN ${visits.itemCalcium} = 1 THEN 1 ELSE 0 END)`,
      itemInfrared: sql3`SUM(CASE WHEN ${visits.itemInfrared} = 1 THEN 1 ELSE 0 END)`,
      itemSalts: sql3`SUM(CASE WHEN ${visits.itemSalts} = 1 THEN 1 ELSE 0 END)`
    }).from(visits);
    const stats = candleStatsRes[0] || {};
    const item1 = Number(stats.item1 || 0);
    const item2 = Number(stats.item2 || 0);
    const item3 = Number(stats.item3 || 0);
    const itemPost = Number(stats.itemPost || 0);
    const itemCalcium = Number(stats.itemCalcium || 0);
    const itemInfrared = Number(stats.itemInfrared || 0);
    const itemSalts = Number(stats.itemSalts || 0);
    const consumedCandles = item1 + item2 + item3 + itemPost + itemCalcium + itemInfrared + itemSalts;
    const filterConsumptionData = [
      { name: "\u0634\u0645\u0639\u0629 \u0623\u0648\u0644\u0649", value: item1 },
      { name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0646\u064A\u0629", value: item2 },
      { name: "\u0634\u0645\u0639\u0629 \u062B\u0627\u0644\u062B\u0629", value: item3 },
      { name: "\u0623\u0645\u0644\u0627\u062D (\u0645\u0645\u0628\u0631\u064A\u0646)", value: itemSalts },
      { name: "\u0628\u0648\u0633\u062A \u0643\u0631\u0628\u0648\u0646", value: itemPost },
      { name: "\u0643\u0627\u0644\u0633\u064A\u0648\u0645 (\u0643\u0627\u0644\u0633\u064A\u062A)", value: itemCalcium },
      { name: "\u0627\u0646\u0641\u0631\u0627\u0631\u064A\u062F", value: itemInfrared }
    ];
    const invAggRes = await db.select({
      totalItems: sql3`COUNT(*)`,
      totalUnits: sql3`SUM(${inventory.quantity})`,
      totalCapital: sql3`SUM(${inventory.quantity} * ${inventory.unitPrice})`,
      lowStockCount: sql3`SUM(CASE WHEN ${inventory.quantity} <= 5 THEN 1 ELSE 0 END)`
    }).from(inventory);
    const invAgg = invAggRes[0] || {};
    const recentLogs = await db.select().from(auditLogs).orderBy(desc6(auditLogs.createdAt)).limit(5);
    const todaysList = await db.select().from(customers).where(eq9(customers.nextMaintenanceDate, today)).limit(10);
    return {
      data: {
        totalCustomers,
        maintenance: {
          today: todayCount,
          overdue: overdueCount,
          upcoming: upcomingCount
        },
        monthlyVisits,
        totalVisits,
        consumedFilters: consumedCandles,
        filterStats: filterStatsRes.map((f) => ({ ...f, count: Number(f.count) })),
        govStats: govStatsRes.map((g) => ({ ...g, value: Number(g.value) })),
        filterConsumptionData,
        inventorySummary: {
          totalItems: Number(invAgg.totalItems || 0),
          totalUnits: Number(invAgg.totalUnits || 0),
          totalCapital: Math.round(Number(invAgg.totalCapital || 0)),
          lowStockCount: Number(invAgg.lowStockCount || 0)
        },
        recentLogs,
        todaysList
      }
    };
  });
}

// server/src/routes/users.ts
import { eq as eq10, desc as desc7 } from "drizzle-orm";
import { randomUUID } from "crypto";
var createUserSchema = zod_default.object({
  username: zod_default.string().min(3, "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 3 \u0623\u062D\u0631\u0641"),
  password: zod_default.string().min(4, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 4 \u0623\u062D\u0631\u0641"),
  role: zod_default.enum(["ADMIN", "MANAGER", "TECHNICIAN", "DATA_ENTRY"]),
  employeeId: zod_default.string().optional().nullable()
});
var updateUserSchema = zod_default.object({
  role: zod_default.enum(["ADMIN", "MANAGER", "TECHNICIAN", "DATA_ENTRY"]).optional(),
  isActive: zod_default.boolean().optional(),
  password: zod_default.string().min(4).optional().or(zod_default.literal("")),
  employeeId: zod_default.string().optional().nullable()
});
async function usersRoutes(fastify2) {
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        version: users.version
      }).from(users).orderBy(desc7(users.createdAt));
      const allEmployees = await db.select({
        id: employees.id,
        name: employees.name,
        userId: employees.userId,
        isTechnician: employees.isTechnician
      }).from(employees);
      const enrichedUsers = allUsers.map((u) => {
        const linkedEmp = allEmployees.find((e) => e.userId === u.id);
        return {
          ...u,
          employeeId: linkedEmp ? linkedEmp.id : null,
          employeeName: linkedEmp ? linkedEmp.name : null
        };
      });
      return {
        data: enrichedUsers,
        availableEmployees: allEmployees.filter((e) => !e.userId)
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" });
    }
  });
  fastify2.get("/roles-matrix", async (request, reply) => {
    const rolesList = Object.keys(ROLES).map((r) => ({
      key: r,
      name: r === "ADMIN" ? "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645 (\u0643\u0627\u0645\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A)" : r === "MANAGER" ? "\u0645\u0634\u0631\u0641 \u0639\u0627\u0645 / \u0645\u062F\u064A\u0631 \u0641\u0631\u0639" : r === "TECHNICIAN" ? "\u0641\u0646\u064A \u0635\u064A\u0627\u0646\u0629 \u0645\u064A\u062F\u0627\u0646\u064A" : "\u0645\u062F\u062E\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0648\u062D\u0633\u0627\u0628\u0627\u062A",
      description: r === "ADMIN" ? "\u062A\u062D\u0643\u0645 \u0643\u0627\u0645\u0644 \u0648\u0645\u0637\u0644\u0642 \u0641\u064A \u0643\u0627\u0641\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0648\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" : r === "MANAGER" ? "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0628\u062F\u0648\u0646 \u062D\u0630\u0641 \u062C\u0630\u0631\u064A" : r === "TECHNICIAN" ? "\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A \u0648\u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0634\u0645\u0639 \u0641\u0642\u0637" : "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u064A\u0648\u0645\u064A\u0629",
      permissions: getRolePermissions(r)
    }));
    return { roles: rolesList };
  });
  fastify2.post("/", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u0639\u0641\u0648\u0627\u064B\u060C \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u062A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    try {
      const parsed = createUserSchema.parse(request.body);
      const existing = await db.select().from(users).where(eq10(users.username, parsed.username));
      if (existing.length > 0) {
        return reply.status(400).send({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B\u060C \u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0633\u0645 \u0622\u062E\u0631" });
      }
      const newId = randomUUID();
      const pwdHash = await hashPassword(parsed.password);
      await db.insert(users).values({
        id: newId,
        username: parsed.username,
        passwordHash: pwdHash,
        role: parsed.role,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        version: 1
      });
      if (parsed.employeeId) {
        await db.update(employees).set({ userId: newId }).where(eq10(employees.id, parsed.employeeId));
      }
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: "users",
        entityId: newId,
        action: "CREATE_USER",
        newValues: { username: parsed.username, role: parsed.role },
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D", id: newId };
    } catch (e) {
      request.log.error(e);
      return reply.status(400).send({ error: e.errors ? e.errors[0].message : "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
  });
  fastify2.put("/:id", async (request, reply) => {
    const currentUser = request.user;
    const { id } = request.params;
    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return reply.status(403).send({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0643 \u0628\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
    try {
      const parsed = updateUserSchema.parse(request.body);
      const userList = await db.select().from(users).where(eq10(users.id, id));
      if (userList.length === 0) {
        return reply.status(404).send({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      if (currentUser.id === id && parsed.isActive === false) {
        return reply.status(400).send({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u0637\u064A\u0644 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u0634\u062E\u0635\u064A \u0627\u0644\u062D\u0627\u0644\u064A" });
      }
      const updates = {};
      if (parsed.role && currentUser.role === "ADMIN") updates.role = parsed.role;
      if (parsed.isActive !== void 0 && currentUser.role === "ADMIN") updates.isActive = parsed.isActive;
      if (parsed.password && parsed.password.trim().length >= 4) {
        updates.passwordHash = await hashPassword(parsed.password.trim());
      }
      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq10(users.id, id));
      }
      if (currentUser.role === "ADMIN" && parsed.employeeId !== void 0) {
        await db.update(employees).set({ userId: null }).where(eq10(employees.userId, id));
        if (parsed.employeeId) {
          await db.update(employees).set({ userId: id }).where(eq10(employees.id, parsed.employeeId));
        }
      }
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: "users",
        entityId: id,
        action: "UPDATE_USER",
        newValues: updates,
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D" };
    } catch (e) {
      request.log.error(e);
      return reply.status(400).send({ error: e.errors ? e.errors[0].message : "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" });
    }
  });
  fastify2.delete("/:id", async (request, reply) => {
    const currentUser = request.user;
    const { id } = request.params;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u064A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    if (currentUser.id === id) {
      return reply.status(400).send({ error: "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0646\u0647" });
    }
    try {
      await db.update(employees).set({ userId: null }).where(eq10(employees.userId, id));
      await db.delete(sessions).where(eq10(sessions.userId, id));
      await db.delete(users).where(eq10(users.id, id));
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: "users",
        entityId: id,
        action: "DELETE_USER",
        createdAt: /* @__PURE__ */ new Date()
      });
      return { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D" };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
}

// server/src/routes/settings.ts
import { eq as eq11, desc as desc8, sql as sql4 } from "drizzle-orm";
import { randomUUID as randomUUID2 } from "crypto";
import fs2 from "fs";
import path2 from "path";
var DEFAULT_COMPANY_PROFILE = {
  companyName: "\u0645\u0624\u0633\u0633\u0629 \u0641\u0644\u0627\u062A\u0631 \u0627\u0644\u062C\u0645\u0627\u0644 \u0644\u0623\u0646\u0638\u0645\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u062D\u0644\u064A\u0629 \u0627\u0644\u0645\u064A\u0627\u0647",
  slogan: "\u0635\u064A\u0627\u0646\u0629 \u0641\u0648\u0631\u064A\u0629 \u0648\u062A\u0648\u0631\u064A\u062F \u0634\u0645\u0639\u0627\u062A \u0648\u0645\u062D\u0637\u0627\u062A \u062A\u062D\u0644\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629 \u0628\u0623\u0639\u0644\u0649 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0646\u0642\u0627\u0621",
  phone1: "01012345678",
  phone2: "01123456789",
  hotline: "19000",
  whatsapp: "01012345678",
  email: "info@elgammal-filters.com",
  address: "\u0627\u0644\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0645\u0635\u0631\u064A\u0629 - \u0645\u0631\u0643\u0632 \u0633\u0645\u0646\u0648\u062F / \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u0629",
  commercialRegister: "104523/\u063A\u0631\u0628\u064A\u0629",
  taxNumber: "482-901-332",
  warrantyNotice: "\u0627\u0644\u0636\u0645\u0627\u0646 \u0633\u0627\u0631\u064D \u0628\u0634\u0631\u0637 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0634\u0645\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0641\u064A \u0645\u0648\u0627\u0639\u064A\u062F\u0647\u0627 \u0627\u0644\u062F\u0648\u0631\u064A\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0645\u0646 \u0642\u0650\u0628\u0644 \u0641\u0646\u064A \u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F."
};
var DEFAULT_ALERT_PREFERENCES = {
  alertDaysBefore: 7,
  overdueThresholdDays: 1,
  defaultWarrantyMonths: 12,
  standardTdsLimit: 150,
  enableSmsReminders: true
};
async function settingsRoutes(fastify2) {
  try {
    await db.run(sql4`CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`);
  } catch (e) {
  }
  fastify2.addHook("preHandler", verifyAuth);
  fastify2.get("/", async (request, reply) => {
    try {
      const allSettings = await db.select().from(systemSettings);
      const settingsMap = {};
      allSettings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      return {
        companyProfile: settingsMap["companyProfile"] || DEFAULT_COMPANY_PROFILE,
        alertPreferences: settingsMap["alertPreferences"] || DEFAULT_ALERT_PREFERENCES
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
  });
  fastify2.put("/", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER") {
      return reply.status(403).send({ error: "\u062A\u0639\u062F\u064A\u0644 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u064A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0625\u062F\u0627\u0631\u064A\u0629" });
    }
    try {
      const body = request.body;
      const now = /* @__PURE__ */ new Date();
      if (body.companyProfile) {
        const merged = { ...DEFAULT_COMPANY_PROFILE, ...body.companyProfile };
        await db.run(sql4`INSERT INTO system_settings (key, value, updated_at) 
          VALUES ('companyProfile', ${JSON.stringify(merged)}, ${now.getTime()})
          ON CONFLICT(key) DO UPDATE SET value = ${JSON.stringify(merged)}, updated_at = ${now.getTime()}`);
      }
      if (body.alertPreferences) {
        const merged = { ...DEFAULT_ALERT_PREFERENCES, ...body.alertPreferences };
        await db.run(sql4`INSERT INTO system_settings (key, value, updated_at) 
          VALUES ('alertPreferences', ${JSON.stringify(merged)}, ${now.getTime()})
          ON CONFLICT(key) DO UPDATE SET value = ${JSON.stringify(merged)}, updated_at = ${now.getTime()}`);
      }
      await db.insert(auditLogs).values({
        id: randomUUID2(),
        userId: currentUser.id,
        entityName: "system_settings",
        entityId: "global",
        action: "UPDATE_SETTINGS",
        newValues: body,
        createdAt: now
      });
      return { success: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0648\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0628\u0646\u062C\u0627\u062D" };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
    }
  });
  fastify2.get("/backup", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u062A\u0646\u0632\u064A\u0644 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u0642\u062A\u0635\u0631 \u0639\u0644\u0649 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    try {
      const [
        allCustomers,
        allVisits,
        allInventory,
        allEmployees,
        allInstallments,
        allExpenses,
        allGovs,
        allCities,
        allFilters,
        allIntervals,
        allUsers,
        allSettings
      ] = await Promise.all([
        db.select().from(customers),
        db.select().from(visits),
        db.select().from(inventory),
        db.select().from(employees),
        db.select().from(installments),
        db.select().from(expenses),
        db.select().from(governorates),
        db.select().from(cities),
        db.select().from(filterTypes),
        db.select().from(maintenanceIntervals),
        db.select({ id: users.id, username: users.username, role: users.role, isActive: users.isActive, createdAt: users.createdAt }).from(users),
        db.select().from(systemSettings)
      ]);
      const backupData = {
        system: "\u0645\u0646\u0638\u0648\u0645\u0629 \u0641\u0644\u0627\u062A\u0631 \u0627\u0644\u062C\u0645\u0627\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629",
        version: "2.0.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        exportedBy: currentUser.username,
        stats: {
          totalCustomers: allCustomers.length,
          totalVisits: allVisits.length,
          totalInventoryItems: allInventory.length,
          totalEmployees: allEmployees.length,
          totalInstallments: allInstallments.length,
          totalExpenses: allExpenses.length
        },
        data: {
          customers: allCustomers,
          visits: allVisits,
          inventory: allInventory,
          employees: allEmployees,
          installments: allInstallments,
          expenses: allExpenses,
          governorates: allGovs,
          cities: allCities,
          filterTypes: allFilters,
          maintenanceIntervals: allIntervals,
          users: allUsers,
          settings: allSettings
        }
      };
      const filename = `elgammal_backup_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`;
      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header("Content-Disposition", `attachment; filename="${filename}"`);
      return backupData;
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629" });
    }
  });
  fastify2.post("/restore", async (request, reply) => {
    const currentUser = request.user;
    if (currentUser.role !== "ADMIN") {
      return reply.status(403).send({ error: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0645\u0642\u062A\u0635\u0631\u0629 \u062D\u0635\u0631\u064A\u0627\u064B \u0639\u0644\u0649 \u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
    try {
      const payload = request.body;
      if (!payload || !payload.data) {
        return reply.status(400).send({ error: "\u0645\u0644\u0641 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u062A\u0627\u0644\u0641" });
      }
      const { data } = payload;
      let restoredCounts = {
        customers: 0,
        visits: 0,
        inventory: 0,
        employees: 0,
        installments: 0,
        expenses: 0
      };
      if (data.settings && Array.isArray(data.settings)) {
        for (const s of data.settings) {
          const val = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
          await db.run(sql4`INSERT INTO system_settings (key, value, updated_at) 
            VALUES (${s.key}, ${val}, ${Date.now()})
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
        }
      }
      if (data.customers && Array.isArray(data.customers)) {
        for (const c of data.customers) {
          const exists = await db.select().from(customers).where(eq11(customers.id, c.id));
          if (exists.length === 0) {
            await db.insert(customers).values(c);
            restoredCounts.customers++;
          }
        }
      }
      if (data.visits && Array.isArray(data.visits)) {
        for (const v of data.visits) {
          const exists = await db.select().from(visits).where(eq11(visits.id, v.id));
          if (exists.length === 0) {
            await db.insert(visits).values(v);
            restoredCounts.visits++;
          }
        }
      }
      if (data.inventory && Array.isArray(data.inventory)) {
        for (const i of data.inventory) {
          const exists = await db.select().from(inventory).where(eq11(inventory.id, i.id));
          if (exists.length === 0) {
            await db.insert(inventory).values(i);
            restoredCounts.inventory++;
          }
        }
      }
      if (data.employees && Array.isArray(data.employees)) {
        for (const e of data.employees) {
          const exists = await db.select().from(employees).where(eq11(employees.id, e.id));
          if (exists.length === 0) {
            await db.insert(employees).values(e);
            restoredCounts.employees++;
          }
        }
      }
      if (data.installments && Array.isArray(data.installments)) {
        for (const inst of data.installments) {
          const exists = await db.select().from(installments).where(eq11(installments.id, inst.id));
          if (exists.length === 0) {
            await db.insert(installments).values(inst);
            restoredCounts.installments++;
          }
        }
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        for (const exp of data.expenses) {
          const exists = await db.select().from(expenses).where(eq11(expenses.id, exp.id));
          if (exists.length === 0) {
            await db.insert(expenses).values(exp);
            restoredCounts.expenses++;
          }
        }
      }
      await db.insert(auditLogs).values({
        id: randomUUID2(),
        userId: currentUser.id,
        entityName: "database",
        entityId: "backup_restore",
        action: "RESTORE_BACKUP",
        newValues: restoredCounts,
        createdAt: /* @__PURE__ */ new Date()
      });
      return {
        success: true,
        message: "\u062A\u0645\u062A \u0645\u0631\u0627\u062C\u0639\u0629 \u0648\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D \u0645\u0646 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629!",
        restoredCounts
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629: " + (e.message || "") });
    }
  });
  fastify2.get("/system-stats", async (request, reply) => {
    try {
      let dbSizeMb = 0;
      let dbPath2 = path2.resolve(process.cwd(), "elgammal.db");
      if (!fs2.existsSync(dbPath2)) {
        dbPath2 = path2.resolve(process.cwd(), "../elgammal.db");
      }
      if (fs2.existsSync(dbPath2)) {
        const stats = fs2.statSync(dbPath2);
        dbSizeMb = Math.round(stats.size / (1024 * 1024) * 100) / 100;
      }
      const [cCount, vCount, iCount, eCount, uCount] = await Promise.all([
        db.select({ count: sql4`count(*)` }).from(customers),
        db.select({ count: sql4`count(*)` }).from(visits),
        db.select({ count: sql4`count(*)` }).from(inventory),
        db.select({ count: sql4`count(*)` }).from(employees),
        db.select({ count: sql4`count(*)` }).from(users)
      ]);
      return {
        dbSizeMb,
        totalCustomers: Number(cCount[0]?.count || 0),
        totalVisits: Number(vCount[0]?.count || 0),
        totalInventoryItems: Number(iCount[0]?.count || 0),
        totalEmployees: Number(eCount[0]?.count || 0),
        totalUsers: Number(uCount[0]?.count || 0),
        serverUptimeHours: Math.round(process.uptime() / 3600 * 10) / 10,
        nodeVersion: process.version,
        databaseStatus: "\u0645\u062A\u0635\u0644 \u0648\u0645\u062D\u0645\u064A (Healthy)"
      };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
  });
  fastify2.get("/audit-logs", async (request, reply) => {
    try {
      const logs = await db.select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        entityName: auditLogs.entityName,
        entityId: auditLogs.entityId,
        action: auditLogs.action,
        newValues: auditLogs.newValues,
        createdAt: auditLogs.createdAt,
        username: users.username,
        role: users.role
      }).from(auditLogs).leftJoin(users, eq11(auditLogs.userId, users.id)).orderBy(desc8(auditLogs.createdAt)).limit(50);
      return { data: logs };
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A" });
    }
  });
}

// server/src/server.ts
dotenv2.config({ path: path3.resolve(process.cwd(), "../.env") });
var fastify = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024
});
fastify.register(import_helmet.default, { global: true });
fastify.register(cors, {
  origin: true,
  credentials: true
});
fastify.register(cookie);
fastify.register(import_rate_limit.default, {
  max: 100,
  timeWindow: "1 minute"
});
fastify.setErrorHandler(function(error, request, reply) {
  this.log.error(error);
  if (error.validation) {
    return reply.status(400).send({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629", details: error.validation });
  }
  if (error.statusCode === 429) {
    return reply.status(429).send({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B" });
  }
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ error: error.message });
  }
  reply.status(500).send({ error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u062F\u0627\u062E\u0644\u064A \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B" });
});
fastify.register(authRoutes, { prefix: "/api/v1/auth" });
fastify.register(customerRoutes, { prefix: "/api/v1/customers" });
fastify.register(lookupRoutes, { prefix: "/api/v1/lookups" });
fastify.register(maintenanceRoutes, { prefix: "/api/v1/maintenance" });
fastify.register(installmentsRoutes, { prefix: "/api/v1/installments" });
fastify.register(expensesRoutes, { prefix: "/api/v1/expenses" });
fastify.register(inventoryRoutes, { prefix: "/api/v1/inventory" });
fastify.register(employeesRoutes, { prefix: "/api/v1/employees" });
fastify.register(reportsRoutes, { prefix: "/api/v1/reports" });
fastify.register(dashboardRoutes, { prefix: "/api/v1/dashboard" });
fastify.register(usersRoutes, { prefix: "/api/v1/users" });
fastify.register(settingsRoutes, { prefix: "/api/v1/settings" });
fastify.get("/api/v1/healthz", async (request, reply) => {
  return { status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() };
});
fastify.get("/api/v1/readyz", async (request, reply) => {
  try {
    const res = await db.get(sql5`SELECT 1`);
    if (res) {
      return { status: "ready", db: "connected", timestamp: (/* @__PURE__ */ new Date()).toISOString() };
    }
    reply.status(503).send({ status: "error", message: "DB not ready" });
  } catch (error) {
    reply.status(503).send({ status: "error", message: "DB connection failed" });
  }
});

// api/index.ts
async function index_default(req, res) {
  try {
    await fastify.ready();
    fastify.server.emit("request", req, res);
  } catch (err) {
    res.status(500).send(`Server Error: ${err.message}
Stack: ${err.stack}`);
  }
}
export {
  index_default as default
};
/*! Bundled license information:

tiny-lru/dist/tiny-lru.cjs:
  (**
   * tiny-lru
   *
   * @copyright 2026 Jason Mulligan <jason.mulligan@avoidwork.com>
   * @license BSD-3-Clause
   * @version 11.4.7
   *)
*/
