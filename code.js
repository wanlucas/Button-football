const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const controls = {
  clicking: false,
  mouseX: 0,
  mouseY: 0,
  selectors: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  }
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
    this.mass = 0.4;
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
    borderCollision(this);
  }

  move() {
    if (this.velocity > 0) {
      this.position.x += this.direction.x * this.velocity;
      this.position.y += this.direction.y * this.velocity;

      this.velocity -= frictionCalculator(this);
    }
    else this.velocity = 0;
  }

  update() {
    this.draw();
    this.collision();
    this.move();
  }
}

class Ball {
  constructor() {
    this.position = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }

    this.direction = {
      x: 0,
      y: 0
    }

    this.velocity = 0;
    this.radius = 13;
    this.mass = 0.1;
  }

  draw() {
    c.beginPath();
    c.fillStyle = 'black';
    c.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0, Math.PI * 2
    );
    c.fill();
    c.closePath();
  }

  collision() {
    if (circleCollidesWithBorder(
      { ...ball, direction: { x: ball.direction.x } })
      && Math.abs(canvas.height / 2 - ball.position.y) <
      canvas.height / 6) goal();

    borderCollision(this);
  }

  move() {
    if (this.velocity > 0) {
      this.position.x += this.direction.x * this.velocity;
      this.position.y += this.direction.y * this.velocity;

      this.velocity -= frictionCalculator(this);
    }
    else this.velocity = 0;
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
    this.spacing = 0;
    this.force = 0;
  }

  draw() {
    if (ball.velocity || this.target.velocity) return;

    c.beginPath();
    c.strokeStyle = `rgb(
      ${Math.round((200 * this.force) / 5)},
      ${Math.round(200 - (200 * this.force) / 5)}, 0
    )`;

    c.moveTo(controls.mouseX, controls.mouseY);
    c.lineTo(this.target.position.x, this.target.position.y);

    c.lineWidth = 2;
    c.setLineDash([
      2 + this.spacing,
      ((6 * this.force) / 5) + 4
    ]);
    c.stroke();
    c.closePath();

    c.beginPath();

    c.arc(controls.mouseX, controls.mouseY, 5, 0, Math.PI * 2);
    c.setLineDash([]);
    c.fill();
    c.closePath();
  }

  kickPreparation() {
    if (this.target.velocity || this.target.velocity) return;
    
    if (controls.clicking) {
      if (this.force < 5) this.force += 0.1;
    } else if (this.force > 0) this.kick();
  }

  kick() {
    const vx = controls.mouseX - this.target.position.x;
    const vy = controls.mouseY - this.target.position.y;
    const total = Math.abs(vx) + Math.abs(vy);

    this.target.direction.x = -(vx * 5) / total;
    this.target.direction.y = -(vy * 5) / total;
    this.target.velocity = this.force;

    this.force = 0;
  }

  updateTarget() {
    if(this.force || this.target.velocity) return;

    for(const key in controls.selectors) {
      if(controls.selectors[key] && teamOne.players[key - 1]) 
        this.target = teamOne.players[key - 1];
    }
  }

  update() {
    this.draw();
    this.kickPreparation();
    this.updateTarget();
    this.spacing < 3 ? this.spacing += 0.05 : this.spacing = 0;
  }
}

const teamOne = {
  players: [],
  flank: 1,
  goals: 0,
  formation: [
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', 'o', 'o', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
  ]
};

const teamTwo = {
  players: [],
  flank: 2,
  goals: 0,
  formation: [
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'o'],
  ]
};

let kicker, ball;

function goal() {
  ball.position.x > canvas.width / 2 ?
    teamOne.goals++ : teamTwo.goals++;

  createTeams();
  ball = new Ball();
  kicker = new Kicker(teamOne.players[0]);
}

function frictionCalculator(movingObject) {
  if (movingObject.velocity > 2) return (0.5 * movingObject.mass);
  return 0.1 * movingObject.mass;
}

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

