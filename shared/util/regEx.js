'use strict';

const regEx = {
  domainName: /https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,18}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/i
};

module.exports = regEx;
