import { backend } from "declarations/backend";

class SnakeGame {
    constructor(canvas, scoreElement, highScoreElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.scoreElement = scoreElement;
        this.highScoreElement = highScoreElement;
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.reset();
        this.loadHighScore();
    }

    async loadHighScore() {
        try {
            const highScore = await backend.getHighScore();
            this.highScore = Number(highScore);
            this.highScoreElement.textContent = this.highScore;
        } catch (error) {
            console.error("Error loading high score:", error);
        }
    }

    reset() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.scoreElement.textContent = "0";
    }

    generateFood() {
        const x = Math.floor(Math.random() * this.tileCount);
        const y = Math.floor(Math.random() * this.tileCount);
        return {x, y};
    }

    update() {
        if (this.gameOver || !this.started) return;

        // Move snake
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.handleGameOver();
            return;
        }

        // Check self collision
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.handleGameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    async handleGameOver() {
        this.gameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            try {
                await backend.updateHighScore(BigInt(this.score));
            } catch (error) {
                console.error("Error updating high score:", error);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = "#f8f9fa";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = "#28a745";
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = "#dc3545";
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        if (this.gameOver) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "white";
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Game Over!", this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    changeDirection(direction) {
        if (!this.started) return;
        
        switch(direction) {
            case 'up':
                if (this.dy !== 1) { this.dx = 0; this.dy = -1; }
                break;
            case 'down':
                if (this.dy !== -1) { this.dx = 0; this.dy = 1; }
                break;
            case 'left':
                if (this.dx !== 1) { this.dx = -1; this.dy = 0; }
                break;
            case 'right':
                if (this.dx !== -1) { this.dx = 1; this.dy = 0; }
                break;
        }
    }
}

// Game initialization
const canvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const game = new SnakeGame(canvas, scoreElement, highScoreElement);

// Controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': game.changeDirection('up'); break;
        case 'ArrowDown': game.changeDirection('down'); break;
        case 'ArrowLeft': game.changeDirection('left'); break;
        case 'ArrowRight': game.changeDirection('right'); break;
    }
});

// Mobile controls
document.getElementById('upBtn')?.addEventListener('click', () => game.changeDirection('up'));
document.getElementById('downBtn')?.addEventListener('click', () => game.changeDirection('down'));
document.getElementById('leftBtn')?.addEventListener('click', () => game.changeDirection('left'));
document.getElementById('rightBtn')?.addEventListener('click', () => game.changeDirection('right'));

// Start button
startBtn.addEventListener('click', () => {
    if (game.gameOver || !game.started) {
        game.reset();
        game.started = true;
        startBtn.textContent = 'Restart Game';
    }
});

// Game loop
function gameLoop() {
    game.update();
    game.draw();
    setTimeout(gameLoop, 100);
}

gameLoop();
