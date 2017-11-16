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
      url: 'https://test.wfx.io/api/v1/topics/?search=' + this.querySelector('.topics__search-input').value,
      method: 'GET',
      callback: showTopics
    });
  }

  // list of topics
  function showTopics(response) {
    var topicsList = container.querySelector('.topics__list');
    var topicsHTML = '';

    response.results.forEach(function(item){
      topicsHTML += '<section class="topics__item">\
                <a href="#" class="topics__item-title" data-url="' + item.url + '"><h2>' + item.title + '</h2></a>\
            </section>';
    });

    topicsList.innerHTML = topicsHTML;
    topicsList.querySelectorAll('.topics__item-title').forEach(function(link){
      link.addEventListener('click', function(event){
        event.preventDefault();

        var fakeLink = document.createElement('a');
        fakeLink.href = this.dataset.url;

        makeRequest({
          url: 'https://' + fakeLink.host + fakeLink.pathname + fakeLink.search,
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
      var fakeLink = document.createElement('a');
      fakeLink.href = response.previous;

      var prevButton = document.createElement('button');
      prevButton.textContent = 'Previous page';
      prevButton.addEventListener('click', function(){
        makeRequest({
          url: 'https://' + fakeLink.host + fakeLink.pathname + fakeLink.search,
          method: 'GET',
          callback: showTopics
        });
      });
      pagination.appendChild(prevButton);
    }

    if (response.next) {
      var fakeLink = document.createElement('a');
      fakeLink.href = response.next;

      var nextButton = document.createElement('button');
      nextButton.textContent = 'Next page';
      nextButton.addEventListener('click', function(){
        makeRequest({
          url: 'https://' + fakeLink.host + fakeLink.pathname + fakeLink.search,
          method: 'GET',
          callback: showTopics
        });
      });
      pagination.appendChild(nextButton);
    }
  }

  // topic page
  function showTopicItem(response) {
    container.querySelector('.topics__content').style.display = 'none';

    var itemHTML = '';

    itemHTML += '<a href="#" class="topics__back">&larr; go back</a>';

    var itemContent = container.querySelector('.topics__content-item');

    if (!itemContent) {
      itemContent = document.createElement('div');
      itemContent.className = 'topics__content-item';
      container.appendChild(itemContent);
    }

    itemHTML += '<div>\
                  <h1>' + response.title + '</h1>\
                  <div>' + response.body + '</div><br>\
                  <span>' + response.owner + '</span><br><br>\
                </div>';

    itemContent.innerHTML = itemHTML;
    itemContent.style.display = 'block';

    itemContent.querySelector('.topics__back').addEventListener('click', function(){
      itemContent.style.display = 'none';
      container.querySelector('.topics__content').style.display = 'block';
    });

    makeRequest({
      url: 'https://test.wfx.io/api/v1/comments/',
      method: 'GET',
      callback: function(response){
        if (response.results.length) {
          var comments = document.createElement('div');
          var commentsHTML = '<h3>Comments</h3>';
          response.results.forEach(function(comment){
            commentsHTML += '<div>' + comment.text + '<div style="text-align:right">' + comment.owner + '</div></div><br><br>';
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

    makeRequest({
      url: 'https://test.wfx.io/api/v1/topics/',
      method: 'GET',
      callback: showTopics
    });
  }

  window.topicsAPI = topicsAPI;
}());