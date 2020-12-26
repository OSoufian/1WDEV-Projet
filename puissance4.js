var board ;
var game ;
var board_context;   
var game_context ;
var grid;

var cell ;
var half_cell ;
var player ;
var color;

var rows;
var columns;
var selected_column;
var end_game;
var positions;
var drop_in_progress;

var color_player_1 = 'yellow';
var color_player_2 = 'red';
var color_board = 'LightSkyBlue';

var turn = 0;
var score_player_1 = 0;
var score_player_2 = 0;

class Position{
    constructor(row, column){
        this.row = row;
        this.column = column;
    }
}

function new_game(p_rows, p_columns){

    board = document.getElementById("board");
    game = document.getElementById("game");
    board_context = board.getContext('2d');   
    game_context = game.getContext('2d');

    timer_id = setInterval(timer_click, 1000);
    timer_time = Date.now()

    cell = 100;
    half_cell = cell / 2;    
    player = 1;
    color=color_player_1;
    
    rows = p_rows + 1; // Ligne invisible qui permet de montrer où l'on va poser le pion
    columns = p_columns;
    selected_column = 0;
    positions= [];
    
    grid = new Array();
    for(let row = 0; row < rows; row +=1){
        grid[row] = new Array(columns).fill(0);
    }
   
    board.height = cell * rows;
    board.width = cell * columns;
    game.height = cell * rows;
    game.width = cell * columns;

    //Affichage du plateau
    board_context.fillStyle = color_board ;
    board_context.fillRect(0, cell, board.width, board.height);
    board_context.fill();
    
    for (let row = 1; row <= rows ; row += 1){
        for (let column = 0; column <= columns ; column += 1){
            board_context.globalCompositeOperation = 'destination-out';
            show_circle(column * cell + half_cell, row * cell + half_cell,'white')
        }
    }

    board_context.globalCompositeOperation = 'source-over';
    board.addEventListener('click', on_mouse_click);
    board.addEventListener('mousemove', on_mouse_move);
    document.addEventListener('keydown', on_key_down);
}


//Affichage emplacement pions
function show_circle(x, y , fill){
    board_context.globalCompositeOperation = 'destination-out';
    board_context.arc(x, y, 35, 0, Math.PI * 2, true);
    board_context.fillStyle = fill;
    board_context.fill();
    board_context.closePath();
}

// Déterminer la position de la souris sur le board
function get_mouse_position(event){
    var mouse_x = event.offsetX * board.width / board.clientWidth;
    var mouse_y = event.offsetY * board.height / board.clientHeight;
    return{
        x: mouse_x,
        y: mouse_y 
    };
}

// Fonction évenement clique de la souris
function on_mouse_click(event){
       //mouse_position = get_mouse_position(event);
    drop_pawn();
}

function drop_pawn(){
    board_context.beginPath();
    board_context.fillStyle = 'white';
    board_context.fillRect(0, 0, cell * columns, cell);
    board_context.stroke();

    if(drop_in_progress) return;
    end_game = true;
    if (grid[1][selected_column] == 0){
        end_game = false;
        var top_cell = add_pawn(selected_column);   
        animate_drop_pawn(selected_column * cell + half_cell, half_cell, top_cell * cell + half_cell);
    }   
}

function on_key_down(event)
{
    switch(event.code){
        case "ArrowLeft":
            selected_column -= 1;
            if(selected_column < 1) selected_column = 0;
            if(drop_in_progress) return;
            place_pawn();
            break;
        case "ArrowRight":
            selected_column += 1;
            if(selected_column >= columns) selected_column = columns - 1;
            if(drop_in_progress) return;
            place_pawn();
            break;
        case "ArrowDown":
            drop_pawn();             
            break;            
    }

}

// Ajout d'un nouveau pion dans la colonne
function add_pawn(column){
    var row = rows - 1;
    while(row >= 0 && grid[row][column] != 0){
        row -= 1;
    }
    if(row < 0) return;
    grid[row][column] = player;
    return row;
}

// Changer de joueur
//todo player_change to change_player 
function change_player(){
    turn += 1;
    if(player == 1){  
        player=2;
        color=color_player_2;
    }else{        
        player=1;
        color=color_player_1;
    }
}

