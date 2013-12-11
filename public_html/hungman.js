(function() {
    var refresh = function() {
        refresh_dict();
        refresh_markov();
    };

    var refresh_markov = function() {
        var gamestate = $('#game-state').val().toLowerCase();
        var triedletters = $('#tried-letters').val().toLowerCase();

        var tried = {};
        for (var i = 0; i < gamestate.length; i++)
            tried[gamestate.charAt(i)] = true;
        for (var i = 0; i < triedletters.length; i++)
            tried[triedletters.charAt(i)] = true;

        var ntried = 0;
        for (var c in tried)
            ntried++;

        var score = {};

        gamestate = '$$' + gamestate + '$$';
        for (var i = 2; i < gamestate.length; i++) {
            for (var j = 0; j < 26; j++) {
                var c1 = String.fromCharCode('a'.charCodeAt(0) + j);

                if (gamestate[i-2] != '_' && c1 != gamestate[i-2])
                    c1 = gamestate[i-2];
                if (gamestate[i-2] == '_' && tried[c1])
                    continue;

                for (var k = 0; k < 26; k++) {
                    var c2 = String.fromCharCode('a'.charCodeAt(0) + k);

                    if (gamestate[i-1] != '_' && c2 != gamestate[i-1])
                        c2 = gamestate[i-1];
                    if (gamestate[i-1] == '_' && tried[c2])
                        continue;

                    for (var l = 0; l < 26; l++) {
                        var c3 = String.fromCharCode('a'.charCodeAt(0) + l);

                        if (gamestate[i] != '_' && c3 != gamestate[i])
                            c3 = gamestate[i];
                        if (gamestate[i] == '_' && tried[c3])
                            continue;

                        if (!tried[c1] && c1 != '$') {
                            if (!score[c1])
                                score[c1] = 0;
                            score[c1] += Math.log(markov[c1][c2][c3]);
                        }
                        if (!tried[c2] && c2 != '$') {
                            if (!score[c2])
                                score[c2] = 0;
                            score[c2] += Math.log(markov[c1][c2][c3]);
                        }
                        if (!tried[c3] && c3 != '$') {
                            if (!score[c3])
                                score[c3] = 0;
                            score[c3] += Math.log(markov[c1][c2][c3]);
                        }
                    }
                }
            }
        }

        var letters = [];
        for (var c in score)
            letters.push(c);
        letters.sort(function(a,b) {
            return score[b] - score[a];
        });

        var out = '';
        for (var i = 0; i < letters.length; i++) {
            out += '<b>' + letters[i] + '</b>';
            if (i < letters.length-1)
                out += ', ';
        }

        $('#markov-output').html(out);
    };

    var refresh_dict = function() {
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
                if (j == 0 || words[letters[i]][j] != words[letters[i]][j-1])
                    out += ' ' + words[letters[i]][j];
            out += '<br>';
        }

        $('#try-letters').html(out);
    };

    $('#game-state').on('input', refresh);
    $('#tried-letters').on('input', refresh);

    refresh();
})();
