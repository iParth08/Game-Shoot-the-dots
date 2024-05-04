# Game-Shoot-the-DOTs

## Description

> Image here

## Tech Stack

- HTML 5 Canvas
- Vanilla JavaScript ES6
- CSS 3

## NOTES

- JS : Classes, Canvas, eventListeners, requestAnimationFrame,
- Mathematical functions : Math.random, atan, cos, sin => rad angles

## Development Pathway

1. Creating Player Class

   ```js
   class Player {
     constructor(x, y, radius, color) {
       this.x = x;
       //....
     }

     drawCircle() {
       //... with fillStyle
     }
   }

   const player = new Player(
     canvas.width / 2,
     canvas.height / 2,
     radius,
     "white"
   );
   ```

2. Creating Weapon Class

   ```JS
   class Weapon {
       constructor(x, y, radius, color, velocity) {
           this.velocity = velocity;
           //....
       }

       drawCircle() {
           //... with fillStyle
       }

       update() {
           drawCircle();
           //... the velocity and direction
       }
   }
   ```

3. Creating DOT class
4. Velocity and direction Calculation
5. Weapons and Enemies array
6. Player Actions
7. Enemy Spawn Function
8. RequestAnimationFrame

   ```JS
   function animate() {
       requestAnimationFrame(animate);

       //clear the canvas
       ctx.clearRect(0, 0, canvas.width, canvas.height);

       //player draw
       player.drawCircle();

       //weapon draw/update
        weapons.forEach((weapon) => {
            weapon.update();
        })
       //enemy draw/update
   }
   ```

9.
