var board = document.getElementById("board");
var game = document.getElementById("game");
var board_context = board.getContext('2d');   
var game_context = game.getContext('2d');
var grid;

var cell = 100;
var half_cell = cell / 2;
var player = 2;
var color;

var rows;
var columns;

function new_game(p_rows, p_columns){
    rows = p_rows + 1; // Ligne invisible qui permet de montrer où l'on va poser le pion
    columns = p_columns; 
    
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
    var mouse_y = event.offsetY * board.height / board.clientHeigh;
    return{
        x: mouse_x,
        y: mouse_y 
    };
}

// Fonction évenement clique de la souris
function mouse_click(event){
    board_context.beginPath();
    board_context.fillStyle = 'white';
    board_context.fillRect(0, 0, cell * columns, cell);
    board_context.stroke();
    var mouse_position = get_mouse_position(event);

    for (var j = 0; j < board.width; j += cell){
        if (mouse_position.x > j && mouse_position.x < j + cell){
            if (grid[0][j / cell] != undefined) break;
            var top_y = column_fill(j / 100) + 1;
            player_change();
            fall_pawn(j + half_cell, half_cell, top_y * cell + half_cell);
            board.style.pointerEvents = 'none';
            if (!check_winner(j / 100, top_y - 1)){
                setTimeout(function(){
                    board.style.pointerEvents = 'auto';
                }, 500);
            } else {

            }
        }
    }
}

function column_fill(column){
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
    if(player == 1){
        player = 2;
        color = 'red';
    }else{
        player = 1;
        color = 'yellow';
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
function check_winner(i, j){

}

// Renvoie le nombre de pions consécutifs du même joueur
function count_pawn(i, j, max_i, max_j, delta_i, delta_j, player){
    if (i == max_i || j == max_j) return 0;
    if (grid[i][j] != player) return 0;
    return 1 + count_pawn(i + delta_i, j + delta_j, max_i, max_j, delta_i, delta_j, player);
}
