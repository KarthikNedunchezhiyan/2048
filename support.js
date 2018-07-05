class Cell{
    constructor(i,j,size){
        this.resetValue = 0;
        this.value = this.resetValue;
        this.fused = false;
        this.target = this.createCell(i,j,size);
    }

    createCell(i,j,size){
        let cell = document.createElement("div");
        cell.style.height = size+"vw";
        cell.style.width = size+"vw";
        cell.style.top = (i*size)+"vw";
        cell.style.left = (j*size)+"vw";
        cell.classList.add("cell");
        let inner = document.createElement("div");
        inner.classList.add("inner");
        inner.innerText = this.resetValue;
        cell.appendChild(inner);
        document.getElementById("board").appendChild(cell);
        return cell;
    }
}

class Board{
    constructor(row,col,size,colors,maxScore){
        this.row = row;
        this.col = col;
        this.size = size;
        this.colors = colors;
        this.gameOver = false;
        this.maxScore = maxScore;
        this.totalScore = 0;
        this.board = this.createBoard();
        document.getElementById("control").style.top = (size*(row+0.5))+"vw";
        this.reset();
    }

    createBoard(){
        let board = new Array(this.row);
        for(let i=0;i<this.row;i++){
            board[i] = new Array(this.col);
            for(let j=0;j<this.col;j++)
                board[i][j] = new Cell(i,j,this.size);
        }
        return board;
    }

    pushRandomValue(){
        let emptySpace = [];
        for(let i=0;i<this.row;i++)
            for(let j=0;j<this.col;j++)
                if(this.board[i][j].value==0)
                    emptySpace.push(this.board[i][j]);
        if(emptySpace.length==0)
            return;
        let newVal = Math.random()>0.1?2:4;
        let index = Math.floor(Math.random()*emptySpace.length);
        emptySpace[index].value = newVal;
        this.update();
    }

    update(){
        for(let i=0;i<this.row;i++)
            for(let j=0;j<this.col;j++) {
                this.board[i][j].target.children[0].innerText = this.board[i][j].value!=this.board[i][j].resetValue?this.board[i][j].value:"";
                this.board[i][j].target.style.backgroundColor = this.colors[this.board[i][j].value];
                this.board[i][j].fused = false;
                if(this.board[i][j].value==this.maxScore){
                    this.gameOver = true;
                    this.showNotice("You Won!");
                }
            }
         document.getElementById("score").innerText = "Score : "+this.totalScore;
    }

    adjust(i,j,bi,bj,ai,aj){
        if(i<0 || j<0 || i>=this.row || j>=this.col || this.board[i][j].fused || this.board[bi][bj].value == this.board[bi][bj].resetValue || (this.board[i][j].value!=this.board[bi][bj].value && this.board[i][j].value!=this.board[i][j].resetValue))
            return true;
        if(this.board[i][j].value == this.board[bi][bj].value){
            this.board[i][j].value+=this.board[bi][bj].value;
            this.totalScore+=this.board[i][j].value;
            this.board[bi][bj].value = this.board[bi][bj].resetValue;
            this.board[i][j].fused = true;
        }
        else if(this.adjust(i+ai,j+aj,bi,bj,ai,aj)){
            this.board[i][j].value = this.board[bi][bj].value;
            this.board[bi][bj].value = this.board[bi][bj].resetValue;
        }
        return false;
    }

    reverseAction(ai,aj){
        if(this.gameOver)
            return;
        let statechange = false;
        for(let i=this.row-1;i>=0;i--)
            for(let j=this.col-1;j>=0;j--) {
                let prev = this.board[i][j].value;
                this.adjust(i + ai, j + aj, i, j, ai, aj);
                let now = this.board[i][j].value;
                if(prev!=now)
                    statechange = true;
            }
        if(!this.isOver() && statechange)
            this.pushRandomValue();
    }

    forwardAction(ai,aj){
        if(this.gameOver)
            return;
        let statechange = false;
        for(let i=0;i<this.row;i++)
            for(let j=0;j<this.col;j++) {
                let prev = this.board[i][j].value;
                this.adjust(i + ai, j + aj, i, j, ai, aj);
                let now = this.board[i][j].value;
                if(prev!=now)
                    statechange = true;
            }
        if(!this.isOver() && statechange)
            this.pushRandomValue();
    }

    isOver(){
        for(let i=0;i<this.row;i++)
            for(let j=0;j<this.col;j++)
                if(this.board[i][j].value==this.board[i][j].resetValue || this.hasPossible(i,j,this.board[i][j].value,0)==true)
                    return false;
        this.gameOver = true;
        this.showNotice("Game Over!");
        return true;
    }

    hasPossible(i,j,value,level){
        if(i<0 || j<0 || i>=this.row || j>=this.row)
            return -1;
        if(level==1)
            return this.board[i][j].value;
        if(this.hasPossible(i+1,j,value,level+1)==value || this.hasPossible(i-1,j,value,level+1)==value || this.hasPossible(i,j+1,value,level+1)==value || this.hasPossible(i,j-1,value,level+1)==value)
            return true;
        return false;
    }

    showNotice(message){
        let notice = document.getElementById("notice");
        notice.children[0].innerText = message;
        notice.style.visibility = "visible";
    }

    reset(){
        document.getElementById("notice").style.visibility = "hidden";
        this.totalScore = 0;
        for(let i=0;i<this.row;i++)
            for(let j=0;j<this.col;j++)
                this.board[i][j].value = this.board[i][j].resetValue;
        this.pushRandomValue();
        this.pushRandomValue();
        this.update();
    }
}
