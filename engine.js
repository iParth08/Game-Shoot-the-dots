// Importing sounds
const introSong = new Audio("./music/introSong.mp3");
const gameOverSound = new Audio("./music/gameOver.mp3");
const heavyWeaponSound = new Audio("./music/heavyWeapon.mp3");
const hugeWeaponSound = new Audio("./music/hugeWeapon.mp3");
const lightWeaponSound = new Audio("./music/lightWeapon.mp3");
const killEnemySound = new Audio("./music/killEnemy.mp3");

// ------------------------------------------Setting Game ENVIRONMENT -- Canvas and Context------------------------
const gamePanel = document.querySelector(".gamePanel");
const canvas = document.createElement("canvas");
gamePanel.appendChild(canvas);
canvas.width = innerWidth;
canvas.height = innerHeight;

// create context
const context = canvas.getContext("2d");

// handling resize with a trick
window.addEventListener("resize", () => {
  location.reload();
});

// ---------------------------------------- GAME SETTINGS and Variables ----------------------------

// Difficulty setting and Score Points/Highscore

let score = 0;
let highScore = {
  Easy: 100,
  Medium: 50,
  Hard: 25,
  Insane: 5,
};

let levelUp = 5; //player score break-through
let base = 0.5; // base speed of enemy
let difficulty = 1; //power-gap and speed of enemy
let impact = 6; //particle scattering
let spawnRate = 1000;
let spawnControl; //set interval termination on gameOver
let diffLevel = "Easy"; //difficulty level selection
let introChoice = false; //No Intro Music Option

const lightWeaponDamage = 10;
const heavyWeaponDamage = 15;

const weapons = [];
const enemies = [];
const particles = [];
const hugeWeapons = [];

const form = document.querySelector("form");
const currentScore = document.querySelector(".scorecard");
const diffHighScore = document.querySelector(".highscore");
const header = document.querySelector(".header");
const selectDiff = document.querySelector("#diff");
const introInput = document.querySelector("#introChoice");

introInput.addEventListener("change", () => {
  if(introInput.checked){
    introChoice = true;
    introSong.play();
  }
  else{
    introChoice = false;
    introSong.pause();
  }
})

// GAMEPLAY START
document.querySelector("#play").addEventListener("click", (e) => {
  e.preventDefault();
  form.style.display = "none";
  header.style.display = "none";
  currentScore.style.display = "block";

  diffLevel = selectDiff.value;

  switch (diffLevel) {
    case "Easy":
      difficulty = 3;
      spawnRate = 2000;
      break;
    case "Medium":
      difficulty = 3.5;
      spawnRate = 2000;
      break;
    case "Hard":
      difficulty = 4;
      spawnRate = 1000;
      break;
    case "Insane":
      difficulty = 5;
      spawnRate = 1000;
      break;
  }

  // Clear Canvas and INTRO Pause
  introSong.pause();
  context.clearRect(0, 0, canvas.width, canvas.height);
  spawnControl = setInterval(enemySpawn, spawnRate);
  animation();
});

// -------------------------------------- GAME FUNCTIONS ----------------------------------------

const gameOver = () => {
  // Sound Effects
  //gameOver Sound
  heavyWeaponSound.pause();
  hugeWeaponSound.pause();
  lightWeaponSound.pause();
  killEnemySound.pause();
  gameOverSound.play();
  setTimeout(() => {
    introChoice && introSong.play();
    introSong.volume = 0.5;
  }, 450);

  // Update Highscore
  highScorer(score);

  // display GameOver UI
  score = 0;
  currentScore.innerHTML = `<h2>Score: <span class="score">${score}</span></h2>`;

  form.style.display = "flex";
  header.style.display = "flex";
  currentScore.style.display = "none";

  // empty arrays and stop new enemy spawn
  clearInterval(spawnControl);
  enemies.splice(0, enemies.length);
  weapons.splice(0, weapons.length);
};

