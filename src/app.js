(function () {
  setupRoutes();
  // intialise events
  let searchText = document.getElementById('searchText');
  searchText.onkeyup = _.debounce(searchCharacters, 500);
  let searchFocus = document.getElementById('searchFocus');
  searchFocus.onclick = function () {
    searchText.focus();
  };
})();

// hmm, data in global scope...
var _json;

// invoked from search text debounce
function searchCharacters() {
  let searchText = document.getElementById('searchText');
  characters(searchText.value, null);
}

// add api key to url
function addApiKey(url) {
  return url + '&limit=100&apikey=ddf365a3803a6e76f421e7f4d2794fef';
}

// search for characters from api
function characters(search, id) {
  let url = addApiKey('http://gateway.marvel.com/v1/public/characters?');
  if (search)
    url += '&nameStartsWith='+search;
  let spinner = document.getElementById('spinner');
  spinner.style.display = 'block';
  marmottajax({
    url: url,
    method: "get"
  }).then(function(result) {
    // result
    spinner.style.display = 'none';
    _json = JSON.parse(result);
    console.log(_json);
    buildMasterList(_json);
    console.log('display id: ', id);
    if (id)
      findCharacter(id)
  }).error(function(message) {
    spinner.style.display = 'none';
    // message
    console.error(message);
  });
}

// build the list of characters to display.
function buildMasterList(json) {
  let container = document.getElementById('master-list');
  container.innerHTML = '';
  json.data.results.forEach(function (result) {
    let child = document.createElement('div');
    child.innerHTML = result.name;
    child.onclick = function (event) {
      fillContent(result);
      console.log(result);
      let searchText = document.getElementById('searchText');
      history.pushState(null, null, '/#character/' + result.id + '/' + searchText.value);
    };
    container.appendChild(child);
  });
}

// fills the main content
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

// find a character by id, then display details.
function findCharacter(id) {
  let result = null; //_.find(_json.data.results, {id: id});
  for (let i = 0; i < _json.data.results.length; i++) {
    if (_json.data.results[i].id == id) {
      result = _json.data.results[i];
    }
  }
  // console.log(_json.data.results);
  // console.log('found character: ', id, result);
  if (result)
    fillContent(result);
}

// define the application routes
function setupRoutes() {
  var r = Rlite();
  r.add('', function (req) {
    characters('', null);
  });
  r.add('character/:id/:search', function (req) {
    let searchText = document.getElementById('searchText');
    console.log('params: ', req.params);
    characters(req.params.search, req.params.id);
  });
  r.add('character/:id', function (req) {
    let searchText = document.getElementById('searchText');
    console.log('params: ', req.params);
    characters(null, req.params.id);
  });
    // Hash-based routing
  function processHash() {
    var hash = location.hash || '#';
    r.run(hash.slice(1));
  }
  window.addEventListener('hashchange', processHash);
  processHash();
}
