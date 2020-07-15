const moment = require('moment');

module.exports = {
    formatDate: function(date) {
        moment.locale('ms-my');
        var old_date = moment(date, 'D/M/YYYY');
        return moment(old_date).format('L');
    },

    // escape character for MySQL purpose
    escape_html: function (str) {
        if (typeof str != 'string')
        return str;

        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                                    // and double/single quotes
            }
        });
    }
}