function Players(name, marker){
    var getName = () => name;
    var setName = (newName) => name = newName;
    var getMarker = () => marker;
    var setMarker = (newMarker) => marker = newMarker; 

    return {getName, setName, getMarker, setMarker};
}

const Gameboard = (function(){
    const gameboard_btns = Array.from(document.querySelectorAll('.gameboard-btn'));
    const clear_gameboard = document.querySelector('#clear-gameboard');
    let ai_move;
    let current_marker = 'X';
    let board = [['','',''],
                 ['','',''],
                 ['','','']];

    const clear = function (){
        _player_name_add_glow();
        Game.winner_text_btn_effect(Game.getWinnerBtnText(), 'remove');
        Game.setWinnerBtnText([]);
        Game.set_winner_bool(false);
        board = [['','',''],
        ['','',''],
        ['','','']];
        
        gameboard_btns.forEach(btn => {
            btn.children[0].textContent = '';
            btn.disabled = false;
            gsap.to(btn.firstChild, {duration: 0.3, scale: 0});
            if(btn.firstChild.classList) btn.firstChild.classList.remove('x-input');
        });

        gsap.to("#state-winner", {duration: 0.3, scale: 0});
        if(Game.getRound() % 2 === 0 && Game.getMode() === 'single_player') _AI_turn();
    }

    const _push_board_data = function(index, data) {
        let row = Math.floor(index / 3);
        let col = index - (3 * row);;
        board[row][col] = data;
        _render(gameboard_btns[index], data);
    }

    const _data_X_addClass = (btn) => {     //Change text-shadow color of X input
        if(btn.textContent === 'X') btn.classList.add('x-input')
    };

    const _player_name_add_glow = function (){
        if(Player.getPlayers().player1.getMarker() === current_marker){
            Game.glow_playername(Player.player_names[0], 'add');
            Game.glow_playername(Player.player_names[1], 'remove');
        }else{
            Game.glow_playername(Player.player_names[1], 'add');
            Game.glow_playername(Player.player_names[0], 'remove');
        }
    }

    const player_move = {
        player(btn){
            if(Game.getMode() === 'single_player'){
                player_marker = Player.getPlayers().player1.getMarker()

            }else if(Game.getMode() === 'two_player'){
                player_marker = current_marker;
                (current_marker === 'X') ? current_marker = 'O' : current_marker = 'X';
                _player_name_add_glow();
             }

            btn.firstChild.textContent = player_marker;
            _data_X_addClass(btn.firstChild);   
            _push_board_data(gameboard_btns.indexOf(btn), btn.firstChild.textContent);
            Game.check_board_data();

        },
        easy_AI(){
            setTimeout(function (){
                ai_move = Computer.easy.move(); //it will return chosen btn index and the data

                if(ai_move){
                    _push_board_data(ai_move[0], ai_move[1])
                    _data_X_addClass(gameboard_btns[ai_move[0]].firstChild);
                    Game.glow_playername(Player.player_names[1], 'remove');
                    Game.glow_playername(Player.player_names[0], 'add');
                    Game.check_board_data();
                } 
            }, 500);
        },

        hard_AI(){},
    }

    const _AI_turn = function (){
        if(!Game.have_winner()){
            Game.glow_playername(Player.player_names[1], 'add');      
            Game.glow_playername(Player.player_names[0], 'remove');
            
            if(Game.get_AI_level() === 'Easy'){
                player_move.easy_AI();
            }else if(Game.get_AI_level() === 'Unbeatable'){
                player_move.hard_AI();
            }
        }
    }

    const _players_turn = function(e){
        player_move.player(e.target);   //Player move first then
        
        if(Game.getMode() === 'single_player'){     //AI turn next if it's not 2 players mode else player turn next
            _AI_turn();
        }
    }

    const _render = function(btn,data){
        gsap.to(btn.firstChild, {duration: 0.3, scale: 1});
        btn.firstChild.textContent = data;
        btn.disabled = true;
    }

    const addEvent = function(){
        clear_gameboard.addEventListener('click', clear, false);
        gameboard_btns.forEach(btn => btn.addEventListener('click', _players_turn.bind(event),false))
    }

    return {addEvent, 
            gameboard_btns,
            clear,
            getBoard : () => board,
            getEmptyField : () => gameboard_btns.filter(btn => btn.textContent === ''),
           };
})();



