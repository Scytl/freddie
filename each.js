var each = function (obj, callback) {
    Object.keys(obj).forEach(function (index) {
        callback(obj[index], index);
    });
};

module.exports = each;