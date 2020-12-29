//  Déclaration de toutes les variables globales
var board ;
var game ;
var board_context;   
var game_context ;
var grid;
var cell ;
var half_cell ;
var rows;
var columns;
var selected_column;

var end_game;
var positions;
var drop_in_progress;
var beep;
var timer;

var player ;
var color;
var color_player_1 = 'yellow';
var color_player_2 = 'red';
var color_board = 'LightSkyBlue';

var turn = 0;
var score_player_1 = 0;
var score_player_2 = 0;



//  Création d'une classe Position
class Position{
    constructor(row, column){
        this.row = row;
        this.column = column;
    }
}

// Fonction appelé au chargement de la page de jeu avant d'avoir la bonne taille de plateau
function load_game(){
    var param = window.location.search.substring(1);
    switch(param)
    {
        case "classic":
            new_game(6,7);
            break;
        case "maxi":
            new_game(7,8);
            break;
        case "mini":
            new_game(5,6);
            break;
    }
}


// Initialisation et d'affichage la grille
function new_game(p_rows, p_columns){
    board = document.getElementById("board");
    game = document.getElementById("game");
    board_context = board.getContext('2d');   
    game_context = game.getContext('2d');
    timer = document.getElementById("timer");
    document.getElementById("player1-score").innerHTML = score_player_1;
    document.getElementById("player2-score").innerHTML = score_player_2;
    
    timer.innerHTML = "00:00:00";

    // Musique en cas de victoire (musique libre de droit)
    beep = new Audio("sounds/beep.mp3");
    // Musique plus fun (mais pas les droits)
    // beep = new Audio("sounds/beep2.mp3");

    

    // Appel de la fonction qui nous donne le temps toutes les secondes (ce qui va permettre d'afficher les secondes en temps réels)
    timer_id = setInterval(timer_click, 1000);
    timer_time = Date.now()

    end_game=false;
    rows = p_rows + 1; // On rajoute 1 car il y a une ligne invisible qui montre où se situe le pion avant de le poser
    columns = p_columns;
    selected_column = 0;
    positions= [];
   

    cell = 80;
    half_cell =  40;    

    player = 1;
    color=color_player_1;
    
    grid = new Array();
    for(let row = 0; row < rows; row +=1){
        grid[row] = new Array(columns).fill(0);
    }
   
    board.height = cell * rows;
    board.width = cell * columns;
    game.height = cell * rows;
    game.width = cell * columns;    

    //Affichage du plateau
    clear_place_pawn();
    board_context.fillStyle = color_board;
    board_context.fillRect(0, cell, board.width, board.height);
    board_context.fill();    
    for (let row = 1; row <= rows ; row += 1){
        for (let column = 0; column <= columns ; column += 1){
            board_context.globalCompositeOperation = 'destination-out';
            show_circle(column * cell + half_cell, row * cell + half_cell,'white')
        }
    }
    board_context.globalCompositeOperation = 'source-over';

    // Appel des différentes fonctions selon si on clique, bouge la souris, ou appuie sur les touches du clavier
    board.addEventListener('click', on_mouse_click);
    board.addEventListener('mousemove', on_mouse_move);
    document.addEventListener('keydown', on_key_down);
}

// Cette fonction permet de savoir le temps écoulé depuis le début de la partie, en minutes et en secondes
function timer_click(){
    var elapsed = new Date(Date.now() - timer_time).toISOString().slice(11, -5);
    timer.innerHTML = elapsed;
}



// Affichage des emplacements des pions
function show_circle(x, y , fill){
    board_context.globalCompositeOperation = 'destination-out';
    board_context.arc(x, y, 35, 0, Math.PI * 2, true);
    board_context.fillStyle = fill;
    board_context.fill();
    board_context.closePath();
}

// Déterminer la position de la souris sur le plateau, renvoie les coordonées x et y de l'emplacement de la souris
function get_mouse_position(event){
    var mouse_x = event.offsetX * board.width / board.clientWidth;
    var mouse_y = event.offsetY * board.height / board.clientHeight;
    return{
        x: mouse_x,
        y: mouse_y 
    };
}

// Afficher le pion dans la bonne colonne selon la position de la souris
function on_mouse_move(event){
    if(end_game) return;
    var mouse_position = get_mouse_position(event);  
    selected_column = parseInt(mouse_position.x/cell);
    if(drop_in_progress) return;
    place_pawn();
}


// Permettre la chute du pion au clique de la souris
function on_mouse_click(){
    if(end_game) return;
    drop_pawn();
}

