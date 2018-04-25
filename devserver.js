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
      result[field] = parts[i];
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
},
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
}, fs = require("fs"), path = require("path"),
config = {
	port: 8000,
},
FileDB = C(function(folder,options) { var T = this, opts = _.x({
	maxindexsize: 1000,
},options);
	T.folder = folder?folder:'.';
	T.cache = {};
},{
	// the i(nput) parameter to the functions below expects
	// - id (author-n)
	// - author
	// - n(umber) submited by this author
	// - type of data
	// - content
	log: function(msg) { console.log(msg); },
	then: function(f) { var T = this;
		return  function(err,data) {
			if(err) T.log(err);
			else f.call(T,data);
		};
	},
	get: function(i,then) { 
		var T = this, data = _.obj(T.cache,i.author),
			  d = _.obj(data,i.type),
			  r = d[i.n];
		data.lasttime = Date.now();
		if(!r) {
			console.log('getting db',i.author+'-'+i.id, i.type);
			files.read(i.author+'-'+i.id, i.type, T.then(function(r){
				d[i.n] = r;
				then(r);
			})); 			
		} else {
			then(r);
		}
	},
	write: function(i,then) { 
		var T = this, data = _.obj(T.cache,i.author),
		entry = _.obj(data,i.type);
		entry[i.n] = data;
		console.log('writing db',i.author+'-'+i.id,T.path(i.type),i.content);
		files.write(i.author+'-'+i.id,i.content,T.path(i.type),T.then(then));
	},
	save: function(i,cb) { var T = this;
	   	T.get(i.author,'history','at', function(at) {
	    T.get(i.author,'history', at, function(index) {
	    	var update = index, 
	    	lines = index.split('\n'),
	    	begin = parseInt(lines[0]),
	    	entries = lines.slice(1),
	    	id = parseInt(i.id),
	    	end = begin + entries.length,
	    	writeto = at;
	    	if(at < n-1) {
	    		_.range(at,n-1,function(i){
	    			update += '\n';
	    		});
	    	}
	    	if((end-begin) > T.maxindexsize) {
	    		writeto = parseInt(at)+1;
	    		update = end+'\n'+type;
	    	} else {
	    		update += '\n'+type;
	    	}
	    	fs.lstat(type, function(stat) {
	    		if(!stat.isDirectory()) {
	    			fs.mkdir(type,T.then(function(){
	    			T.write(i,then);
	    			}));
	    		} else {
	    			T.write(i,then);
	    		}	
	    	});
	    });
	    });
	},
	record: function(i,then) {
		files.read(i.author,'id',T.then(function(id) { var
		oldid = parseInt(id),
		newid = parseInt(i.id);
		if(newid > oldid + 1) {
			T.log('missed ids between '+i.author+'-'+oldid+' & -'+newid);
		}
		if(newid < oldid) {
			T.log('overwriting '+i.author+'-'+newid);
		}
		files.write(i.author,i.id,'id');
		});
		if(!fs.isDir(type)) fs.makeDirSync(type);
		files.write(i.author+'-'+i.id,content,T.path(type));
	},
	index: function(i) {
		files.read(i.author,'index');
		files.write(T.author+'-'+i.id);
	},
	path: function(to) {var T = this; return  path.join(T.folder,to); },

}),
Control = C(function(db) { var T = this;
	T.db = db;
	T.handlers = {};
},{
	take: function(i,o) {
		var T = this, handler = T.handlers[i.type];
		if(handler) {
			handler(i.content,i.author,i.id,T.then(function(data){
				T.db.save(i,T.then(function(){
					o.send(data);					
				}));
			}));
		} 
		T.db.save(i,T.then(function(){
			o.send();
		});
	},
}),
devserver = express = require("express"),
parser = require("raw-body"),
web = express(),
db = new FileDB("devdata"),
co = new Control(db);
// web.use processes all i/o
// before it gets called with .get() or .post()
//web.use(function(i, o, next) {
//  i.setEncoding('utf8');
//  i.body = '';
//  o.on('data', function(chunk) {
//  	console.log("data",chunk);
//    i.body += chunk;
//  });
//  o.on('end', function() {
//  	// TODO more efficient to split as we read
//  	i.lines = i.body.split('\n');
//    next();
//  });
//});
web.use(function(i, o, then) {
  parser(i, {
    length: i.headers['content-length'],
    limit: '10mb',
    encoding: 'utf-8',
  }, function(err, text) {
    if(err) { return  then(err); }
    var lines = text.split('\n'),
    i.id = lines[0],
    s = _.split(i.id,'author,n','-');
    i.author = s.author;
    i.n = s.n;
    i.type = lines[1];
    i.content = _.str(lines,2);
    then();
  });
}); 
web.get('/', function(i,o) {
	o.set("Content-Type","text/html");
	o.send(files.read("client.html"));
});
web.post('/id', function(i,o) {
  files.read(i.text,'id',function(err,text){
    if(err) o.send('0');
    else o.send(text);
  });
});
web.post('///*', function(i,o) {
  var page = i.url.slice(i.url.indexOf('///')+3);
  o.send(files.read(page,'pages'));
});
web.post('/com', T.co.take.bind(T));
web.listen(config.port, function() {
	console.log("listening on "+config.port)
});
// idea: maintain circular buffer of open requests
// used to send back updates;