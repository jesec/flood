export const url = /^(?:https?|ftp):\/\/.{1,}\.{1}.{1,}/;
export const magnet = /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&dn=.+&tr=.+$/;
export const cdata = /<!\[CDATA\[(.*?)\]\]>/;
export const noComma = /^[^,]+$/;
