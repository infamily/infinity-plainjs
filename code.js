(function(){
    var browser_language = navigator.language || navigator.userLanguage;
    var default_language = browser_language.substr(0, 2).toLowerCase();
    var languages;
    // people are more familiar with '.cn' as domain, and language //
    if (default_language == 'zh') { default_language = 'cn'; };

    function set_state (language, state) {
        var styleEl = document.createElement('style');
        styleEl.textContent = '.' + language + ' { display: ' + state + '; }';
        document.head.appendChild(styleEl);
    }

    function set_language(lang) {
        for (var i in languages) {
            if (lang == languages[i]) {
                set_state(languages[i], 'inline');
            }
            else {
                set_state(languages[i], 'none');
            }
        }
        return lang;
    }

    function language_widget(options) {
        languages = options.languages;
        var language_names = options.language_names;
        var lang = options.fallback_language;

        if (
            localStorage['lang'] !== null &&
            ~languages.indexOf(localStorage['lang'])
        ) {
            lang = localStorage['lang'];
        }
        else if (~languages.indexOf(default_language)) {
            lang = default_language;
        }

        localStorage["lang"] = set_language(lang);


        // Add <div class="language">
        var languagesDiv = document.createElement("div");
        languagesDiv.setAttribute("class", "language");

        // Add <select>
        var languageSelect = document.createElement("select");
        languageSelect.id = "select";
        languagesDiv.appendChild(languageSelect);

        // Add <option,..>
        for (var i = 0; i < languages.length; i++) {
            var option = document.createElement("option");
            option.value = languages[i];
            option.text = language_names[i];
            if (option.value == lang) {
                option.selected = true;
            }
            languageSelect.appendChild(option);
        }

        languageSelect.addEventListener('change', function(){
            localStorage["lang"] = set_language(this.value);
            window.location.reload(false);
        });

        return languagesDiv;
    }

    window.language_widget = language_widget;

    function menu_widget() {
        choices = ["Home", "What?", "How?"];
        choice_names = ["/", "/page/what.html", "/page/how.html"];

        // Add <div class="language">
        var menuDiv = document.createElement("div");
        menuDiv.setAttribute("class", "menu");

        // Add <select>
        var menuSelect = document.createElement("select");
        menuSelect.id = "items";
        menuDiv.appendChild(menuSelect);

        // Add <option,..>
        for (var i = 0; i < choices.length; i++) {
            var option = document.createElement("option");
            option.text = choices[i];
            option.value = choice_names[i];
            if (option.value == window.location.pathname) {
                option.selected = true;
            }
            menuSelect.appendChild(option);
        }

        menuSelect.addEventListener('change', function(){

            var url = document.getElementById('items').value;
            console.log(url);

            window.location.replace(url);

        });

        return menuDiv;

    }

    window.menu_widget = menu_widget;


}());