// Current Score Update
const scoreUpdate = (value) => {
  score += value;
  currentScore.innerHTML = `<h2>Score: <span class="score">${score}</span></h2>`;
};

// Highscore Update and LocalStorage save
const highScorer = (scored) => {
  if (scored > highScore[diffLevel]) {
    highScore[diffLevel] = scored;
  }

  diffHighScore.innerHTML = `${diffLevel}: ${highScore[diffLevel]}`;

  // save highscore to local storage
  const highScoreJSON = JSON.stringify(highScore);
  localStorage.setItem("highScore", highScoreJSON);
};

// fetch highscore on window load
window.onload = () => {
  // Play intro song
  introChoice && introSong.play(); //uncomment to play !Annoying Sound!
  introSong.volume = 0.5;

  //retrive hughScore from local storage
  const highScoreJSON = localStorage.getItem("highScore");
  if (highScoreJSON) {
    highScore = JSON.parse(highScoreJSON);
  }
  diffHighScore.innerHTML = `${diffLevel}: ${highScore[diffLevel]}`; //display current difficulty level
};

// HighScore Display on Option Selection
selectDiff.addEventListener("change", (e) => {
  diffLevel = e.target.value;
  diffHighScore.innerHTML = `${diffLevel}: ${highScore[diffLevel]}`;
});

// ------------------------------CLASS CREATION FOR ALL OBJECTS-------------------------------------------

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
  constructor(x, y, radius, color, velocity, damage) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.damage = damage;
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

// 4. Particle Class
class Particle extends Weapon {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
    this.friction = 0.97;
  }

  draw() {
    context.save();
    context.globalAlpha = this.alpha;
    super.draw();
    context.restore();
  }
  update() {
    this.draw();

    // slow down its velocity
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01; //fade out the particles {1......0}

    if (this.alpha <= 0) {
      particles.splice(particles.indexOf(this), 1);
    }
  }
}

// KAMEHAMEHA : Huge Rectangle Weapon
class HugeWeapon {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  draw() {
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, 200, canvas.height); //design of the KAMEHAMEHA
    context.fill();
  }

  update() {
    this.draw();
    this.x += 20;
    this.y += 0;
  }
}

// ----------------------------------------Player Component and Behaviours------------------------------------------

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

// -------------------------------------ENEMIES COMPONENT AND BEHAVIOUR------------------------------------------

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
// --------------------------------------Player Actions in Game----------------------------------------------------

// Light Weapon (Left Click)
canvas.addEventListener("click", (event) => {
  //*Note : No weapon cost, unlimited usage

  // LighWeaponSound == Shooting
  lightWeaponSound.play();

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
      velocity,
      lightWeaponDamage
    )
  );
});

// Heavy Weapon (Right Click)
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault(); //not menu popup

  //*Note : Weapon cost = 3, unlimited usage
  if (score < 6) {
    console.log("Not enough points");
    return;
  } else {
    scoreUpdate(-6); //1 value reduction each fire
    //HeavyWeaponSound
    heavyWeaponSound.play();
  }

  const clickAngle = Math.atan2(
    event.clientY - playerPosition.y,
    event.clientX - playerPosition.x
  );

  const velocity = {
    x: (Math.cos(clickAngle) * levelUp) / 2,
    y: (Math.sin(clickAngle) * levelUp) / 2,
  };

  // push weapon in weapons array
  weapons.push(
    new Weapon(
      canvas.width / 2,
      canvas.height / 2,
      15, //todo: radius will be changed
      "cyan",
      velocity,
      heavyWeaponDamage
    )
  );
});

// KAMEHAMEHA THE ULTIMATE
window.addEventListener("keydown", (event) => {
  // *Note : Weapon cost = 20, unlimited usage
  if (score < 20) {
    console.log("Not enough points");
    return;
  } else {
    scoreUpdate(-20); //20 value reduction each fire
    //KAMEHAMEHASound == hugeWeaponSound
    hugeWeaponSound.play();
  }
  if (event.code === "Space") {
    console.log("kamehameha");
    hugeWeapons.push(new HugeWeapon(0, 0, "rgba(255, 0, 133, 1"));
  }
});

