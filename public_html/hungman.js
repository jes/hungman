(function() {
    var numletters = -1;
    var lastsuggestion = 'A';

    var refresh = function() {
        //refresh_dict();
        refresh_markov();
    };

    var refresh_markov = function() {
        var gamestate = '';
        for (var i = 0; i < numletters; i++) {
            gamestate += $('#word-letter-' + i).html().toLowerCase();
        }

        var triedletters = $('#wrong-letter-values').val().toLowerCase();

        var tried = {};
        for (var i = 0; i < gamestate.length; i++)
            tried[gamestate.charAt(i)] = true;
        for (var i = 0; i < triedletters.length; i++)
            tried[triedletters.charAt(i)] = true;

        var score = {};

        gamestate = '$$' + gamestate + '$$';
        for (var i = 2; i < gamestate.length; i++) {
            if ((gamestate.charCodeAt(i) < 'a'.charCodeAt(0) ||
                    gamestate.charCodeAt(i) > 'z'.charCodeAt(0)) &&
                    gamestate.charAt(i) != '$' && gamestate.charAt(i) != '_')
                continue;

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
        if (letters.length > 0) {
            lastsuggestion = letters[0].toUpperCase();
            out = '<span class="big-letter">' + letters[0].toUpperCase() + '</span><br>';
            for (var i = 1; i < letters.length; i++) {
                out += '<b>' + letters[i].toUpperCase() + '</b>';
                if (i < letters.length-1)
                    out += ' ';
            }
        }

        $('#suggestion-value').html(out);

        console.log(out);
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

        console.log(out);
    };

    var isnum = function(x) {
        return !isNaN(parseFloat(x)) && isFinite(x);
    };

    var begin = function() {
        numletters = $('#num-letters').val();

        if (isnum(numletters)) {
            $('#num-letters-div').hide();
            $('#game').show();

            /* populate #letter-inputs */
            var html = '';
            for (var i = 0; i < numletters; i++) {
                html += '<div id="word-letter-' + i + '" class="label word-letter">_</div>';
            }
            $('#letter-inputs').html(html);
            selectedletter = 0;
            $('#word-letter-0').addClass('selected-letter');

            /* clear #wrong-letter-values */
            $('#wrong-letter-values').html('');

            refresh();
        } else {
            $('#num-letters-div').show();
            $('#game').hide();
            alert("Not is num");
        }

        return false;
    };

    $('#letters-form').on('submit', begin);

    $('#game').hide();

    $(document).keydown(function(e) {
        if (e.which == 39 || e.which == 37) /* right, left */
            $('#word-letter-' + selectedletter).removeClass('selected-letter');

        if (e.which == 39) { /* right */
            selectedletter++;
        } else if (e.which == 37) { /* left */
            selectedletter--;
        } else if (e.which == 40) { /* down */
            $('#wrong-letter-values').val($('#wrong-letter-values').val() + lastsuggestion);
            refresh();
        } else if (e.which == 38) { /* up */
            var wrongs = $('#wrong-letter-values').val();
            wrongs = wrongs.substring(0, wrongs.length-1);
            $('#wrong-letter-values').val(wrongs);
            refresh();
        } else if (e.which >= 65 && e.which <= 90) { /* letter */
            $('#word-letter-' + selectedletter).html(String.fromCharCode(e.which));
            refresh();
        } else if (e.which == 32 || e.which == 189 || e.which == 27) { /* space, underscore, esc */
            $('#word-letter-' + selectedletter).html('_');
            refresh();
        } else {
            console.log(e.which);
            return true;
        }

        if (e.which == 39 || e.which == 37) { /* right, left */
            if (selectedletter < 0)
                selectedletter = numletters-1;
            else if (selectedletter >= numletters)
                selectedletter = 0;
            $('#word-letter-' + selectedletter).addClass('selected-letter');
        }

        return false;
    });

    refresh();
})();