const Player = (function(){
    const main_container = document.querySelector('.main-container');
    const player_names = document.querySelectorAll('.player-name');
    const player1_marker = document.querySelector('.marker-value');

    let player2_marker = 'O';
    let player1;
    let player2;
    
    const  getPlayers = () => {
        return {player1, player2};
    }

    function create_player(){
        player1 = Players('Player 1', 'X');
        player2 = Players('Computer', 'O');
        _render();
    }

    function change_player_property_value(){
        (player1_marker.textContent === 'X') ? player2_marker = 'O' : player2_marker = 'X';

        if(Game.getMode() === 'single_player'){
            player1.setMarker(player1_marker.textContent);
            player2.setName('Computer');
            player2.setMarker(player2_marker);

        }else if(Game.getMode() === 'two_player'){
            player1.setMarker('X');
            player2.setName('Player 2');
            player2.setMarker('O');
        }
        
        _render();
    }

    function _render(){
        const edit_icon_name = ' <i class="fas fa-pencil-alt"></i>';
        if(Game.getMode() === 'single_player'){
            player_names[0].innerHTML = `${player1.getName()} (${player1_marker.textContent}) ${edit_icon_name}`;
            player_names[1].innerHTML = `${player2.getName()} (${player2_marker})`;
        }else if(Game.getMode() === 'two_player'){
            player_names[0].innerHTML = `${player1.getName()} (X) ${edit_icon_name}`
            player_names[1].innerHTML = `${player2.getName()} (O) ${edit_icon_name}`;
        }
    }

    function _change_player_name(playerName, input_name_field, e){
        if(input_name_field.style.display === 'block'){
            if((e.target.classList[0] != 'player-name' && e.target.classList[0] != 'input-player-name') || e.key === 'Enter'){
                if(input_name_field.value.length >= 15){
                    alert('Player name must be less than 15 character!');
                    return;
                }
                
                input_name_field.style.display = 'none';
                playerName.style.display = 'block';
    
                if(playerName.classList[1] === 'player1-name'){
                    player1.setName(input_name_field.value);
                }else if(playerName.classList[1] === 'player2-name'){
                    player2.setName(input_name_field.value);
                }

                _render();
            }
        }
    }

    function show_edit_name_field(e){
        if(e.target.tagName === 'I') return;

        const input_fields = Array.from(document.querySelectorAll('.player > input'));
        const input_name_field = document.querySelector(`.${e.target.classList[1]} + input`);
        const playerName = e.target;
        
        //input field will not show if it's already exist and if the player name is computer
        if (input_fields.filter(input => input.style.display === 'block' || playerName.textContent.includes('Computer')).length) return;

        playerName.style.display = 'none';
        input_name_field.style.display = 'block';
        input_name_field.value = e.target.textContent.split(/ \([XO]\)/)[0];
        input_name_field.select();  //it will highlight the playername

        input_name_field.addEventListener('keyup', _change_player_name.bind(event, playerName, input_name_field), false)
        main_container.addEventListener('click', _change_player_name.bind(event, playerName, input_name_field), false);
        
    }
    return {create_player, 
            change_player_property_value, 
            show_edit_name_field, 
            player1_marker,
            player_names,
            getPlayers,
    };
})();




