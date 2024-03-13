// Canvas Setting on DOM LOAD and Resize //todo:
const gamePanel = document.querySelector(".gamePanel");
const canvas = document.createElement("canvas");
gamePanel.appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;

// create context
const context = canvas.getContext("2d");

// ---------------------------------------------------------------------------------------------------------
// GAME SETTINGS

// Difficulty setting and Score Points/Highscore
let difficulty = 1;
let highScore = 101;
let levelUp = 5;
let score = 0;
let base = 0.2;
const form = document.querySelector("form");
const scoreboard = document.querySelector(".scorecard");
const levelScore = document.querySelector(".highscore");
const title = document.querySelector(".title");

document.querySelector("#play").addEventListener("click", (e) => {
  e.preventDefault();
  form.style.display = "none";
  title.style.display = "none";
  levelScore.style.display = "none";
  scoreboard.style.display = "block";

  const userVal = document.querySelector("#diff").value;

  if (userVal === "Easy") {
    difficulty = 2;
    setInterval(enemySpawn, 6000);
  } else if (userVal === "Medium") {
    difficulty = 3;
    setInterval(enemySpawn, 4000);
  } else if (userVal === "Hard") {
    difficulty = 4;
    setInterval(enemySpawn, 3000);
  } else if (userVal === "Insane") {
    difficulty = 5;
    setInterval(enemySpawn, 2000);
  }

  levelScore.textContent = `${userVal} : ${highScore}`;
  // debugg :
  console.log(enemies);
  animation();
});

// ----------------------------------------------------------------------------------------------------
// CLASS CREATION FOR ALL OBJECTS

// Super Parent DOT {BASE CLASS}
class DOT {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    context.beginPath(); //path breaker
    // (x, y, radius, startAngle, endAngle, anticlockwise)
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
  }
}

// 1. Player Class
class Player extends DOT {
  constructor(x, y, radius, color) {
    super(x, y, radius, color);
  }
}

// 2. Weapon Class
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

// 3. Enemy Class
class Enemy extends Weapon {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}

// ---------------------------------------------------------------------------------------------
// COMPONENT CREATION {OBJECTS}

// position player in the center
const playerPosition = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

// Player Component
const player = new Player(
  playerPosition.x,
  playerPosition.y,
  20,
  "rgba(255, 255, 255, 1)"
);

player.draw();

// Player Pulse, Defence Active //! Additional Features

// --------------------------------------------------------------------------------------------
const enemies = [];

// Enemy Spawning
const enemySpawn = () => {
  // Multiple of 5
  const randomPowerGap = Math.floor(Math.random() * (difficulty + 3)) + 2;
  const enemySize = randomPowerGap * 5;
  // bright color
  const enemyColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;

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

  // enemy velocity calculation
  const distAngle = Math.atan2(
    playerPosition.y - random.y,
    playerPosition.x - random.x
  );

  const enemyVelocity = {
    x: Math.cos(distAngle) * base * difficulty,
    y: Math.sin(distAngle) * base * difficulty,
  };
  enemies.push(
    new Enemy(random.x, random.y, enemySize, enemyColor, enemyVelocity)
  );
};
// ----------------------------------------------------------------------------------------------
//Player Actions and Weapons
const weapons = [];
canvas.addEventListener("click", (event) => {
  const clickAngle = Math.atan2(
    event.clientY - playerPosition.y,
    event.clientX - playerPosition.x
  );

  const velocity = {
    x: Math.cos(clickAngle) * levelUp,
    y: Math.sin(clickAngle) * levelUp,
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

// ---------------------------------------------------------------------------------------------------
// Game Animation Handler
let animationID;
function animation() {
  animationID = requestAnimationFrame(animation);
  // clear canvas with fade effect
  context.fillStyle = "rgba(49, 49, 49, 0.1)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();
  weapons.forEach((weapon, weaponIndex) => {
    weapon.update();

    //Useless weapon removal
    if (
      weapon.x + weapon.radius < 1 ||
      weapon.y + weapon.radius < 1 ||
      weapon.x - weapon.radius > canvas.width ||
      weapon.y - weapon.radius > canvas.height
    ) {
      setTimeout(() => {
        weapons.splice(weaponIndex, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    // Collision Detection with Player and Enemy
    const closenessPlayerEnemy = Math.hypot(
      player.x - enemy.x,
      player.y - enemy.y
    );

    if (closenessPlayerEnemy - player.radius - enemy.radius < 1) {
      // Game Over
      cancelAnimationFrame(animationID);
      gameOver();
    }

    // Collision Detection Logic
    weapons.forEach((weapon, weaponIndex) => {
      const closenessWeaponEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );

      //if circle is close enough to touch the periphery
      if (closenessWeaponEnemy - weapon.radius - enemy.radius < 1) {
        if (enemy.radius > 11) {
          //set smooth transition for radius reduce
          gsap.to(enemy, { radius: enemy.radius - 10 });

          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        } else {
          // remove weapon and enemy, quickly
          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
            enemies.splice(enemyIndex, 1);
          }, 0);
        }
      }
    });
  });
}

const gameOver = () => {
  score = 0;
  form.style.display = "flex";
  title.style.display = "block";
  levelScore.style.display = "block";
  scoreboard.style.display = "none";
  // empty arrays
  enemies.splice(0, enemies.length);
  weapons.splice(0, weapons.length);

  console.log(enemies, weapons);
};

// !issue 1 : too many enemy attack at once in second start
// !issue 2 : speed and spawn rate
// !issue 3 : newGame and GameOver function
// !issue 4 : Enemy radius and Score
