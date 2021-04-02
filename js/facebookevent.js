!function(f,b,e,v,n,t,s){
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '148610518894735');
var hasShopify = false;
hasShopify = !localStorage.hasShopify ? false : localStorage.hasShopify;

//console.log("hasShopify:"+hasShopify);

if(hasShopify) {
    fbq('trackCustom', 'hasShopifyEvent', {hasShopify: hasShopify});
}