// Animation de la chute du pion
function animate_drop_pawn(x, y, max_y){
    drop_in_progress = true;
    game_context.clearRect(x - half_cell, 0, cell, max_y);
    game_context.beginPath();
    game_context.arc(x, y , 35, 0, Math.PI * 2);
    game_context.fillStyle = color;
    game_context.fill();
    game_context.stroke();
    
    if (y < max_y) {
        y += 5;
        //setTimeout('fall_pawn(' + x + ',' + y + ', ' + max_y + ')', 1);
        //setTimeout(() => {fall_pawn(x,y,max_y ); }, 1);
        setTimeout(animate_drop_pawn,5,x,y,max_y);
    } 
    else 
    {
        check_state();      
        drop_in_progress = false;
    }
}

function message_winner(win){
    var message = win ? "Le joueur " + player + " a gagné" : "Match nul";
    alert(message);
    
}

// Affichage du pion avant la chute
function on_mouse_move(event){
    var mouse_position = get_mouse_position(event);  
    selected_column = parseInt(mouse_position.x/cell);
    if(drop_in_progress) return;
    place_pawn();
}

function place_pawn(){
    board_context.beginPath();
    board_context.fillStyle = 'white';
    board_context.fillRect(0, 0, cell * columns, cell);
    board_context.stroke();

    board_context.beginPath();
    board_context.strokeStyle = 'white';
    board_context.arc(selected_column * cell + half_cell, half_cell, 35, 0, Math.PI * 2, true);
    board_context.fillStyle = color;
    board_context.lineWidth = 0;
    board_context.fill();
    board_context.stroke();
}

// Tester si il y a un gagnant
function check_state(){
    var state = 0;
    if (end_game == true) state = 3;
    else if (check_rows() || check_columns() || check_diagonal_ne() || check_diagonal_nw()) state = player;
    refresh_ui(state);
}


function refresh_ui(state){
    switch (state){
        case 0:
            change_player();   
            place_pawn();       
            break;
        case 1:
        case 2:
            update_player_score(true);
            clearInterval(timer_id);
            show_winner_pawns();
            setTimeout(() => {message_winner(true);}, 1000); 
            break;
        case 3:
            update_player_score(false);
            clearInterval(timer_id)
            setTimeout(() => {message_winner(false);}, 1000); 
            break;
    }
}


// Renvoie le nombre de pions consécutifs du même joueur
function count_pawns(row, column, d_row, d_column){
    if (row < 1 || row >= rows || column < 0 || column >= columns) return;
    if (grid[row][column] == player){
        positions.push(new Position(row, column));       
    }
    else if(positions.length < 4)
    {        
        positions.length = 0;
    }
    count_pawns(row + d_row, column + d_column, d_row, d_column);
}

function check_rows(){
    for (let row = rows - 1; row >= 1; row -= 1){       
        positions.length = 0;
        count_pawns(row, 0, 0, 1);
        if (positions.length >= 4) return true;
    }
    return false;
}

function check_columns(){
    for (let column = 0; column < columns - 1; column += 1){    
        positions.length = 0;
        count_pawns(rows - 1, column, -1, 0);
        if (positions.length >= 4) return true;

    }
    return false;
}

function check_diagonal_ne(){
    for (let row = rows - 4; row >= 1; row -= 1){       
        positions.length = 0;
        count_pawns(row, 0, 1, 1);
        if (positions.length >= 4) return true;    
    }
    
    for(let column = columns -4;column >=1 ; column -= 1){
        positions.length = 0;
        count_pawns(1, column, 1, 1);
        if (positions.length >= 4) return true;    
    }
    return false;
}

function check_diagonal_nw(){
    for (let row = rows - 4; row >= 1; row -= 1){       
        positions.length = 0;
        count_pawns(row, columns-1, 1, -1);
        if (positions.length >= 4) return true;    
    }
    for (let column = columns - 2; column >= 3; column -= 1){       
        positions.length = 0;
        count_pawns(1, column, 1, -1);
        if (positions.length >= 4) return true;    
    }
    return false;
}

function show_winner_pawns(){
    positions.forEach(function(p){
        board_context.beginPath();
        board_context.arc(p.column*cell + half_cell, p.row*cell + half_cell, 35, 0, Math.PI * 2, true);
        board_context.lineWidth = 5;
        board_context.strokeStyle = 'green';
        board_context.fillStyle = color;
        board_context.fill();
        board_context.stroke();
        board_context.closePath();
    });
    
}

//Chronomètrage de la partie
function timer_click(){
    var elapsed = Date.now() - timer_time;
    //todo Date(elapsed).toISOString().slice(11, -5)
}



function update_player_score(winner){
    if(winner){
        var score = 100 + columns * rows - turn ;
        if(player == 1) score_player_1 += score;
        else score_player_2 += score;       
    }
    else
    {
        score_player_1 += 50;
        score_player_2 += 50;  
    }
    //todo integration
    //Affichage des scores
}
