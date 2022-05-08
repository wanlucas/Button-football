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

  update() {
    this.draw();
  }
}

const button = new Button(
  position = {
    x: 100,
    y: 100
  }
);

function run() {
  requestAnimationFrame(run);
  c.clearRect(0, 0, canvas.width, canvas.height);

  button.update();
}

window.addEventListener('load', () => {
  run();
})
