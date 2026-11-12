// UofT Webring widget, one line on a member's site:
//   <script src="https://uoftwebring.com/embed.js" data-id="YOUR_RING_ID" async></script>
// Renders previous / surprise me / next links where the tag sits. They're plain /redirect links,
// so clicks are counted, and verify the widget, exactly like the copy-paste HTML snippet.
(function () {
    var me = document.currentScript;
    if (!me) return;
    // Same rule as the site checker (lib/verification.ts): digits only. A missing data-id would
    // otherwise read as Number(null) === 0, another member
    var id = me.getAttribute("data-id") || "";
    if (!/^\d{1,9}$/.test(id)) return;
    // Served from the ring's own origin, so previews and local dev link to themselves
    var origin = new URL(me.src).origin;
    var logo =
        { black: "ring_logo_black", white: "ring_logo_white" }[me.getAttribute("data-color")] || "ring_logo";
    var format = me.getAttribute("data-format") === "png" ? "png" : "svg";
    var parent = me.parentNode;
    // React 19 hoists <script async src> into <head> (so do members who paste it there): nothing in
    // <head> renders, so show the widget at the end of <body> instead
    var inHead = !parent || parent === document.head;

    var host = document.createElement("span");
    // Shadow DOM keeps the member's CSS out of the widget and ours out of their page
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    var style = document.createElement("style");
    style.textContent =
        "nav{display:inline-flex;align-items:center;gap:8px;color:inherit;font:inherit}" +
        "a{color:inherit;text-decoration:none}img{display:block;width:24px;height:auto}";
    var nav = document.createElement("nav");
    nav.setAttribute("aria-label", "UofT Webring");

    function add(href, label, text) {
        var a = document.createElement("a");
        a.setAttribute("href", href);
        a.setAttribute("aria-label", label);
        a.textContent = text;
        nav.appendChild(a);
        return a;
    }
    add(origin + "/redirect?nav=prev&id=" + id, "Previous site in UofT Webring", "←");
    var home = add(origin, "UofT Webring", "");
    home.setAttribute("target", "_blank");
    home.setAttribute("rel", "noopener");
    var img = document.createElement("img");
    img.setAttribute("src", origin + "/" + logo + "." + format);
    img.setAttribute("alt", "");
    home.appendChild(img);
    add(origin + "/redirect?nav=random&id=" + id, "Random site in UofT Webring", "⚄");
    add(origin + "/redirect?nav=next&id=" + id, "Next site in UofT Webring", "→");

    root.appendChild(style);
    root.appendChild(nav);

    function mount() {
        if (inHead) document.body.appendChild(host);
        else parent.insertBefore(host, me);
    }
    // An async script in <head> can run before <body> exists
    if (inHead && !document.body) document.addEventListener("DOMContentLoaded", mount);
    else mount();
})();
