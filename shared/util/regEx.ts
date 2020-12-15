export const url = /^(?:https?|ftp):\/\/.{1,}\.{1}.{1,}/;
export const domainName = /(?:https?|udp):\/\/(?:www\.)?([-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,18}\b)*(\/[/\d\w.-]*)*(?:[?])*(.+)*/i;
export const cdata = /<!\[CDATA\[(.*?)\]\]>/;
export const noComma = /^[^,]+$/;
