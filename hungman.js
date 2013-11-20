(function() {
    var refresh = function() {
        var gamestate = $('#game-state').val().toLowerCase();
        var triedletters = $('#tried-letters').val().toLowerCase();

        var tried = {};
        for (var i = 0; i < gamestate.length; i++)
            tried[gamestate.charAt(i)] = true;
        for (var i = 0; i < triedletters.length; i++)
            tried[triedletters.charAt(i)] = true;

        var score = {};
        var words = {};

        var search = function(node, str) {
            if (str[str.length-1] != gamestate[str.length-1] && gamestate[str.length-1] != '_')
                return;

            if (tried[str[str.length-1]] && gamestate[str.length-1] != str[str.length-1])
                return;

            if (node[0] && str.length == gamestate.length) {
                for (var i = 0; i < str.length; i++) {
                    if (!tried[str[i]]) {
                        if (!score[str[i]])
                            score[str[i]] = 0;
                        score[str[i]]++;
                        if (!words[str[i]])
                            words[str[i]] = [];
                        words[str[i]].push(str);
                    }
                }
            }

            if (str.length >= gamestate.length)
                return;

            for (var c in node)
                search(node[c], str+c);
        }

        search(dictionary, '');

        var letters = [];
        for (var c in score)
            letters.push(c);
        letters.sort(function(a,b) {
            return score[b] - score[a];
        });

        var out = '';
        for (var i = 0; i < letters.length; i++) {
            out += '<b>' + letters[i] + '</b>';
            for (var j = 0; j < words[letters[i]].length; j++)
                out += ' ' + words[letters[i]][j];
            out += '<br>';
        }

        $('#try-letters').html(out);
    };

    $('#game-state').on('input', refresh);
    $('#tried-letters').on('input', refresh);

    refresh();
})();
