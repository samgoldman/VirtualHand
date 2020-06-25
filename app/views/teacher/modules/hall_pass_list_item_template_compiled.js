function pug_attr(t,e,n,f){return!1!==e&&null!=e&&(e||"class"!==t&&"style"!==t)?!0===e?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;
function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function listItemTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;var locals_for_with = (locals || {});(function (hrid, includeGrantButton, time, username) {;pug_debug_line = 1;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cdiv class=\"unselectable listItem\"\u003E";
;pug_debug_line = 2;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 2;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = username) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 3;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 3;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "&nbsp\u003C\u002Fspan\u003E";
;pug_debug_line = 4;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 4;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + (pug_escape(null == (pug_interp = time) ? "" : pug_interp)) + "\u003C\u002Fspan\u003E";
;pug_debug_line = 5;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cspan\u003E";
;pug_debug_line = 5;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "&nbsp\u003C\u002Fspan\u003E";
;pug_debug_line = 6;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-sm btn-danger pull-right\""+" onclick=\"resolvePass(this.value)\""+pug_attr("value", hrid, true, false)) + "\u003E";
;pug_debug_line = 7;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Ci class=\"fa fa-fw fa-minus-circle\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
;pug_debug_line = 8;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
if (includeGrantButton) {
;pug_debug_line = 9;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cbutton" + (" class=\"btn btn-sm btn-success pull-right\""+" onclick=\"grantPass(this.value)\""+pug_attr("value", hrid, true, false)) + "\u003E";
;pug_debug_line = 10;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Ci class=\"fa fa-fw fa-check-circle\"\u003E\u003C\u002Fi\u003E\u003C\u002Fbutton\u003E";
}
pug_html = pug_html + "\u003C\u002Fdiv\u003E";
;pug_debug_line = 11;pug_debug_filename = ".\u002Fapp\u002Fviews\u002Fteacher\u002Fmodules\u002Fhall_pass_list_item_template.pug";
pug_html = pug_html + "\u003Cbr\u002F\u003E";}.call(this,"hrid" in locals_for_with?locals_for_with.hrid:typeof hrid!=="undefined"?hrid:undefined,"includeGrantButton" in locals_for_with?locals_for_with.includeGrantButton:typeof includeGrantButton!=="undefined"?includeGrantButton:undefined,"time" in locals_for_with?locals_for_with.time:typeof time!=="undefined"?time:undefined,"username" in locals_for_with?locals_for_with.username:typeof username!=="undefined"?username:undefined));} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}