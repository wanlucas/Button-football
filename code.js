const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth / 2;
canvas.height = innerHeight / 2;

class Button {
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.direction = {
      x: 1,
      y: 2
    }

    this.velocity = 5;
    this.radius = 15;
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
    )) this.direction.x *= -1;

    if (circleCollidesWithBorder(
      { ...this, direction: { y: this.direction.y } }
    )) this.direction.y *= -1;
  }

  move() {
    if (this.velocity > 0) {
      this.position.x += this.direction.x * this.velocity;
      this.position.y += this.direction.y * this.velocity;

      this.velocity -= this.velocity > 5 ? 0.2 : 0.02;
    }
  }

  update() {
    this.draw();
    this.collision();
    this.move();
  }
}

const button = new Button(
  position = {
    x: 100,
    y: 100
  }
);

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

function run() {
  requestAnimationFrame(run);
  c.clearRect(0, 0, canvas.width, canvas.height);

  button.update();
}

window.addEventListener('load', () => {
  run();
})
