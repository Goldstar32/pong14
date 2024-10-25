// Get canvas element and context
let canvas = document.getElementById("myCanvas");
let pen = canvas.getContext("2d");

// Import ball class from balls file
import { Ball } from "./balls.js";

// Array to hold multiple ball instances
let balls = [new Ball(undefined, 20, 5), new Ball(undefined, 10, 5, 100), new Ball(undefined, 10, 10, 200, 100)];

// Function to draw
function draw() {
    // Clear canvas before drawing
    pen.clearRect(0, 0, canvas.width, canvas.height);

    // Loop through each ball and call its draw method to draw all balls
    balls.forEach(ball => ball.drawBall(canvas, pen));

    // Call the function recursively to update animation
    requestAnimationFrame(draw);
}

// Call the function to start the animation
draw();