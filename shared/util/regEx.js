const regEx = {
  url: /^(?:https?|ftp):\/\/.{1,}\.{1}.{1,}/,
  domainName: /(?:https?|udp):\/\/(?:www\.)?([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,18}\b)*(\/[/\d\w.-]*)*(?:[?])*(.+)*/i,
  cdata: /<!\[CDATA\[(.*?)\]\]>/,
};

module.exports = regEx;
