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
            btn.firstChild.textContent = '';
            btn.disabled = false;
            gsap.to(btn.firstChild, {duration: 0.3, scale: 0});
            if(btn.firstChild.classList) btn.firstChild.classList.remove('x-input');
        });

        gsap.to("#state-winner", {duration: 0.3, scale: 0});
        if(Game.getRound() % 2 === 0 && Game.getMode() === 'single_player') _AI_turn();
    }

    const push_board_data = function(index, data) {
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
            push_board_data(gameboard_btns.indexOf(btn), btn.firstChild.textContent);
            Game.check_board_data();

        },
        AI(){
            setTimeout(function (){
                let level = Game.get_AI_level();
                (level === 'Easy') ? [ai_chosen_index, ai_current_marker] = Computer.easy.move() : [ai_chosen_index, ai_current_marker] = Computer.unbeatable.move();

                if(ai_chosen_index || ai_chosen_index === 0){
                    //It will not execute if there's no available empty field for computer move.
                    push_board_data(ai_chosen_index, ai_current_marker)
                    _data_X_addClass(gameboard_btns[ai_chosen_index].firstChild);
                    Game.glow_playername(Player.player_names[1], 'remove');
                    Game.glow_playername(Player.player_names[0], 'add');
                    Game.check_board_data();
                } 
            }, 500);
        },
    }

    const _AI_turn = function(){
        if(!Game.state_winner(board)){
            Game.glow_playername(Player.player_names[1], 'add');      
            Game.glow_playername(Player.player_names[0], 'remove');
            
            player_move.AI();
        }
    }

    const _players_turn = function(e){
        player_move.player(e.target);   //Player1 move first then
        
        if(Game.getMode() === 'single_player'){     //AI turn next if it's not 2 players mode else player2 turn next
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
        gameboard_btns.forEach(btn => btn.addEventListener('click', _players_turn.bind(event),false));
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

    function _change_player_name(playerName, input_name_field, e){  //It will invoke if the player click the elements in main div including itself or player press enter on input field
        if(input_name_field.style.display === 'block'){
            //if the player clicks on the other playername or on the input field, the value of input field will not set
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

    function show_edit_name_field(e){   //It will invoke if the player click the playername
        if(e.target.tagName === 'I') return;    //If the player clicks on the pencil icon on playername, the input field will not show.

        const input_fields = Array.from(document.querySelectorAll('.player > input'));
        const input_name_field = document.querySelector(`.${e.target.classList[1]} + input`);
        const playerName = e.target;
        
        //input field will not show if it's already exist and if the player name is computer
        if (input_fields.filter(input => input.style.display === 'block' || playerName.textContent.includes('Computer')).length) return;

        playerName.style.display = 'none';
        input_name_field.style.display = 'block';
        input_name_field.value = e.target.textContent.split(/ \([XO]\)/)[0];    //default value of input field is playername excluding (X) or (O) 
        input_name_field.select();  //it will highlight automatically the value of input field after you click the playername

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
    Xscores = {     //Minimax: scores if computer playing as X
        X : 1,
        O: -1,
        Tie: 0
    }

    Oscores = {     //Minimax: scores if computer playing as O
        X : -1,
        O : 1,
        Tie: 0
    }

    function minimax(board, depth, isMaximizing){
        result = Game.state_winner(board, test=true);
        if(result != null){ //The code inside of this statement will execute if there's a temporary winner or tie game in the minimax
            if(Player.getPlayers().player2.getMarker() === 'X'){
                return Xscores[result];
            }
            return Oscores[result];
        }

        if(isMaximizing){
            //It will execute if the current turn is the computer
            let marker = Player.getPlayers().player2.getMarker();
            let bestScore = -Infinity;

            for(let i = 0; i <3; i++){
                for(let j = 0; j < 3; j++){
                    if(board[i][j] == ''){
                        board[i][j] = marker;
                        let score = minimax(board, depth + 1, false);
                        board[i][j] = '';

                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        }else{
            //It will execute if the current turn is the human
            let marker = Player.getPlayers().player1.getMarker();
            let bestScore = Infinity;

            for(let i = 0; i <3; i++){
                for(let j = 0; j < 3; j++){
                    if(board[i][j] == ''){
                        board[i][j] = marker;
                        let score = minimax(board, depth + 1, true);
                        board[i][j] = '';

                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }

    }


    const easy = {
        move(){
            let gameboard_btns = Gameboard.gameboard_btns;
            let empty_field_btns = Gameboard.getEmptyField();

            if(empty_field_btns.length){
                //it will execute if there's available space to move for computer
                let r = Math.floor(Math.random() * empty_field_btns.length);
                let selected_empty_field = empty_field_btns[r];
                let selected_field = gameboard_btns[gameboard_btns.indexOf(selected_empty_field)].firstChild

                selected_field.textContent = Player.getPlayers().player2.getMarker();
                Gameboard.push_board_data
                return [gameboard_btns.indexOf(selected_empty_field), selected_field.textContent];
            }
        }
    }

    const unbeatable = {
        move(){
            let board = Gameboard.getBoard();
            let bestMove;
            let player2marker = Player.getPlayers().player2.getMarker();
            let bestScore = -Infinity;

            for(let i = 0; i <3; i++){//loop all field on the current board
                for(let j = 0; j < 3; j++){
                    if(board[i][j] == ''){  //check the current field if it's empty
                        board[i][j] = player2marker;    //if it is, set temporarily the player2 marker to this empty field, this current board will be a root node
                        let score = minimax(board, 0, false); // then it will checks the other empty field or child nodes of this current board and get the best score usiong minimax
                        board[i][j] = ''; //undo the set marker on this field

                        if(score > bestScore){  // if the current score from the minimax is higher than the best score then
                            bestScore = score; // this current field of the board is the best move for computer
                            bestMove = {i , j}
                        }
                    }
                }
            }

            let empty_selected_field = Game.getButtonTextGrid()[bestMove.i][bestMove.j]; 
            return [Gameboard.gameboard_btns.indexOf(empty_selected_field), player2marker];
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
    let round = 1;
    let score1 = 0;
    let score2 = 0;
    let mode = 'single_player';
    let AI_level = 'Easy';
    let winner = false;
    let winner_player;

    let new_btns = [...Gameboard.gameboard_btns]; //copy the gameboard btns array;
    let button_text_grid = [];
    while(new_btns.length) button_text_grid.push(new_btns.splice(0,3)); //convert 1D gameboard_btns array to 2d array

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
        score1 = 0;
        score2 = 0;
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

    const isValidPlays = function (a,b,c){
        if(a === b && b === c && a != ''){
            return true;
        }return false;
    }

    const state_winner = function(board, test=false){
        for(let i = 0; i < 3; i++){     //row;
            if(isValidPlays(board[i][0], board[i][1], board[i][2])){
                winner_btn_texts = [button_text_grid[i][0], button_text_grid[i][1], button_text_grid[i][2]];
                add_winner_text_btn_effect(winner_btn_texts, test);
                return board[i][0];
            }
        }

        for(let i = 0; i < 3; i++){     //column;
            if(isValidPlays(board[0][i] , board[1][i] , board[2][i])){
                winner_btn_texts = [button_text_grid[0][i], button_text_grid[1][i], button_text_grid[2][i]];
                add_winner_text_btn_effect(winner_btn_texts, test);
                return board[0][i];
            }
        }

        //DIAGONAL
        if(isValidPlays(board[0][0] , board[1][1] , board[2][2])){
            winner_btn_texts = [button_text_grid[0][0], button_text_grid[1][1], button_text_grid[2][2]];
            add_winner_text_btn_effect(winner_btn_texts, test);
            return board[0][0];
        }
        
        if(isValidPlays(board[0][2] , board[1][1] , board[2][0])){
            winner_btn_texts = [button_text_grid[0][2], button_text_grid[1][1], button_text_grid[2][0]];
            add_winner_text_btn_effect(winner_btn_texts, test);
            return board[0][2];
        }

        let empty = 0;
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(board[i][j] === '') empty++;
            }
        }

        if(empty === 0 && !winner) return 'Tie';

        return null;
    }

    const display_winner = function(){
        let winner_markerX = state_winner(Gameboard.getBoard());
        let player1_marker = Player.getPlayers().player1.getMarker();
        let player2_marker = Player.getPlayers().player2.getMarker();

        if(winner_markerX === null) return;

        if(winner_markerX === player1_marker){
            winner_player = Player.getPlayers().player1;
            score1++;
            player1_score.textContent = score1;

        }else if(winner_markerX === player2_marker){
            winner_player = Player.getPlayers().player2;
            score2++;
            player2_score.textContent = score2;

        }else if(winner_markerX === 'Tie'){
            winner_text.textContent = "It's a tie!";
            round++;
            _state_winner_effect();
            return;
        }

        winner_text.textContent = `${winner_player.getName()} wins!`;
        winner = true;
        Gameboard.gameboard_btns.forEach(btn => btn.disabled=true);
        round++;
        _state_winner_effect();
    }

    const winner_text_btn_effect = function(btn_texts, state){
        if(state == 'add'){
            btn_texts.forEach(btn_text => btn_text.firstChild.classList.add('winner-btn-text'));

        }else if(state == 'remove'){
            btn_texts.forEach(btn_text => btn_text.firstChild.classList.remove('winner-btn-text'));
        }
    }

    const add_winner_text_btn_effect = function(datas, test=false){
        if(!test){
            winner_text_btn_effect(datas, 'add');
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
        display_winner();
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

            game_config_DOM();
            Player.change_player_property_value();
            reset();
        },
        change_marker(){
            (Player.player1_marker.textContent === 'X') ? Player.player1_marker.textContent = 'O' : Player.player1_marker.textContent = 'X';
            Player.change_player_property_value();
            reset();
        },
        change_difficulties(){
            (difficulties.textContent === 'Easy') ? difficulties.textContent = 'Expert' : difficulties.textContent = 'Easy';
            AI_level = difficulties.textContent;
            reset();
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
            state_winner,
            getButtonTextGrid : () => button_text_grid,
            getMode : () => mode,
            get_AI_level : () => AI_level,
            set_winner_bool : (bool) => winner = bool,
            have_winner : () => winner,
            getRound : () => round,
            getWinnerBtnText : () => winner_btn_texts,
            setWinnerBtnText : (newTexts) => winner_btn_texts = newTexts,
    }
})();

function init(){
    Player.create_player();
    Game.glow_playername(Player.player_names[0], 'add');
    Game.addEvent();
}

init();