// Fonction pour la chute du pion
function drop_pawn(){
    clear_place_pawn();
    if(drop_in_progress) return;
    end_game = true;
    if (grid[1][selected_column] == 0){
        end_game = false;
        var top_cell = add_pawn(selected_column);   
        animate_drop_pawn(selected_column * cell + half_cell, half_cell, top_cell * cell + half_cell);
    }
    else{
        end_game = false;
        place_pawn();
    }
}

// Permettre de pouvoir jouer avec le clavier
function on_key_down(event){
    if(end_game) return;
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

// Ajout d'un nouveau pion dans une colonne, elle retournera la dernière ligne de libre
function add_pawn(column){
    var row = rows - 1;
    while(row >= 0 && grid[row][column] != 0){
        row -= 1;
    }
    if(row < 0) return;
    grid[row][column] = player;
    return row;
}

// Changer de joueur à chaque tour
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
    
    if (y < max_y){
        y += 10;
        setTimeout(animate_drop_pawn,5,x,y,max_y);
    }else{
        check_state();      
        drop_in_progress = false;
    }
}

// Affichage du message
function show_message_winner(win){
    beep.play();
    var message = win ? "Le joueur " + player + " a gagné !" : "Match nul !";
    message += "\nVoulez-vous rejouer une partie ?"
    if(confirm(message))new_game(rows -1,columns);        
    else location.href = "puissance4.html";      
        
}

// Effacer la zone au dessus du plateau afin que les pions ne restent pas affichés
function clear_place_pawn()
{
    board_context.beginPath();
    board_context.fillStyle = 'LightSkyBlue';
    board_context.fillRect(0, 0, cell * columns, cell);
    board_context.stroke();
}

// Affichage du pion avant la chute
function place_pawn(){
    if(end_game) return;
    clear_place_pawn();    
    board_context.beginPath();
    board_context.strokeStyle = 'black';
    board_context.arc(selected_column * cell + half_cell, half_cell, 35, 0, Math.PI * 2, true);
    board_context.fillStyle = color;
    board_context.lineWidth = 0;
    board_context.fill();
    board_context.stroke();
}

// Déterminer l'état de la partie (savoir si le jeu continue, s'il y a un un gagnant ou un match nul)
function check_state(){
    var state = 0;
    if (is_board_complete()) state = 3;
    else if (check_rows() || check_columns() || check_diagonal_ne() || check_diagonal_nw()) state = player;
    refresh_ui(state);
}


// Savoir si la grille est remplie de pions
function is_board_complete(){
    for (let row = 1; row < rows; row++){
        for (let column = 0; column < columns; column++){
            if (grid[row][column]==0) return false;
        }
    }
    return true;
}


// Selon l'état de la partie, appel de toutes les fonctions à réaliser
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
            setTimeout(() => {show_message_winner(true);}, 100);            
            end_game=true;
            break;
        case 3:
            update_player_score(false);
            clearInterval(timer_id)
            setTimeout(() => {show_message_winner(false);}, 100);            
            end_game=true;
            break;
    }
}


// Permet de compter les pions consécutifs d'un joueur et de récupérer leurs positions
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


// Vérification s'il y a 4 pions consécutifs sur les lignes
function check_rows(){
    for (let row = rows - 1; row >= 1; row -= 1){       
        positions.length = 0;
        count_pawns(row, 0, 0, 1);
        if (positions.length >= 4) return true;
    }
    return false;
}


// Vérification s'il y a 4 pions consécutifs sur les colonnes
function check_columns(){
    for (let column = 0; column < columns; column += 1){    
        positions.length = 0;
        count_pawns(rows - 1, column, -1, 0);
        if (positions.length >= 4) return true;
    }
    return false;
}

// Vérification s'il y a 4 pions consécutifs sur la diagonale commençant en haut à droite vers en bas à gauche
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


// Vérification s'il y a 4 pions consécutifs sur la diagonale commençant en haut à gauche vers en bas à droite
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

// Mettre les pions gagnants en évidence
function show_winner_pawns(){
    clear_place_pawn();
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


// Ajouter des points au gagnant ou aux deux joueurs si match nul
function update_player_score(winner){
    if(winner){
        var bonus = (columns * rows - turn) * 2  // Ajout d'un bonus selon le nombre de déplacement restant
        var score = 100 + bonus ;
        if(player == 1) score_player_1 += score;
        else score_player_2 += score;       
    }
    else
    {
        score_player_1 += 50;
        score_player_2 += 50;  
    }
}

