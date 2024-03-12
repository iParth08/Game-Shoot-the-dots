const gamePanel = document.querySelector(".gamePanel");
const canvas = document.createElement("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

//append canvas to gamePanel
gamePanel.appendChild(canvas);

// create context
const context = canvas.getContext("2d");

// Difficulty setting
let difficulty = 1;
let spawnTime = 1000;
const form = document.querySelector("form");
const scoreboard = document.querySelector(".scorecard");

document.querySelector("#play").addEventListener("click", (e) => {
  e.preventDefault();
  form.style.display = "none";
  scoreboard.style.display = "block";

  const userVal = document.querySelector("#diff").value;

  if (userVal === "easy") {
    difficulty = 5;
    spawnTime = 3000;
  } else if (userVal === "medium") {
    difficulty = 8;
    spawnTime = 2000;
  } else if (userVal === "hard") {
    difficulty = 10;
    spawnTime = 1000;
  } else if (userVal === "insane") {
    difficulty = 12;
    spawnTime = 700;
  }

//   console.log(difficulty, spawnTime); //!alert : debugging
// clear canvas and arrays

});

// Super Parent DOT
class DOT {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); // (x, y, radius, startAngle, endAngle, anticlockwise)
    context.fillStyle = this.color;
    context.fill();
  }
}

// Creating Player
const playerPosition = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

class Player extends DOT {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
  }
}

// Creating Weapon Class
class Weapon extends DOT {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }

  //update position and direction => velocity
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Enemy Class
class Enemy extends Weapon {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}

// ---------------------------------------------

// Player Component
const player = new Player(
  playerPosition.x,
  playerPosition.y,
  20,
  "rgba(255, 255, 255, 1)"
);

player.draw();

// Weapon Component

const weapons = [];
const enemies = [];

// Enemy Actions

const enemySpawn = () => {
  const enemySize = Math.random() * (40 - 5) + 5;
  const enemyColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  }, 1)`;

  //spawn position from edge
  let random;
  if (Math.random() < 0.5) {
    //from vertical sides
    random = {
      x: Math.random() < 0.5 ? 0 - enemySize : canvas.width + enemySize,
      y: Math.random() * canvas.height,
    };
  } else {
    //from horizontal sides
    random = {
      x: Math.random() * canvas.width,
      y: Math.random() < 0.5 ? 0 - enemySize : canvas.height + enemySize,
    };
  }

  // enemy velocity
  const distAngle = Math.atan2(
    playerPosition.y - random.y,
    playerPosition.x - random.x
  );
  const enemyVelocity = {
    x: Math.cos(distAngle) * difficulty,
    y: Math.sin(distAngle) * difficulty, //todo: velocity will be changed
  };
  enemies.push(
    new Enemy(random.x, random.y, enemySize, enemyColor, enemyVelocity)
  );
};

//Player Actions
canvas.addEventListener("click", (event) => {
  const clickAngle = Math.atan2(
    event.clientY - playerPosition.y,
    event.clientX - playerPosition.x
  );

  const velocity = {
    x: Math.cos(clickAngle) * 5,
    y: Math.sin(clickAngle) * 5, //todo: level up velocity
  };
  // push weapon in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      5, //todo: radius will be changed
      "white",
      velocity
    )
  );
});

// Game Animation Handler
function animation() {
  requestAnimationFrame(animation);
  // clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();
  weapons.forEach((weapon) => {
    weapon.update();
  });

  enemies.forEach((enemy) => {
    enemy.update();
  });
}

console.log(spawnTime);
const enemyInterval = setInterval(enemySpawn, spawnTime);

animation();
