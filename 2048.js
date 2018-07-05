let colors = {0:"darkgray",2:"rgb(238, 228, 218)",4:"rgb(237, 224, 200)",8:"rgb(242, 177, 121)",16:"rgb(245, 149, 99)",32:"rgb(246, 124, 95)",64:"rgb(246, 94, 59)",128:"rgb(237, 207, 114)",
    256:"#FFF056",512:"#99CD4E",1024:"#F1684E",2048:"#E25D33"};
let board = new Board(4,4,12,colors,2048);
window.onkeyup = function(e) {
    let key = e.keyCode ? e.keyCode : e.which;

    if (key == 38) {
        board.forwardAction(-1,0);
    }else if (key == 40) {
        board.reverseAction(1,0);
    }else if (key == 37) {
        board.forwardAction(0,-1);
    }else if (key == 39) {
        board.reverseAction(0,1);
    }
}
