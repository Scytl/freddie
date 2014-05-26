var fs = require('fs');
        
var readJson = function (file, options) {
    var content;
    options = options || {};
    
    try {
        content = fs.readFileSync(file, { encoding: 'utf8' })
    } catch (e) {
        if (e.code === 'ENOENT' && options.fallback) return options.fallback;
        else throw e;
    }
        
    return JSON.parse(content);
};

module.exports = readJson;
