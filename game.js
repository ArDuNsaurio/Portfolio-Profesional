// ===== CONFIG =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===== VARIABLES =====
let keys = {};
let angle = 0;
let score = 0;
let gameOver = false;

// ===== JUGADOR =====
let player = {
  x: 200,
  y: 200,
  size: 20,
  speed: 2
};

// ===== ENEMIGOS =====
let enemies = [];

// Spawn fuera del canvas
function spawnEnemy() {
  const margin = 50;
  const side = Math.floor(Math.random() * 4);

  let x, y;

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -margin;
  } else if (side === 1) {
    x = Math.random() * canvas.width;
    y = canvas.height + margin;
  } else if (side === 2) {
    x = -margin;
    y = Math.random() * canvas.height;
  } else {
    x = canvas.width + margin;
    y = Math.random() * canvas.height;
  }

  enemies.push({
    x,
    y,
    size: 15,
    speed: 1 + Math.random()
  });
}

// cada 2 segundos
setInterval(spawnEnemy, 2000);

// ===== INPUT =====
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (gameOver && e.key.toLowerCase() === "r") {
    resetGame();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ===== UPDATE =====
function update() {
  if (gameOver) return;

  // movimiento jugador
  if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
  if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;

  // límites
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // enemigos persiguen
  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }
  });

  // espada giratoria
  angle += 0.2;

  checkCollisions();
  checkPlayerHit();
}

// ===== COLISIONES (ESPADA) =====
function checkCollisions() {
  const radius = 30;

  let swordX = player.x + player.size / 2 + Math.cos(angle) * radius;
  let swordY = player.y + player.size / 2 + Math.sin(angle) * radius;

  enemies = enemies.filter(enemy => {
    let dx = enemy.x - swordX;
    let dy = enemy.y - swordY;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < enemy.size) {
      score++;
      return false;
    }
    return true;
  });
}

// ===== COLISIONES (JUGADOR) =====
function checkPlayerHit() {
  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < player.size) {
      gameOver = true;
    }
  });
}

// ===== RESET =====
function resetGame() {
  gameOver = false;
  player.x = 200;
  player.y = 200;
  enemies = [];
  score = 0;
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // jugador
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // espada (11x11)
  const radius = 30;
  let sx = player.x + player.size / 2 + Math.cos(angle) * radius;
  let sy = player.y + player.size / 2 + Math.sin(angle) * radius;

  ctx.fillStyle = "red";
  ctx.fillRect(sx, sy, 11, 11);

  // enemigos
  ctx.fillStyle = "orange";
  enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  });

  // puntuación
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 31, 20);

  // GAME OVER UI
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText("Pulsa R para reiniciar", canvas.width / 2, canvas.height / 2 + 60);
  }
}

// ===== LOOP =====
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// iniciar juego
gameLoop();