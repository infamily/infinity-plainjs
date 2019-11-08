(function(){
  var container;

  function makeRequest(options) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', options.url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener('load', function(){
      var response = JSON.parse(this.responseText);
      options.callback(response);
    });
    xhr.send();
  }

  function makeSearch(event) {
    event.preventDefault();

    makeRequest({
      url: 'https://api.infty.xyz/topics/?search=' + this.querySelector('.topics__search-input').value + '&lang=' + localStorage['lang'],
      method: 'GET',
      callback: showTopics
    });
  }

  var topicTYPES = {
    0: "need-title",
    1: "goal-title",
    2: "idea-title",
    3: "plan-title",
    4: "step-title",
    5: "task-title"
  }

  // list of topics
  function showTopics(response) {
    var topicsList = container.querySelector('.topics__list');
    var topicsHTML = '';


    response.results.forEach(function(item){
      topicsHTML += '<section class="topics__item">\
                <a href="#/topic/' + item.id + '" class="topics__item-title ' + topicTYPES[item.type] + '" data-id="' + item.id + '"><h2>' + item.title + '</h2></a>\
            </section>';
    });

    topicsList.innerHTML = topicsHTML;
    topicsList.querySelectorAll('.topics__item-title').forEach(function(link){
      link.addEventListener('click', function(event){
        event.preventDefault();

        localStorage.setItem('scrollY', window.scrollY);

        window.history.pushState({}, null, this.hash);

        makeRequest({
          url: 'https://api.infty.xyz/topics/' + this.dataset.id + '/' + '?lang=' + localStorage['lang'],
          method: 'GET',
          callback: showTopicItem
        });
      });
    });

    createPagination(response);
  }

  function createPagination(response) {
    var pagination = container.querySelector('.topics__pagination');

    if (!pagination) {
      pagination = document.createElement('div');
      pagination.className = 'topics__pagination';
      container.querySelector('.topics__content').appendChild(pagination);
    }

    pagination.innerHTML = '';

    if (response.previous) {
      var fakeLinkPrev = document.createElement('a');
      fakeLinkPrev.href = response.previous;

      var prevButton = document.createElement('button');
      prevButton.textContent = 'Previous page';
      prevButton.addEventListener('click', function(){
        makeRequest({
          url: 'https://' + fakeLinkPrev.host + fakeLinkPrev.pathname + fakeLinkPrev.search,
          method: 'GET',
          callback: showTopics
        });
        window.scrollTo(0, 0);
      });
      pagination.appendChild(prevButton);
    }

    if (response.next) {
      var fakeLinkNext = document.createElement('a');
      fakeLinkNext.href = response.next;

      var nextButton = document.createElement('button');
      nextButton.textContent = 'Next page';
      nextButton.addEventListener('click', function(){
        makeRequest({
          url: 'https://' + fakeLinkNext.host + fakeLinkNext.pathname + fakeLinkNext.search,
          method: 'GET',
          callback: showTopics
        });
        window.scrollTo(0, 0);
      });
      pagination.appendChild(nextButton);
    }
  }

  // topic page
  function showTopicItem(response) {
    container.querySelector('.topics__content').style.display = 'none';
    window.scrollTo(0, 0);

    var itemHTML = '';

    itemHTML += '<a href="/" class="topics__back">&larr; go back</a>';

    var itemContent = container.querySelector('.topics__content-item');

    if (!itemContent) {
      itemContent = document.createElement('div');
      itemContent.className = 'topics__content-item';
      container.appendChild(itemContent);
    }

    var mdConverter = new showdown.Converter();

    itemHTML += '<div>\
                  <h1 class="'+ topicTYPES[response.type] +'">' + response.title + '</h1>\
                  <div>' + mdConverter.makeHtml(response.body) + '</div><br>\
                  <span>' + response.owner + '</span><br><br>\
                </div>';

    itemContent.innerHTML = itemHTML;
    itemContent.style.display = 'block';

    itemContent.querySelector('.topics__back').addEventListener('click', function(event){
      event.preventDefault();
      itemContent.style.display = 'none';
      container.querySelector('.topics__content').style.display = 'block';
      window.scrollTo(0, parseInt(localStorage.getItem('scrollY')) || 0);
      window.history.pushState({}, null, this.pathname);
    });

    makeRequest({
      url: 'https://api.infty.xyz/comments/?topic=' + response.id + '&lang=' + localStorage['lang'],
      method: 'GET',
      callback: function(response){
        if (response.results.length) {
          var comments = document.createElement('div');
          var commentsHTML = '<h3>Comments</h3>';
          response.results.forEach(function(comment){
            commentsHTML += '<div>' + mdConverter.makeHtml(comment.text) + '<div style="text-align:right">' + comment.owner + '</div></div><br><br>';
          });

          comments.innerHTML = commentsHTML;

          itemContent.appendChild(comments);
        }
      }
    });
  }

  function topicsAPI(el) {
    container = el;

    var search = container.querySelector('.topics__search');
    search.addEventListener('submit', makeSearch);

    var topicHref = window.location.hash.substr(1);
    if (topicHref) {
      makeRequest({
        url: 'https://api.infty.xyz/topics/' + topicHref.match(/\/topic\/(\d+)/)[1] + '/' + '?lang=' + localStorage['lang'],
        method: 'GET',
        callback: showTopicItem
      });
    }

    makeRequest({
      url: 'https://api.infty.xyz/topics/?lang=' + localStorage['lang'],
      method: 'GET',
      callback: showTopics
    });

    localStorage.removeItem('scrollY');
  }

  window.topicsAPI = topicsAPI;
}());
