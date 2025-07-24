 const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const startScreen = document.getElementById('startScreen');
        const gameOverScreen = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const newRecordElement = document.getElementById('newRecord');

        // Configuración del juego
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;

        let snake = [
            {x: 10, y: 10}
        ];
        let food = {};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameRunning = false;

        highScoreElement.textContent = highScore;

        // Generar comida aleatoria
        function generateFood() {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Asegurarse de que la comida no aparezca sobre la serpiente
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    generateFood();
                }
            }
        }

        // Dibujar el juego
        function drawGame() {
            // Limpiar canvas con gradiente
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(20, 20, 40, 0.9)');
            gradient.addColorStop(1, 'rgba(40, 20, 60, 0.9)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar la serpiente
            ctx.fillStyle = '#4CAF50';
            ctx.shadowColor = '#2E7D32';
            ctx.shadowBlur = 10;
            
            for (let i = 0; i < snake.length; i++) {
                const segment = snake[i];
                
                // Cabeza más brillante
                if (i === 0) {
                    ctx.fillStyle = '#66BB6A';
                    ctx.shadowBlur = 15;
                } else {
                    ctx.fillStyle = '#4CAF50';
                    ctx.shadowBlur = 5;
                }
                
                ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
            }

            // Dibujar la comida
            ctx.fillStyle = '#FF5722';
            ctx.shadowColor = '#D84315';
            ctx.shadowBlur = 15;
            ctx.fillRect(food.x * gridSize + 4, food.y * gridSize + 4, gridSize - 8, gridSize - 8);

            // Resetear sombra
            ctx.shadowBlur = 0;
        }

        // Mover la serpiente
        function moveSnake() {
            // Solo mover si hay dirección establecida
            if (dx === 0 && dy === 0) return;
            
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};

            // Verificar colisiones con paredes
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameOver();
                return;
            }

            // Verificar colisiones con el cuerpo (antes de añadir la nueva cabeza)
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameOver();
                    return;
                }
            }

            // Añadir nueva cabeza
            snake.unshift(head);

            // Verificar si comió la comida
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                generateFood();
                
                // Efecto visual al comer
                canvas.style.filter = 'brightness(1.2)';
                setTimeout(() => {
                    canvas.style.filter = 'brightness(1)';
                }, 100);
            } else {
                // Solo quitar la cola si no comió
                snake.pop();
            }
        }

        // Game Over
        function gameOver() {
            gameRunning = false;
            finalScoreElement.textContent = score;
            
            // Verificar nuevo récord
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
                newRecordElement.style.display = 'block';
            } else {
                newRecordElement.style.display = 'none';
            }
            
            gameOverScreen.style.display = 'block';
        }

        // Bucle principal del juego
        function gameLoop() {
            if (!gameRunning) return;
            
            moveSnake();
            drawGame();
            
            setTimeout(gameLoop, 150);
        }

        // Iniciar juego
        function startGame() {
            gameRunning = true;
            startScreen.style.display = 'none';
            gameOverScreen.style.display = 'none';
            
            // Resetear estado
            snake = [{x: 10, y: 10}];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            
            generateFood();
            gameLoop();
        }

        // Reiniciar juego
        function restartGame() {
            startGame();
        }

        // Cambiar dirección
        function changeDirection(direction) {
            if (!gameRunning) return;
            
            switch(direction) {
                case 'up':
                    if (dy !== 1) { dx = 0; dy = -1; }
                    break;
                case 'down':
                    if (dy !== -1) { dx = 0; dy = 1; }
                    break;
                case 'left':
                    if (dx !== 1) { dx = -1; dy = 0; }
                    break;
                case 'right':
                    if (dx !== -1) { dx = 1; dy = 0; }
                    break;
            }
        }

        // Controles de teclado
        document.addEventListener('keydown', e => {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    changeDirection('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    changeDirection('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    changeDirection('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    changeDirection('right');
                    break;
                case ' ':
                    e.preventDefault();
                    if (!gameRunning && startScreen.style.display === 'none') {
                        restartGame();
                    }
                    break;
            }
        });

        // Controles táctiles (swipe)
        let touchStartX = 0;
        let touchStartY = 0;

        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            if (!gameRunning) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Movimiento horizontal
                if (deltaX > 30) {
                    changeDirection('right');
                } else if (deltaX < -30) {
                    changeDirection('left');
                }
            } else {
                // Movimiento vertical
                if (deltaY > 30) {
                    changeDirection('down');
                } else if (deltaY < -30) {
                    changeDirection('up');
                }
            }
        });

        // Dibujar pantalla inicial
        drawGame();