function borderCollision(circle) {
  if (circleCollidesWithBorder(
    { ...circle, direction: { x: circle.direction.x } }
  )) circle.direction.x *= -1;

  if (circleCollidesWithBorder(
    { ...circle, direction: { y: circle.direction.y } }
  )) circle.direction.y *= -1;
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
  const total = Math.abs(vx) + Math.abs(vy);

  circle1.direction.x = (vx * 5) / total;
  circle1.direction.y = (vy * 5) / total;

  circle2.direction.x = -(vx * 5) / total;
  circle2.direction.y = -(vy * 5) / total;

  if (circle1.velocity > circle2.velocity) {
    circle2.velocity = circle1.velocity;
  } else circle1.velocity = circle2.velocity;

  circle1.velocity *= Math.min(0.5 + (circle2.mass - circle1.mass), 1);
  circle2.velocity *= Math.min(0.5 + (circle1.mass - circle2.mass), 1);
}

function createTeams() {
  for (const team of [teamOne, teamTwo]) {
    const hrTileSize = (canvas.width / team.formation[0].length) / 2;
    const vrTileSize = canvas.height / team.formation.length;

    team.players = [];

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

function drawField() {
  const w = canvas.width, h = canvas.height;

  c.beginPath();
  c.lineWidth = 1;
  c.setLineDash([]);
  c.strokeStyle = 'white';
  c.fillStyle = 'white';

  c.moveTo(w / 2, 0);
  c.lineTo(w / 2, h);

  c.moveTo(0, h / 2 - h / 3);
  c.lineTo(h / 3, h / 2 - h / 3);
  c.lineTo(h / 3, h / 2 + h / 3);
  c.lineTo(0, h / 2 + h / 3);

  c.moveTo(1, h / 2 - h / 6);
  c.lineTo(1, h / 2 + h / 6);

  c.moveTo(w, h / 2 + h / 3);
  c.lineTo(w - h / 3, h / 2 + h / 3);
  c.lineTo(w - h / 3, h / 2 - h / 3);
  c.lineTo(w, h / 2 - h / 3);

  c.moveTo(w - 1, h / 2 - h / 6);
  c.lineTo(w - 1, h / 2 + h / 6);

  c.stroke();
  c.closePath();

  c.beginPath();
  c.arc(
    w / 2, h / 2,
    (h * 0.8) / 2, 0,
    Math.PI * 2
  );
  c.stroke();
  c.closePath();

  c.beginPath();
  c.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
  c.fill();
  c.closePath();
}

function run() {
  requestAnimationFrame(run);
  c.clearRect(0, 0, canvas.width, canvas.height);

  drawField();

  kicker.update();

  ball.update();

  teamOne.players.forEach((button, i) => {
    button.update();

    if (circleCollidesWithCircle(button, ball)) {
      elasticCollisionBetweenCircles(button, ball);
    };

    teamOne.players.forEach((secondButton, i2) => {
      if (i !== i2 && circleCollidesWithCircle(button, secondButton))
        elasticCollisionBetweenCircles(button, secondButton);
    });
    
    teamTwo.players.forEach((secondButton) => {
      if (circleCollidesWithCircle(button, secondButton))
        elasticCollisionBetweenCircles(button, secondButton);
    });
  });

  teamTwo.players.forEach((button, i) => {
    button.update();

    if (circleCollidesWithCircle(button, ball)) {
      elasticCollisionBetweenCircles(button, ball);
    };

    teamTwo.players.forEach((secondButton, i2) => {
      if (i !== i2 && circleCollidesWithCircle(button, secondButton))
        elasticCollisionBetweenCircles(button, secondButton);
    });
  });
}

function updateCanvasSize() {
  canvas.width = innerWidth / 1.5;
  canvas.height = innerHeight / 1.5;
}

function createInputListeners() {
  canvas.addEventListener('mousedown', () => controls.clicking = true);

  canvas.addEventListener('mouseup', () => controls.clicking = false);

  canvas.addEventListener('mousemove', ({ offsetX, offsetY }) => {
    controls.mouseX = offsetX;
    controls.mouseY = offsetY;
  });

  window.addEventListener('keydown', ({ key }) => controls.selectors[key] = true);
  window.addEventListener('keyup', ({ key }) => controls.selectors[key] = false);
}

window.addEventListener('load', () => {
  updateCanvasSize();
  createInputListeners();
  createTeams();
  kicker = new Kicker(teamOne.players[0]);
  ball = new Ball;
  run();
});

window.addEventListener('resize', () =>
  updateCanvasSize()
);
