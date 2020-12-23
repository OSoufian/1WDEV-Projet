var board = document.getElementById("board");
var game = document.getElementById("game");
var board_context = board.getContext('2d');   
var game_context = game.getContext('2d');
var grid;

var cell = 100;
var half_cell = cell / 2;
var player = 0;
var color

var rows;
var columns;
var end_game;

class Position{
    constructor(row, column){
        this.row = row;
        this.column = column;
    }
}

function new_game(p_rows, p_columns){
    rows = p_rows + 1; // Ligne invisible qui permet de montrer où l'on va poser le pion
    columns = p_columns;
    end_game = rows * columns;
    
    grid = [];
    for(var j = 0; j < columns; j++){
        grid[j] = new Array(rows);
    }

    board.height = cell * rows;
    board.width = cell * columns;
    game.height = cell * rows;
    game.width = cell * columns;

    //Affichage du plateau
    board_context.fillStyle = 'blue';
    board_context.fillRect(0, cell, board.width, board.height);
    board_context.stroke();
    
    for (var x = 0; x <= (rows * cell); x += cell){
        for (var y = cell; y <= (columns * cell); y += cell){
            create_circle(x + half_cell, y + half_cell, 35)
        }
    }

    board_context.globalCompositeOperation = 'source-over';

    board.addEventListener('click', mouse_click);
}

//Affichage emplacement pions
function create_circle(x, y, radius){
    board_context.globalCompositeOperation = 'destination-out';
    board_context.arc(x, y, radius, 0, Math.PI * 2, true);
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
function mouse_click(event){
    end_game -= 1;
    board_context.beginPath();
    board_context.fillStyle = 'white';
    board_context.fillRect(0, 0, cell * columns, cell);
    board_context.stroke();
    var mouse_position = get_mouse_position(event);

    for (var j = 0; j < board.width; j += cell){
        if (mouse_position.x > j && mouse_position.x < j + cell){
            if (grid[0][j / cell] != undefined) break;
            player_change();
            var top_y = add_pawn(j / cell) + 1;  
            enable_board_click(false);          
            fall_pawn(j + half_cell, half_cell, top_y * cell + half_cell);           

            switch (check_state()){
                case 0:
                    enable_board_click(true);
                    break;
                case 1:
                case 2:
                    show_winner_pawns();                   
                    break;
                case 3:
                    alert("Et c'est une égalité !");
                    break;
            }
        }
    }
}

function enable_board_click(enabled){
    if (enabled){
        setTimeout(function(){
            board.style.pointerEvents = 'auto';
        }, 500);
    }
    else{
        board.style.pointerEvents = 'none';
    }
}


// Ajout d'un nouveau pion dans la colonne
function add_pawn(column){
    var row = rows - 2;
    while(row >= 0 && grid[row][column] != undefined){
        row -= 1;
    }
    if(row < 0) return;
    grid[row][column] = player;
    return row;
}

// Changer de joueur
function player_change(){
   switch(player){
        case 0:
        case 2:
            player=1;
            color='yellow';
            break;
        case 1:
            player=2;
            color='red';
    }   
}


// Animation de la chute du pion
function fall_pawn(x, y, max_y){
    game_context.clearRect(x - half_cell, 0, cell, max_y);
    game_context.beginPath();
    game_context.arc(x, y , 35, 0, Math.PI * 2);
    game_context.strokeStyle = 'white';
    game_context.fillStyle = color;
    game_context.fill();
    game_context.stroke();
    if (y != max_y) {
        y += 10;
        //setTimeout('fall_pawn(' + x + ',' + y + ', ' + max_y + ')', 1);
        //setTimeout(() => {fall_pawn(x,y,max_y ); }, 1);
        setTimeout(fall_pawn,1,x,y,max_y);

    }
    return;
}

// Animation du pion avant la chute
function place_pawn(event){
    color = (player == 1 ? 'red' : 'yellow');
    var mouse_position = get_mouse_position(event);
    var x = parseInt(mouse_position.x/cell);

    board_context.beginPath();
    board_context.fillStyle = 'white';
    board_context.fillRect(0, 0, cell * columns, cell);
    board_context.stroke();

    board_context.beginPath();
    board_context.strokeStyle = 'white';
    board_context.arc(x * cell + half_cell, half_cell, 35, 0, Math.PI * 2, true);
    board_context.fillStyle = color;
    board_context.lineWidth = 0;
    board_context.fill();
    board_context.stroke();
}

// Tester si il y a un gagnant
function check_state(){
    if (end_game == 0) return 3;
    if (check_rows() || check_columns()) return player;
    return 0;
}

var count = 0;
var positions = [];

// Renvoie le nombre de pions consécutifs du même joueur
function count_pawns(i, j, delta_i, delta_j){
    if (i < 1 || i >= rows || j < 0 || j >= columns) return;
    if (grid[i][j] == player){
        positions.push(new Position(i, j));
        count += 1;
        if (count == 4) return;
    }
    else{
        count = 0;
        positions.length = 0;
    }
    count_pawns(i + delta_i, j + delta_j, delta_i, delta_j);
}

function check_rows(){
    for (let i = 1; i < rows - 1; i++){
        count = 0;
        positions.length = 0;
        count_pawns(i, 0, 0, 1);
        if (count == 4) return true;
    }
    return false;
}

function check_columns(){
    for (let j = 0; j < columns - 1; i++){
        count = 0;
        positions.length = 0;
        count_pawns(rows - 1, j, -1, 0);
        if (count == 4) return true;
        return false;
    }
}

function show_winner_pawns(){
    positions.forEach(function(p){
        board_context.beginPath();
        board_context.arc(p.i*cell + half_cell, p.j*cell + half_cell, 35, 0, Math.PI * 2, true);
        board_context.lineWidth = 5;
        board_context.strokeStyle = 'green';
        board_context.fillStyle = color;
        board_context.fill();
        board_context.stroke();
        board_context.closePath();
    });
}
