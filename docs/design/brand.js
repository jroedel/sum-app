// #cover, #colour, #type, #components or #home shows that section alone, which
// is how the PNGs in docs/design/ were rendered. A file of its own rather than
// inline, so the page runs under the server's Content-Security-Policy at /brand/.
function solo() {
  var id = location.hash.slice(1), el = id && document.getElementById(id);
  document.body.classList.toggle('solo', !!el);
  document.querySelectorAll('section.block').forEach(function (s) { s.hidden = !!el && s !== el; });
}
window.addEventListener('hashchange', solo); solo();
