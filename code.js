const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

class Button {
  constructor(position) {
    this.position = {
      x: position.x,
      y: position.y
    }

    this.direction = {
      x: 3,
      y: 2
    }

    this.velocity = 10;
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
    )) {
      if(this.direction.x > 0) 
        this.position.x = canvas.width - this.radius;
      else this.position.x = 0 + this.radius;
      
      this.direction.x *= -1;
    };

    if (circleCollidesWithBorder(
      { ...this, direction: { y: this.direction.y } }
    )) {
      if(this.direction.y > 0) 
        this.position.y = canvas.height - this.radius;
      else this.position.y = 0 + this.radius;

      this.direction.y *= -1
    };
  }

  move() {
    if (this.velocity > 0) {
      this.position.x += this.direction.x * this.velocity;
      this.position.y += this.direction.y * this.velocity; 

      this.velocity -= this.velocity > 5 ? 0.1 : 0.02;
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
    y: 250
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

function updateCanvasSize() {
  canvas.width = innerWidth / 1.5;
  canvas.height = innerHeight / 1.5;
}

window.addEventListener('load', () => {
  updateCanvasSize();
  run();
});

window.addEventListener('resize', () => 
  updateCanvasSize()
);