const Computer = (function(){
    const easy = {
        move(){
            let gameboard_btns = Gameboard.gameboard_btns;
            let empty_field_btns = Gameboard.getEmptyField();

            if(empty_field_btns.length){
                let r = Math.floor(Math.random() * empty_field_btns.length);
                let selected_empty_field = empty_field_btns[r];
                let selected_field = gameboard_btns[gameboard_btns.indexOf(selected_empty_field)].firstChild

                selected_field.textContent = Player.getPlayers().player2.getMarker();
                return [gameboard_btns.indexOf(selected_empty_field), selected_field.textContent];
            }
        }
    }

    const unbeatable = {
        move(){

        }
    }

    return {easy, unbeatable};
})();




const Game = (function(){
    const config_btns = document.querySelectorAll('.config-div > div');
    const difficulties = document.querySelector('.difficulties-value');
    const player1_score = document.querySelector('.player1-score');
    const player2_score = document.querySelector('.player2-score');
    const winner_text = document.querySelector('#state-winner');

    let winner_btn_texts = [];
    let board = [];
    let round = 1;
    let playerX_score = 0;
    let playerO_score = 0;
    let playerO_score_node;
    let playerX_score_node;
    let mode = 'single_player';
    let AI_level = 'Easy';
    let winner = false;
    let winner_player;

    let new_btns = [...Gameboard.gameboard_btns]; //copy the gameboard btns array;
    let button_text_grid = [];
    while(new_btns.length) button_text_grid.push(new_btns.splice(0,3)); //convert gameboard_btns to 2d array

    function game_config_DOM(){
        let AI_level_container = config_btns[2];
        let playAs = config_btns[1];
        if(mode === 'single_player'){
            AI_level_container.style.display = 'flex';
            playAs.style.display = 'flex';
        }else{
            AI_level_container.style.display = 'none';
            playAs.style.display = 'none';
        }
    }

    const reset = function() {
        Gameboard.clear();
        player1_score.textContent = 0;
        player2_score.textContent = 0;
        playerX_score = 0;
        playerO_score = 0;
        round=1;
        winner = false;
    }

    const glow_playername = function(text, state) {
        if(state === 'add'){
            text.classList.add('glow-active');
        }else if(state === 'remove'){
            text.classList.remove('glow-active');
        }
    }

    const _check_player_data = function(){
        if(Player.getPlayers().player1.getMarker() === 'X'){
            playerX_score_node = player1_score;
            playerO_score_node = player2_score;
        }else if(Player.getPlayers().player1.getMarker() === 'O'){
            playerX_score_node = player2_score;
            playerO_score_node = player1_score;
        }
    }

    const check_winner = function(indexes1, indexes2, indexes3, marker, player_type){
        if(winner) return;

        if(board[indexes1[0]][indexes1[1]] === marker && board[indexes2[0]][indexes2[1]] === marker && board[indexes3[0]][indexes3[1]] === marker){
            if(player_type === 'playerX'){
                playerX_score++;
                playerX_score_node.textContent = playerX_score;
            }else if(player_type === 'playerO') {
                playerO_score++;
                playerO_score_node.textContent = playerO_score;
            }

            if(Player.getPlayers().player1.getMarker() === marker){
                winner_player = Player.getPlayers().player1.getName();
            }else{
                winner_player = Player.getPlayers().player2.getName();
            }

            winner_text.textContent = `${winner_player} wins!`;
            winner = true;
            Gameboard.gameboard_btns.forEach(btn => btn.disabled=true);
            round++;

            winner_btn_texts = [button_text_grid[indexes1[0]][indexes1[1]], button_text_grid[indexes2[0]][indexes2[1]], button_text_grid[indexes3[0]][indexes3[1]]];
            winner_text_btn_effect(winner_btn_texts, 'add');
            _state_winner_effect();
        }
    }

    const winner_text_btn_effect = function(btn_texts, state){
        if(state == 'add'){
            btn_texts.forEach(btn_text => btn_text.firstChild.classList.add('winner-btn-text'));
        }else if(state == 'remove'){
            btn_texts.forEach(btn_text => btn_text.firstChild.classList.remove('winner-btn-text'));
        }
    }

    const _state_winner_effect = function() {
        gsap.to("#state-winner", {duration: 0.5, scale: 2.3});
        gsap.to("#state-winner", {duration: 1, scale: 1, delay:0.7});

        glow_playername(Player.player_names[0], 'remove');
        glow_playername(Player.player_names[1], 'remove');
    }

    const check_board_data = function() {
        board = Gameboard.getBoard();
        _check_player_data();
        //row === 'X'
        check_winner([0,0], [0,1], [0,2], 'X', 'playerX');
        check_winner([1,0], [1,1], [1,2], 'X', 'playerX');
        check_winner([2,0], [2,1], [2,2], 'X', 'playerX');

        //col === 'X'
        check_winner([0,0], [1,0], [2,0], 'X', 'playerX');
        check_winner([0,1], [1,1], [2,1], 'X', 'playerX');
        check_winner([0,2], [1,2], [2,2], 'X', 'playerX');

        //diagonal(X) === 'X'
        check_winner([0,2], [1,1],[2,0], 'X', 'playerX');
        check_winner([0,0],[1,1],[2,2], 'X', 'playerX');


        //row === 'O'
        check_winner([0,0], [0,1], [0,2], 'O', 'playerO');
        check_winner([1,0], [1,1], [1,2], 'O', 'playerO');
        check_winner([2,0], [2,1], [2,2], 'O', 'playerO');

        //col === 'O'
        check_winner([0,0], [1,0], [2,0], 'O', 'playerO');
        check_winner([0,1], [1,1], [2,1], 'O', 'playerO');
        check_winner([0,2], [1,2], [2,2], 'O', 'playerO');

        //diagonal(X) === 'O'
        check_winner([0,2], [1,1],[2,0], 'O', 'playerO');
        check_winner([0,0],[1,1],[2,2], 'O', 'playerO');

        if(!Gameboard.getEmptyField().length && !winner){
            winner_text.textContent = "It's a tie!";
            round++;
            _state_winner_effect();
        }
    }

    const button_event = {
        change_mode(){
            const single_player = document.querySelector('.single-player');
            const two_player = document.querySelector('.two-player');
            const mode_container = document.querySelector('.mode');

            if(single_player.style.display === 'block' || single_player.style.display === ''){
                single_player.style.display = 'none';
                two_player.style.display = 'block';
                mode_container.style.gridColumn = '1/4'
                mode = 'two_player';
            }else{
                single_player.style.display = 'block';
                two_player.style.display = 'none';
                mode_container.style.gridColumn = '1/2'
                mode = 'single_player';
            }
            reset();
            game_config_DOM();
            Player.change_player_property_value();
        },
        change_marker(){
            (Player.player1_marker.textContent === 'X') ? Player.player1_marker.textContent = 'O' : Player.player1_marker.textContent = 'X';
            reset();
            Player.change_player_property_value();
        },
        change_difficulties(){
            (difficulties.textContent === 'Easy') ? difficulties.textContent = 'Unbeatable' : difficulties.textContent = 'Easy';
            reset();
            AI_level = difficulties.textContent;
        },
    }

    const addEvent = function(){
        Gameboard.addEvent();
        config_btns[0].addEventListener('click', button_event.change_mode, false);
        config_btns[1].addEventListener('click', button_event.change_marker, false);
        config_btns[2].addEventListener('click', button_event.change_difficulties, false);
        Player.player_names.forEach(names => names.addEventListener('click', Player.show_edit_name_field.bind(event), false));
    }

    return {addEvent, 
            check_board_data,
            glow_playername,
            winner_text_btn_effect,
            getMode : () => mode,
            get_AI_level : () => AI_level,
            set_winner_bool : (bool) => winner = bool,
            have_winner : () => winner,
            getRound : () => round,
            getWinnerBtnText : () => winner_btn_texts,
            setWinnerBtnText : (newTexts) => winner_btn_texts = newTexts,
    }
})();

function startGame(){
    Player.create_player();
    Game.glow_playername(Player.player_names[0], 'add');
    Game.addEvent();
}

startGame();