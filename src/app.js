(function () {
  characters('');
  setupRoutes();
  let searchText = document.getElementById('searchText');
  searchText.onkeyup = _.debounce(searchCharacters, 750);
  let searchFocus = document.getElementById('searchFocus');
  searchFocus.onclick = function () {
    searchText.focus();
  };
})();

function searchCharacters() {
  let searchText = document.getElementById('searchText');
  characters(searchText.value);
}

function addApiKey(url) {
  return url + '&limit=100&apikey=ddf365a3803a6e76f421e7f4d2794fef';
}

function characters(search) {
  let url = addApiKey('http://gateway.marvel.com/v1/public/characters?');
  if (search)
    url += '&nameStartsWith='+search;
  marmottajax({
    url: url,
    method: "get"
  }).then(function(result) {
    // result
    let json = JSON.parse(result);
    console.log(json);
    buildMasterList(json);
  }).error(function(message) {
    // message
    console.error(message);
  });
}

function buildMasterList(json) {
  let container = document.getElementById('master-list');
  container.innerHTML = '';
  json.data.results.forEach(function (result) {
    let child = document.createElement('div');
    child.innerHTML = result.name;
    child.onclick = function (event) {
      fillContent(result);
    };
    container.appendChild(child);
  });
}

function fillContent(result) {
  let container = document.getElementById('master-detail');
  let content = '<div id="master-heading">' + result.name + '</div>';
  content += '<div id="master-icon"><img src="' + result.thumbnail.path + '.' + result.thumbnail.extension + '"/></div>';
  if (result.description)
    content += '<div id="master-description">' + result.description + '</div>';
  if (result.comics.available > 0) {
    content += '<div id="master-comics"><span>Comics</span><ul>';
    result.comics.items.forEach(function (comic) {
      content += '<li>' + comic.name + '</li>'
    });
    content += '</ul></div>';
  }
  if (result.series.available > 0) {
    content += '<div id="master-series"><span>Series</span><ul>';
    result.series.items.forEach(function (series) {
      content += '<li>' + series.name + '</li>'
    });
    content += '</ul></div>';
  }
  container.innerHTML = content;
}

function setupRoutes() {
  // this doesn't work QQ
  var routes = {
    'products' : function (req){
      // GET /file.html#products
      console.log('products route');
    },
    'products/:category/:id?' : function (req){
        // GET /file.html#products/widgets/35
        req.params.category;
        // => widgets
    }
  }
  console.log(routes);
  Grapnel.listen(routes);
}
