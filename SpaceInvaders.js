const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

// Nave del jugador
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 7,
    dx: 0,
    life: 5 // Vida inicial del jugador
};

// Muros
const walls = [
    { x: 100, y: 500, width: 200, height: 20 },
    { x: 500, y: 500, width: 200, height: 20 }
];

// Array de enemigos
let enemies = [];
let bullets = [];
let score = 0;
let level = 1;
let enemyBullets = [];
let gameOver = false;

// Crear enemigos según nivel
function createEnemies() {
    enemies = [];
    let rows = 3 + Math.floor((level - 1) * 0.5);
    let cols = 5 + Math.floor((level - 1) * 0.3);
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            enemies.push({
                x: i * 100 + 50,
                y: j * 60 + 20,
                width: 40,
                height: 40,
                speed: 2 + level * 0.5,
                shootChance: 0.001 + level * 0.0005
            });
        }
    }
}

// Dibujar nave mejorada
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(-25, -15, 50, 40);
    
    ctx.fillStyle = "#00AA00";
    ctx.fillRect(-15, -20, 30, 10);
    
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(-10, -18, 20, 6);
    
    ctx.fillStyle = "#00DD00";
    ctx.fillRect(-30, -5, 10, 20);
    ctx.fillRect(20, -5, 10, 20);
    
    ctx.restore();
}

// Dibujar muros
function drawWalls() {
    ctx.fillStyle = "#8B4513"; // Color marrón para los muros
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

// Dibujar enemigos mejorados con variación por nivel
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        
        let colors = ["#FF00FF", "#FF0080", "#FF0000", "#FF6600"];
        let colorIndex = Math.min(level - 1, colors.length - 1);
        ctx.fillStyle = colors[colorIndex];
        
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.arc(-8, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(-8, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = colors[colorIndex];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 5, 6, 0, Math.PI);
        ctx.stroke();
        
        ctx.restore();
    });
}

// Dibujar balas del jugador
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.arc(bullet.x + 2.5, bullet.y + 7, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(bullet.x + 2.5, bullet.y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// Dibujar balas enemigas
function drawEnemyBullets() {
    enemyBullets.forEach(bullet => {
        ctx.save();
        
        ctx.fillStyle = "#FF00FF";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#FF88FF";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// Actualizar posiciones
function update() {
    if (gameOver) return;
    
    // Mover nave
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Mover balas
    bullets = bullets.filter(bullet => {
        bullet.y -= 7;
        return bullet.y > 0;
    });

    // Enemigos disparan
    enemies.forEach(enemy => {
        if (Math.random() < enemy.shootChance) {
            enemyBullets.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height,
                speed: 3 + level * 0.5
            });
        }
    });

    // Mover balas enemigas
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < canvas.height;
    });

    // Colisión balas enemigas con muros
    enemyBullets.forEach((bullet, index) => {
        if (bullet.y + bullet.speed >= walls[0].y && bullet.y <= walls[0].y + walls[0].height && 
            bullet.x >= walls[0].x && bullet.x <= walls[0].x + walls[0].width) {
            enemyBullets.splice(index, 1); // Eliminar la bala si colisiona con el muro
        } else if (bullet.y + bullet.speed >= walls[1].y && bullet.y <= walls[1].y + walls[1].height && 
                   bullet.x >= walls[1].x && bullet.x <= walls[1].x + walls[1].width) {
            enemyBullets.splice(index, 1); // Eliminar la bala si colisiona con el muro
        }
    });

    // Colisión balas del jugador con muros
    bullets.forEach((bullet, bulletIndex) => {
        walls.forEach((wall) => {
            if (bullet.y <= wall.y + wall.height && bullet.y >= wall.y &&
                bullet.x >= wall.x && bullet.x <= wall.x + wall.width) {
                bullets.splice(bulletIndex, 1); // Eliminar la bala si colisiona con el muro
            }
        });
    });

    // Colisión balas enemigas con jugador
    enemyBullets.forEach((bullet, index) => {
        if (bullet.x < player.x + player.width &&
            bullet.x > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y > player.y) {
            enemyBullets.splice(index, 1);
            player.life -= 1; // Restar vida al jugador
            if (player.life <= 0) {
                gameOver = true;
            }
        }
    });

    // Mover enemigos
    enemies.forEach(enemy => {
        enemy.x += enemy.speed;
    });

    // Invertir dirección enemigos
    if (enemies.some(e => e.x <= 0 || e.x + e.width >= canvas.width)) {
        enemies.forEach(e => e.speed *= -1);
        enemies.forEach(e => e.y += 30);
    }

    // Verificar si los alienígenas llegaron al jugador
    enemies.forEach(enemy => {
        if (enemy.y + enemy.height >= player.y) {
            gameOver = true;
        }
    });

    // Colisiones bala-enemigo
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 15 > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 10;
            }
        });
    });

    // Verificar victoria
    if (enemies.length === 0) {
        level++;
        createEnemies();
    }
}

// Dibujar pantalla de game over
function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("¡GAME OVER!", canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.fillStyle = "#FFFF00";
    ctx.font = "bold 30px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Level: " + level, canvas.width / 2, canvas.height / 2 + 70);
    
    ctx.fillStyle = "#00FF00";
    ctx.font = "20px Arial";
    ctx.fillText("Recarga la página para jugar de nuevo", canvas.width / 2, canvas.height / 2 + 130);
}

// Dibujar
function draw() {
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Estrellas de fondo
    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < 50; i++) {
        let x = (i * 157) % canvas.width;
        let y = (i * 73) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPlayer();
    drawWalls(); // Dibujar muros
    drawEnemies();
    drawBullets();
    drawEnemyBullets();

    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 40);
    ctx.fillText("Level: " + level, 20, 80);
    ctx.fillText("Vida: " + player.life, 20, 120); // Mostrar vida del jugador

    if (gameOver) {
        drawGameOver();
    } else {
        update();
    }

    requestAnimationFrame(draw);
}

// Controles
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
    if (e.key === " " && !gameOver) {
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y
        });
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

createEnemies();
draw();