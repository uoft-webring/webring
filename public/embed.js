// UofT Webring widget, one line on a member's site:
//   <script src="https://uoftwebring.com/embed.js" data-id="YOUR_RING_ID" data-color="blue"
//       data-format="svg" async></script>
// data-color is blue (default), black or white; data-format is svg (default) or png.
// Renders previous / home / random / next links. They're plain /redirect links, so clicks are
// counted, and verify the widget, exactly like the copy-paste HTML snippet.
// Where it renders: inside the first element with a data-uoft-webring attribute if the page has one
// (e.g. <span data-uoft-webring></span>), otherwise just before the script tag, or at the end of
// <body> when the tag ends up in <head> (React 19 hoists async scripts there).
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

    var host = document.createElement("span");
    // Marks a filled mount point, so a second copy of the tag doesn't render the widget twice
    host.setAttribute("data-uoft-webring-widget", "");
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
        // A mount point lets members on React/Next place the widget themselves: it lives inside their
        // tree, so it also goes away on client-side navigation instead of sticking to every page
        var spot = document.querySelector("[data-uoft-webring]");
        if (spot) {
            if (!spot.querySelector("[data-uoft-webring-widget]")) spot.appendChild(host);
            return;
        }
        var parent = me.parentNode;
        // React 19 hoists <script async src> into <head> (so do members who paste it there): nothing in
        // <head> renders, so show the widget at the end of <body> instead
        if (parent && parent !== document.head) parent.insertBefore(host, me);
        else document.body.appendChild(host);
    }
    // While the page is still parsing, the mount point may not exist yet and <body> holds only what's
    // been parsed so far (an async script can run then, e.g. from cache), so wait for the whole document
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
})();
