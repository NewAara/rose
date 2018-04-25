var
config = {
	project:'eveskeep-18',
	port: 8000,
	email: {
		user: 'write.eveskeep@gmail.com',
		pass: "eve's keep is secure/",
	},
	homepage: "landing.html",
},
_ = {
  // iterate over all properties in an object
  e: function(obj, func) {
    if(!obj) return ;
    var fields = Object.entries(obj);
    for(var i = 0, l = fields.length; i<l; i++) {
      var o = fields[i];
      if(func(o[1], o[0]) === "break") return ;
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
      if(opts && opts.deep && typeof value === "object" && typeof result[prop] === 'object') {
        _.x(result[prop], value, {deep:true});
      } else {
        result[prop] = value;
      }
    });
    return  result;
  },
  range: function(start,end,f) {
    if(start > end)
    for(var i = start; i <= end; i++) f(i);
    else 
    for(var i = start; i >= end; i--) f(i);
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
  text: function(message) { return  document.createTextNode(message); },
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
  split: function(text,into,by) {
    var result = {},
        fields = _.csv(into),
        parts = _.csv(text,by);
    _.e(fields, function(field, i) {
      if(i == fields.length-1) {
        result[field] = parts.slice(i).join(by);
        return  "break";
      } else {
        result[field] = parts[i];
      }
    });
    return  result;
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
},va,
C = function(init, methods) {
    _.x(init.prototype, methods);
    return  init;
},
files = {
	// pass in callbacks to use the asyncronous versions of these
	read: function(file, folder, cb) { console.log(file);
		if(cb) {
			fs.readFile(path.join(folder?folder:'.',file),"utf-8",cb);
		} else {
			return fs.readFileSync(path.join(folder?folder:'.',file), {
				encoding: "utf-8",
			});			
		}
	},
	write: function(file, text, folder, cb) {
		if(cb) {
			fs.writeFile(path.join(folder?folder:".",file), text, cb);
		} else {
			return fs.writeFileSync(path.join(folder?folder:".",file), text);
		}
	},
	append: function(file, text, folder, cb) {
		if(cb) {
			fs.appendFile(path.join(folder?folder:".",file), text, cb);
		} else {
			return fs.appendFileSync(path.join(folder?folder:".",file), text);
		}			
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
DB = C(function(folder){ var T = this, exists = fs.existsSync(folder);
	T.folder = folder;
	if(!exists) {
		fs.mkdirSync(folder);
	}
	T.lines = {};
	T.docs = {};
	// maps lines to their containing line
	T.index = {};
	T.links = {};
},{ 
	get: function(i,then) { 
		var T = this, result = {};
		result.in = T.index[i.id];
		result.line = T.lines[i.id];
		if(then) then(result);
	}, 
	save: function(i,then) { var T = this; 
		T.link(i,function() {
		T.record(i,function() {
		T.index(i,function() {
		T.write(i,then);
		});
		});
		});
	},
	then: function(f) { var T = this, f = f?f:function(){};
		return  function(err,data) {
			if(err) T.log(err);
			else f.call(T,data);
		};
	},
	path: function(path) {return  path.apply(path,[T.folder].concat(Array.prototype.slice.apply(arguments))); },
	write: function(i,then) { var T = this, line = _.obj(T.lines,i.id);
		line.content = i.content;
		files.write(i.id,i.content,T.path(i.type),T.then(then));
	},
	record: function(i,then) { var T = this;
		if(i.in && !i.after) {
			T.docs[T.in] = i.id;
			files.write(i.in,i.id,T.path('docs'),T.then(then));
		} else {
			then();
		}
	},
	link: function(i,then) { var T = this; 
		if(i.after) {
			_.push(T.links[i.id],i.after);
			files.append(i.id,i.after,T.path('links'),T.then(then));		
		} else {
			then();
		}
	},
	index: function(i,then) { var T = this; 
		if(i.in) {
			_.push(T.index[i.id],i.in);
			files.append(i.in,i.id,T.path('index'),T.then(then));
		} else {
			then();
		}
	},
}),
Crypt = C(function(login){
    var T = this;
    T.key = []; 
    T.index = [];
    if(login) T.init(login);
},{
read: function(msg) {
 var T = this, truth = [];
 _.e(msg, function(byte, i) {
      truth[i] = T.index[byte];
 });
 return  T.toUTF8(truth);
},
write: function(msg) {
    var T = this, truth = T.fromUTF8(msg),
        code = [];
    _.e(truth, function(byte, i) {
     code[i] = T.key[byte];
    });
    return  code;
},
init: function(key) {var T = this; 
for(var i = 0; i < 256; i++) {
      T.key[i] = i;
    }
var shift = T.fromUTF8(key), inc = 0, swaps = 256;   
for(var i1 = 0; i1 < shift.length; i1++) {
  
for(var i2 = shift[i1]; i2 < 256; i2++) {
        
    var p1 = shift[i1] + inc;
    if(p1 >= 256) p1 -= 256;
         
    p2 = T.key[p1];
for(var i3 = 0; i3 < p2; i3++) {
for(var i4 = 0; i4 < 256; i4++) {
    inc += T.key[p2]; 
if(inc >= 256) inc -= 256;
    p2 += T.key[inc]; if(p2 >= 256) p2 -= 256;                        
    tmp = T.key[p2];     
    T.key[p2] = T.key[inc];       
    T.key[inc] = tmp;
}
}   
}   
}
    
_.e(T.key, function(byte, i) {
  T.index[byte] = i;
 });
},
toUTF8: function (array) {
      var es= String.fromCharCode.apply(null, array),
          ds= 
decodeURIComponent(escape(atob(es)));
      return ds;
  },
  
fromUTF8: function(string) {
    var text = btoa(unescape(encodeURIComponent(string))),
      
charList = text.split(''),
      array = [];
    for(var i = 0; i < charList.length; i++) {    
array.push(charList[i].charCodeAt(0));
      }
      return new Uint8Array(array);
  },
}),
Control = C(function(db,opts) { var T = this;
	T.db = db;
	T.opts = _.x({
		handlers: {},
		controls: {},
	},opts,{deep:true});
},{
	take: function(i,o) {
		var T = this, handler = T.handlers[i.type];
		if(handler) {
			handler.call(T,i.content,i,T.then(function(data){
				T.db.save(i,T.then(function(){
					o.send(data);					
				}));
			}));
		} 
		T.db.save(i,T.then(function(){
			o.send();
		}));
	},
}),
controls = {
	email: function(content,i,then) { var T = this,
		s = _.split(content,"to,subject,message",'\n');
		T.db.get(i.author,'email',function(from){
			var mailer = T.cache.mailer;
			if(!mailer) 
				mailer = T.cache.mailer = new Email();
			mailer.send
		});
	},
};pageserver = express = require("express"),
parser = require("raw-body"),
web = express(),
db = new DB("pagedata"),
co = new Control(db);

web.use(function(i, o, then) {
  parser(i, {
    length: i.headers['content-length'],
    limit: '10mb',
    encoding: 'utf-8',
  }, function(err, text) {
    if(err) { return  then(err); }
    var lines = text.split('\n'),
    s = _.split(lines[0],'author,n','-');
    _.x(i,{
      id: lines[0],
      type: lines[1],
      author: s.author,
      n: s.n,
      content: _.str(lines,2),
    });
    then();
  });
});
web.get('/', function(i,o) {
	o.set("Content-Type","text/html");
	o.send(files.read(config.homepage));
});
web.post('/a*', function(i,o) {
  var id = i.url.slice(i.url.indexOf('/a')+2)
  files.read(i.text,'accounts',function(err,text){
    if(err) o.send('0');
    else o.send(text);
  });
});
web.post('/d*', function(i,o) {
  var page = i.url.slice(i.url.indexOf('/d')+2);
  o.send(files.read(page,'pages'));
});
web.post('/com', co.take.bind(co));
web.listen(config.port, function() {
	console.log("listening on "+config.port)
});
// idea: maintain circular buffer of open requests
// used to send back updates;