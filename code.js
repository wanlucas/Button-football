const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const controls = {
  clicking: false,
  mouseX: 0,
  mouseY: 0
}

class Button {
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    }
    
    this.direction = {
      x: 0,
      y: 0
    }

    this.velocity = 0;
    this.radius = 25;
    this.mass = 0.2;
  }

  draw() {
    c.beginPath();
    c.fillStyle = 'white';
    c.arc(
      Math.max(Math.min(this.position.x, canvas.width), 0),
      Math.max(Math.min(this.position.y, canvas.height), 0),
      this.radius,
      0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }
  
  collision() {
    if (circleCollidesWithBorder(
      { ...this, direction: { x: this.direction.x } }
      )) {
        if (this.direction.x > 0)
        this.position.x = canvas.width - this.radius;
      else this.position.x = 0 + this.radius;

      this.direction.x *= -1;
    };

    if (circleCollidesWithBorder(
      { ...this, direction: { y: this.direction.y } }
      )) {
      if (this.direction.y > 0)
        this.position.y = canvas.height - this.radius;
      else this.position.y = 0 + this.radius;

      this.direction.y *= -1;
    };
  }

  move() {
    if (this.velocity > 0) {
      this.position.x += this.direction.x * this.velocity;
      this.position.y += this.direction.y * this.velocity;

      this.velocity -= 0.003;
    }
  }

  update() {
    this.draw();
    this.collision();
    this.move();
  }
}

class Kicker {
  constructor(target) {
    this.target = target;
  }

  kick() {
    const vx = controls.mouseX - this.target.position.x;
    const vy = controls.mouseY - this.target.position.y;

    this.target.direction.x = -vx;
    this.target.direction.y = -vy;
  }
}

const teamOne = {
  players: [],
  flank: 1,
  formation: [
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', 'o', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
  ]
};

const teamTwo = {
  players: [],
  flank: 2,
  formation: [
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'o'],
  ]
};

let kicker;

function circleCollidesWithBorder(circle) {
  const nextMoveX = circle.direction.x * circle.velocity;
  const nextMoveY = circle.direction.y * circle.velocity;

  return (
    circle.position.x - circle.radius + nextMoveX <= 0 ||
    circle.position.x + circle.radius + nextMoveX >= canvas.width ||
    circle.position.y - circle.radius + nextMoveY <= 0 ||
    circle.position.y + circle.radius + nextMoveY >= canvas.height
  );
}

function circleCollidesWithCircle(circle, secondCircle) {
  const hDistance = circle.position.x - secondCircle.position.x;
  const vDistance = circle.position.y - secondCircle.position.y;
  const padding = circle.radius + secondCircle.radius;

  return Math.hypot(hDistance, vDistance) <= padding;
}

function elasticCollisionBetweenCircles(circle1, circle2) {
  const vx = circle1.position.x - circle2.position.x;
  const vy = circle1.position.y - circle2.position.y;

  circle1.mass = 0.3

  circle1.direction.x = vx;
  circle1.direction.y = vy;

  circle2.direction.x = -vx;
  circle2.direction.y = -vy;

  if(circle1.velocity > circle2.velocity)
    circle2.velocity = circle1.velocity;
  else circle1.velocity = circle2.velocity;

  circle1.velocity *= (0.7 + (circle2.mass - circle1.mass));
  circle2.velocity *= (0.7 + (circle1.mass - circle2.mass));
}

function createTeams() {
  for (const team of [teamOne, teamTwo]) {
    const hrTileSize = (canvas.width / team.formation[0].length) / 2;
    const vrTileSize = canvas.height / team.formation.length;

    team.formation.forEach((row, y) => {
      row.forEach((col, x) => {
        if (col === 'o') createNewButton(
          team,
          position = {
            x: x * hrTileSize + hrTileSize / 2,
            y: y * vrTileSize + vrTileSize / 2
          }
        );
      });
    });
  };
}

function createNewButton(team, position) {
  if (team.flank === 2)
    position.x += canvas.width / 2;

  team.players.push(
    new Button(
      position = {
        x: position.x,
        y: position.y
      }
    )
  );
}

function run() {
  requestAnimationFrame(run);
  c.clearRect(0, 0, canvas.width, canvas.height);

  teamOne.players.forEach((button) => {
    button.update();

    teamTwo.players.forEach((secondButton) => {
      if(circleCollidesWithCircle(button, secondButton))
        elasticCollisionBetweenCircles(button, secondButton);
    });
  });

  teamTwo.players.forEach((button) => button.update());
}

function updateCanvasSize() {
  canvas.width = innerWidth / 1.5;
  canvas.height = innerHeight / 1.5;
}

function createInputListeners() {
  canvas.addEventListener('mousedown', () => {
    controls.clicking = true;
    kicker.target.velocity = 0.4;
    kicker.kick();
  });
  
  canvas.addEventListener('mouseup', () => controls.clicking = false);

  canvas.addEventListener('mousemove', ({ offsetX, offsetY }) => {
    controls.mouseX = offsetX;
    controls.mouseY = offsetY;
  });
}

window.addEventListener('load', () => {
  updateCanvasSize();
  createInputListeners();
  createTeams();
  kicker = new Kicker(teamOne.players[0]);
  run();
});

window.addEventListener('resize', () =>
  updateCanvasSize()
);
