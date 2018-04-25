var
_ = {
  // iterate over all properties in an object
  e: function(obj, func) {
    if(!obj) return ;
    if(typeof obj.e === "function") obj.e(func);
    else {
      var fields = Object.entries(obj);
      for(var i = 0, l = fields.length; i<l; i++) {
        var o = fields[i];
        if(func(o[1], o[0]) === "break") return ;
      }       
    }
  },
  // copies over everything in 'options' 
  // to the 'standard' object,
  // pass in opts{copy:true} to make it so that
  // the standard itself is not changed,
  // good for assigning default values using:
  // _.x(defaults, options);
  x: function(standard, options, opts) {
    var result = (opts&&opts.copy) ? {} : standard;
    _.e(options, function(value,prop) {
      if(opts && opts.deep && typeof value === "object") {
        _.x(result[prop], value, {deep:true});
      } else {
       result[prop] = value;
      }
    });
    return  result;
  },
  // takes a class and runs each of the functions in opt {
  //    method: parameter,  
  // }
  // assumes methods with one parameter
  run: function(T,opt) {
    _.e(opt, function(value,name) {
      if(typeof T[name] === "function") T[name](value);
    });
  },
  // version of array.push that initializes an array if it doesn't
  // already exist in the object
  push: function(obj,i,value) {
    if(!obj[i]) obj[i] = []; obj[i].push(value);
  },
  // creates an object in 'parent' if it doesn't already exist
  obj: function(parent,name,content) {
    if(!parent[name]) parent[name] = content?content:{}; 
    return  parent[name];
  },
  array: function(value) {
    return  Array.isArray(value) ? value : (value?[value]:[]);
  },
  // shorthand for var = obj[prop]?obj[prop]:another[prop];
  w: function(prop, preferred, fallback) {
    return  preferred[prop]?preferred[prop]:fallback[prop];
  },
  str(arr,start,end) {
    return  arr.slice(start?start:0,end).join(' ');
  },
  nospace: function(text) {
    return  text.replace(/\s/g,'');
  },
  word: function(text, f, rest) {
    var i = text.indexOf(' '),
        w = text.slice(0,i);
    if(f) f(w);
    if(rest) rest(text.slice(i+1));
    return  w;
  },
  parse: function(text,pattern) {
    var str = text,
        parse = [],
        pi = 0, plen = pattern.length,
        exp = pattern[pi];
    while(str.length>0) {
      var i = str.search(exp);
      if(i === -1) {
        parse.push(str);
        break;
      }
      parse.push(str.slice(0,i));
      str = str.slice(i);
      if(++pi >= plen) { pi = 0; }
    }
    return  parse;  
  },
  copy: function(obj, opt) {
    var o = _.x({shallow:false,just:null},opt), 
      result = Array.isArray(obj) ? [] : {};
    _.e(obj, function(value, field) {
      if(o.just && !o.just[field]) return ;
      if(typeof value === "object") {
        result[field] = o.shallow ? value : _.clone(value);
      } else {
        result[field] = value;
      }
    });
    return  result;
  },
  map: function(list, func) {
    var results = Array.isArray(list)?[]:{};
    _.e(list, function(v,i) {
       results[i]=func(v,i);
    });
    return  results;
  },
  has: function(obj, values) {
    var diff = false;
    _.e(values, function(val, prop) {
      if(diff) return ;
      if(typeof val === "object") {
        if(!_.has(obj[prop], val)) diff = true;
      } else {
        if(obj[prop] !== val) diff = true;
      }
    });
    return  !diff;
  },
  same: function(obj1, obj2) {
    return  _.has(obj1,obj2) && _.has(obj2,obj1);
  },
  filter: function(list, func) {
    var filtered = Array.isArray(list)?[]:{};
    _.e(list, function(item) {
      if(func(item)) filtered.push(item);
    });
    return  filtered;
  },
  contains: function(list, item) {
    for(var i = 0, l = list.length; i < l; i++) {
      if(list[i] === item) {
        return  true;
      }
    }
    return  false;
  },
  async: function(list, handler, cb) {
    var count = list.length,
        results = [],
        then = function(i, result) {
          results[i] = result;
          if(--count <= 0) {
            cb(results);
          }
        };
    list.forEach(function(item, i) {
      handler(item, then.bind(list, i));
    });
  },
  save_js: function(obj) {
    var str = '{', type, val;
    _.each(obj, function(field, name) {
      type = typeof field;
      if(type === "object") {
        val = _.save_js(field);
      } else
      if(type === "F") {
        val = field.toString();
      } else {
        val = field;
      }
      str += field+':'+val+',';
    });
    return  str + '}';
  },
  csv: function(list,delimiter) {
    return  list.split(delimiter?delimiter:',');
  },
  no: function(e) { e.preventDefault(); },
},
C = function(init, methods) {
    _.x(init.prototype, methods);
    return  init;
},
files = {
	read: function(file, folder) { console.log(file);
		return fs.readFileSync(path.join(folder?folder:'.',file), {
			encoding: "utf-8",
		});
	},
	write: function(file, text) {
		fs.writeFileSync(path.join("output",file), text);
	},
	js: function(file, folder, testing) {
		var text = files.r(file, folder),
				replace = [
				[/var T = this,/g,"var T = this,"],
				[/var V = this,/g,"var V = this,"],
				[/;/g,";"],
				[/,/g,","],
				[/,\)/g,")"],
				[/Array.prototype.slice.apply(arguments)/g,"Array.prototype.slice.apply(arguments)"],
				[/return /g,"return "],
				[/#\(/g,": function("],
				[/F\(/g,"function("],
				];
		if(testing) replace = replace.concat([
				[/#\|/g,'test("'],
				[/\|#/g,'");'], 
				[/#\{/g,'if(!end(['],
				[/#\}/g,'])) debugger;'],
				//[/;;\s*(\n|\r\n)?/g,'","'],
		]);	

		for(var i=0; i < replace.length; i++) {
			text = text.replace.apply(text,replace[i]);
		}

		return text;
	},	
}, fs = require("fs"), path = require("path")
,
config = {
	port: 8000,
},
server = express = require("express"),
web = express(),
html = files.read("client.html"),
M = {};
web.get('/', function(i,o) {
	o.set("Content-Type","text/html");
	o.send(html);
});
web.get('/com', function(i,o) {
	console.log(i);
	o.send("communicated");
});
web.post('/load', function(i,o) {
	console.log(i);
	var code = files.read(path.join("js",i+'.js'));
	eval("M["+i+"] = "+files.js(code));
});
web.listen(config.port,function(){
	console.log("listening on "+config.port)
});
// maintain circular buffer of open requests
// used to send back updates;