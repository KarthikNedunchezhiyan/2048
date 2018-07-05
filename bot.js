class B_Cell{
    constructor(value,reset_val){
        this.value = value;
        this.fused = false;
        this.resetValue = reset_val;
    }
}

class Bot{
    constructor(target,accuracy){
        this.target = target;
        this.level = accuracy;
        this.weights = [[7,6,5,4],[6,5,4,3],[5,4,3,2],[4,3,2,1]];
    }

    cloneBoard(){
        let mat = new Array(this.target.row);
        for(let i=0;i<this.target.row;i++){
            mat[i] = new Array(this.target.col);
            for(let j=0;j<this.target.col;j++)
                mat[i][j] = new B_Cell(this.target.board[i][j].value,this.target.board[i][j].resetValue);
        }
        return mat;
    }

    isOver(mat){
        for(let i=0;i<mat.length;i++)
            for(let j=0;j<mat[0].length;j++)
                if(mat[i][j].value==mat[i][j].resetValue || this.hasPossible(i,j,mat[i][j].value,0,mat)==true)
                    return false;
        return true;
    }

    hasPossible(i,j,value,level,mat){
        if(i<0 || j<0 || i>=mat.length || j>=mat[0].length)
            return -1;
        if(level==1)
            return mat[i][j].value;
        if(this.hasPossible(i+1,j,value,level+1,mat)==value || this.hasPossible(i-1,j,value,level+1,mat)==value || this.hasPossible(i,j+1,value,level+1,mat)==value || this.hasPossible(i,j-1,value,level+1,mat)==value)
            return true;
        return false;
    }

    isEqual(mat1,mat2){
        for(let i=0;i<mat1.length;i++)
            for(let j=0;j<mat1[0].length;j++)
                if(mat1[i][j].value!=mat2[i][j].value)
                    return false;
        return true;
    }

    findAbsolute(grid,i,j,value,level){
        if(i<0 || j<0 || i>=grid.length || j>=grid[0].length)
            return value;
        if(level==1)
            return grid[i][j].value;
        return (Math.abs(value-this.findAbsolute(grid,i+1,j,value,level+1))+Math.abs(value-this.findAbsolute(grid,i,j+1,value,level+1))+Math.abs(value-this.findAbsolute(grid,i-1,j,value,level+1))+Math.abs(value-this.findAbsolute(grid,i,j-1,value,level+1)));
    }

    Fitness(grid){
        let score = 0;
        let penalty = 0;
        let freespace = 1;
        for(let i=0;i<grid.length;i++)
            for(let j=0;j<grid[0].length;j++) {
                score += this.weights[i][j] * grid[i][j].value;
                penalty+=this.findAbsolute(grid,i,j,grid[i][j].value,0);
                if(grid[i][j].value!=grid[i][j].resetValue)
                    freespace++;
            }
        return (score/freespace)-(penalty/freespace);
    }

    predict(grid,depth,agent,prev){
        if(depth<=0)
            return this.Fitness(grid);
        if(this.isOver(grid) || this.isEqual(grid,prev))
            return -9999/depth;

        if(agent=="board"){
            let score = 0;
            let empty =0;
            for(let i=0;i<grid.length;i++)
                for(let j=0;j<grid[0].length;j++)
                    if(grid[i][j].value==grid[i][j].resetValue){
                        let newGrid = this.cloneMat(grid);
                        newGrid[i][j].value = 2;
                        score+=0.9*this.predict(newGrid,depth-1,"player",grid);

                        newGrid = this.cloneMat(grid);
                        newGrid[i][j].value = 4;
                        score+=0.1*this.predict(newGrid,depth-1,"player",grid);
                        empty+=1;
                    }
            return score/empty;
        }
        else{
            let score = 0;
            for(let i=0;i<4;i++){
                let newGrid = this.cloneMat(grid);
                if(i==0)
                    this.forwardAction(-1,0,newGrid);
                else if(i==1)
                    this.reverseAction(1,0,newGrid);
                else if(i==2)
                    this.forwardAction(0,-1,newGrid);
                else
                    this.reverseAction(0,1,newGrid);
                score = this.max([score,this.predict(newGrid,depth-1,"board",grid)]);
            }

            return score;
        }
    }

    guessNextMove(){
        let grid = this.cloneBoard();

        let score = 0;
        let report = [];
        let depth = this.level;

        for(let i=0;i<4;i++){
            let newGrid = this.cloneMat(grid);
            if(i==0)
                this.forwardAction(-1,0,newGrid);
            else if(i==1)
                this.reverseAction(1,0,newGrid);
            else if(i==2)
                this.forwardAction(0,-1,newGrid);
            else
                this.reverseAction(0,1,newGrid);
            score = this.max([score,this.predict(newGrid,depth-1,"board",grid)]);
            report.push(score);
        }

        let finalScore = this.max(report);
        for(let i=0;i<report.length;i++)
            if(report[i]==finalScore){
                if(i==0)
                    board.forwardAction(-1,0);
                else if(i==1)
                    board.reverseAction(1,0);
                else if(i==2)
                    board.forwardAction(0,-1);
                else if(i==3)
                    board.reverseAction(0,1);
                break;
            }
    }

    cloneMat(mat){
        let clone = new Array(mat.length);
        for(let i=0;i<mat.length;i++){
            clone[i] = new Array(mat[0].length);
            for(let j=0;j<mat[0].length;j++)
                clone[i][j] = new B_Cell(mat[i][j].value,mat[i][j].resetValue);
        }
        return clone;
    }

    reverseAction(ai,aj,mat){
        for(let i=this.target.row-1;i>=0;i--)
            for(let j=this.target.col-1;j>=0;j--)
                this.adjust(i+ai, j+aj, i, j, ai, aj, mat);
    }

    forwardAction(ai,aj,mat){
        for(let i=0;i<this.target.row;i++)
            for(let j=0;j<this.target.col;j++)
                this.adjust(i+ai, j+aj, i, j, ai, aj, mat);
    }

    adjust(i,j,bi,bj,ai,aj,mat){
        if(i<0 || j<0 || i>=mat.length || j>=mat[0].length || mat[i][j].fused || mat[bi][bj].value == mat[bi][bj].resetValue || (mat[i][j].value!=mat[bi][bj].value && mat[i][j].value!=mat[i][j].resetValue))
            return true;
        if(mat[i][j].value == mat[bi][bj].value){
            mat[i][j].value+=mat[bi][bj].value;
            mat[bi][bj].value = mat[bi][bj].resetValue;
            mat[i][j].fused = true;
        }
        else if(this.adjust(i+ai,j+aj,bi,bj,ai,aj,mat)){
            mat[i][j].value = mat[bi][bj].value;
            mat[bi][bj].value = mat[bi][bj].resetValue;
        }
        return false;
    }

    max(list){
        let res = -99999;
        for(let i=0;i<list.length;i++)
            if(res<list[i])
                res = list[i];
        return res;
    }
}

function On_Off_Bot(){
    if(interval==null) {
        document.getElementById("bot").style.backgroundColor = "green";
        interval = setInterval(function () {
            bot.guessNextMove();
        }, speed);
    }else{
        document.getElementById("bot").style.backgroundColor = "#DC4C46";
        clearInterval(interval);
        interval = null;
    }
}

let accuracy = 6;
if (typeof window.orientation !== 'undefined') {
    accuracy = 5;
    document.getElementById("msg").innerText="Accuracy reduced in mobiles due to performance issue!";
}

let speed = 5;

let bot = new Bot(board,accuracy);
let interval = null;
