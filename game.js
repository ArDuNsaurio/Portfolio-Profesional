// ===== CONFIG =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Detectar móvil
const isMobile = window.innerWidth <= 768;

// Configuración dinámica
const CONFIG = {
  swordRadius: isMobile ? 40 : 30,
  swordHitbox: isMobile ? 18 : 12
};

// ===== IMÁGENES =====
let playerImg = new Image();
playerImg.src = "recursos/img/player.png";

let enemyImg = new Image();
enemyImg.src = "recursos/img/enemy.png";

let swordImg = new Image();
swordImg.src = "recursos/img/sword.png";

// ===== VARIABLES =====
let keys = {};
let angle = 0;
let score = 0;
let gameOver = false;

// ===== JOYSTICK =====
const joystickBase = document.getElementById("joystickBase");
const joystickStick = document.getElementById("joystickStick");

let touchActive = false;
let touchX = 0;
let touchY = 0;

if (isMobile && joystickBase) {

  joystickBase.addEventListener("touchstart", () => {
    touchActive = true;
  });

  joystickBase.addEventListener("touchmove", (e) => {
    e.preventDefault();

    const rect = joystickBase.getBoundingClientRect();
    const touch = e.touches[0];

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const maxDist = rect.width / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;

    touchX = dx / maxDist;
    touchY = dy / maxDist;
  });

  joystickBase.addEventListener("touchend", () => {
    touchActive = false;
    touchX = 0;
    touchY = 0;
    joystickStick.style.transform = `translate(0px, 0px)`;
  });
}

// ===== JUGADOR =====
let player = {
  x: 200,
  y: 200,
  size: 32,
  speed: isMobile ? 2.5 : 2
};

// ===== ENEMIGOS =====
let enemies = [];

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
    size: 24,
    speed: 1 + Math.random()
  });
}

setInterval(spawnEnemy, 2000);

// ===== INPUT TECLADO =====
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

  // teclado (PC)
  if (!isMobile) {
    if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
    if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
    if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
    if (keys["d"] || keys["arrowright"]) player.x += player.speed;
  }

  // joystick (móvil)
  if (isMobile && touchActive) {
    player.x += touchX * player.speed * 2;
    player.y += touchY * player.speed * 2;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    }
  });

  angle += isMobile ? 0.25 : 0.2;

  checkCollisions();
  checkPlayerHit();
}

// ===== COLISIONES =====
function checkCollisions() {
  const radius = CONFIG.swordRadius;

  let swordX = player.x + player.size / 2 + Math.cos(angle) * radius;
  let swordY = player.y + player.size / 2 + Math.sin(angle) * radius;

  enemies = enemies.filter(enemy => {
    let dx = enemy.x - swordX;
    let dy = enemy.y - swordY;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < (enemy.size / 2 + CONFIG.swordHitbox)) {
      score++;
      return false;
    }
    return true;
  });
}

function checkPlayerHit() {
  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < player.size / 2 + enemy.size / 2) {
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

  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  const radius = CONFIG.swordRadius;
  let sx = player.x + player.size / 2 + Math.cos(angle) * radius;
  let sy = player.y + player.size / 2 + Math.sin(angle) * radius;

  ctx.drawImage(swordImg, sx, sy, 11, 11);

  enemies.forEach(enemy => {
    let dx = player.x - enemy.x;

    ctx.save();

    if (dx > 0) {
      ctx.translate(enemy.x + enemy.size, enemy.y);
      ctx.scale(-1, 1);
      ctx.drawImage(enemyImg, 0, 0, enemy.size, enemy.size);
    } else {
      ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.size, enemy.size);
    }

    ctx.restore();
  });

  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 31, 20);

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
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

// ===== BOTÓN TÁCTIL =====
const restartBtn = document.getElementById("restartBtn");

restartBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  resetGame();
});

gameLoop();