// ----------------------------------------GAME ENGINE-ANIMATION RENDERING----------------------------------------

//Particle Generator for scattering effect
const particleGenerator = (weapon, enemy) => {
  // Particles Effects Movement generation
  for (let i = 0; i < 20; i++) {
    particles.push(
      new Particle(weapon.x, weapon.y, Math.random() * 3, enemy.color, {
        x: (Math.random() - 0.5) * (Math.random() * impact), // think of it as *impact
        y: (Math.random() - 0.5) * (Math.random() * impact),
      })
    );
  }
};

// Main game animation rendering ==> GAME LOGIC
let animationID;
function animation() {
  animationID = requestAnimationFrame(animation);
  // clear canvas with fade effect
  context.fillStyle = "rgba(49, 49, 49, 0.1)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();

  // Update particles movement
  particles.forEach((particle) => {
    particle.update();
  });

  // Update hugeWeapon movement
  hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
    // Huge Weapon Removal out of screen
    if (hugeWeapon.x > canvas.width) {
      hugeWeapons.splice(hugeWeaponIndex, 1);
    } else {
      // weapon motion update
      hugeWeapon.update();
    }
  });

  // Update weapons movement
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

  // Update enemies movement
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
      return gameOver();
    }

    // Collision Detection Logic with Huge Weapon (Kamehameha)
    hugeWeapons.forEach((hugeWeapon, hugeWeaponIndex) => {
      //*NOTE : Kamehameha doesnot give score, just save your life and require 50 score-points each
      const closenessHugeWeaponEnemy = hugeWeapon.x - enemy.x;

      if (closenessHugeWeaponEnemy < 200 && closenessHugeWeaponEnemy > -200) {
        // Ultimate Elimination
        setTimeout(() => {
          gameOverSound.play();
          enemies.splice(enemyIndex, 1);
        }, 0);
      }
    });

    // Collision Detection Logic with Light/Heavy Weapon
    weapons.forEach((weapon, weaponIndex) => {
      const closenessWeaponEnemy = Math.hypot(
        weapon.x - enemy.x,
        weapon.y - enemy.y
      );

      //if circle is close enough to touch the periphery
      if (closenessWeaponEnemy - weapon.radius - enemy.radius < 1) {
        // for every hit, score will increase by fixed 5
        scoreUpdate(5);

        if (enemy.radius > weapon.damage + 5) {
          //set smooth transition for radius reduce [REDUCE]
          gsap.to(enemy, { radius: enemy.radius - weapon.damage });

          setTimeout(() => {
            weapons.splice(weaponIndex, 1);
          }, 0);
        } else {
          // *NOTE : remove weapon and enemy, quickly [KILL]

          particleGenerator(weapon, enemy);

          setTimeout(() => {
            killEnemySound.play();
            weapons.splice(weaponIndex, 1);
            enemies.splice(enemyIndex, 1);
          }, 0);
        }
      }
    });
  });
}

//-----------------------------------TESTING NEW FEATURE----------------------------------------------

//----------------------------------ISSUES AND FIXES---------------------------------------------------
// *issue 1 : too many enemy attack at once in second start => terminate setInterval
// *issue 2 : speed and spawn rate --> controlled by difficulty
// *issue 3 : newGame and GameOver function --> Animation and interval reset
// *issue 4 : Enemy radius and Score ---> per hit 5 points
// *issue 5 : HighScore Update --> onload and onchange from localStorage
// *issue 6 : Title and currentScore --> handled display
// *issue 7 : resize and response to resize ==> trick -> reload OR you have to re-draw
//* issue 8 : intro is annoying, give choice

// todo: IDea => Burst Shot, continuous with mouse direction
