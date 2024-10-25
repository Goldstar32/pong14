// Create a canvas element
const canvas = document.createElement("canvas");

// Set the canvas width and height to match the window's size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the 2D context for drawing
const pen = canvas.getContext("2d");

// Append the canvas to the body of the HTML document
document.body.appendChild(canvas);

// Optional: Adjust canvas size when the window is resized
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Optionally clear the canvas or redraw on resize
    pen.clearRect(0, 0, canvas.width, canvas.height);
});

// Keep track of and update what keys are pressed
// Store the state of keys (whether they are pressed or not)
const keys = {};

// Event listener for key press (keydown)
window.addEventListener("keydown", (event) => {
    keys[event.key] = true;  // Mark the key as pressed
});

// Event listener for key release (keyup)
window.addEventListener("keyup", (event) => {
    keys[event.key] = false;  // Mark the key as released
});

// Import ball class from balls file
import { Ball } from "./balls.js";

// Import player class from player file
import { Player } from "./player.js";

// Array to hold multiple player instances
let players = [
    new Player({
        x: 10,
        y: (canvas.height / 2),
        upKey: "w",
        downKey: "s",
        hitKey: "d",
        facing: 1,
        playerCol: "#1f51ff"
    }),
    new Player({
        x: (canvas.width - 10),
        y: (canvas.height / 2),
        upKey: "ArrowUp",
        downKey: "ArrowDown",
        hitKey: "ArrowLeft",
        facing: -1,
        playerCol: "#ff5c00"
    })
];

// Array to hold multiple ball instances
let balls = [new Ball({
    xSpeed: 20,
    ySpeed: 5,
    y: (canvas.height / 2),
    playerLeft: players[0],
    playerRight: players[1]
})];

function handleInput(player) {
    // Check if specific keys are currently pressed and act accordingly
    if (keys[player.upKey]) {
        player.movePlayer("up", canvas);  // Move player up
    }
    if (keys[player.downKey]) {
        player.movePlayer("down", canvas);  // Move player down
    }
    if (keys[player.hitKey]) {
        player.tryHit(); // Tries to perform a "hit"
    }
}

// Checks collision between ball and player
function isCollision(player, ball) {
    if (!(Math.sign(ball.xSpeed) === Math.sign(player.facing)) || (Math.abs(ball.xSpeed) < Math.abs(player.xSpeed)))
        if (Math.abs(ball.x - player.x) < ball.ballRadius + player.width / 2)
            if (Math.abs(ball.y - player.y) < ball.ballRadius + player.height / 2) {
                // Closest point on the player's y-axis
                let closestY = Math.max(player.y - player.height / 2, Math.min(ball.y, player.y + player.height / 2));

                // Closest point on the player's x-axis (taking into account player width)
                let closestX;
                if (player.facing === 1) {
                    // Player is facing right, so check left side
                    closestX = player.x - player.width / 2;
                    // Update which player last hit ball
                    ball.lastHit = 1;
                } else {
                    // Player is facing left, so check right side
                    closestX = player.x + player.width / 2;
                    // Update which player last hit ball
                    ball.lastHit = -1;
                }

                // Distance between ball center and closest point on player
                const distanceX = ball.x - closestX;
                const distanceY = ball.y - closestY;

                // Calculate distance using Pythagoras' theorem
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Check if distance is less than or equal to the ball's radius (collision)
                return distance <= ball.ballRadius;
            }
}

// Handles collision between ball and player
function handleCollision(player, ball) {
    if (isCollision(player, ball)) {
        // Invert ball's xSpeed to make it bounce off the player
        ball.xSpeed *= -1;
        // Add speed of player to speed of ball
        ball.xSpeed += player.xSpeed;
        // Cancel players hit
        player.endHit(true);
    }
}

// Draw scores of players
function drawScores(pen, playerLeft, playerRight, canvas) {
    pen.font = "20px Arial";
    pen.fillStyle = playerLeft.playerCol;
    pen.fillText(`Left Player: ${playerLeft.points}`, 400, 100);
    pen.fillStyle = playerRight.playerCol;
    pen.fillText(`Right Player: ${playerRight.points}`, canvas.width - 500, 100);
}

// Draw background
function drawBackground(pen, canvas) {
    // Set the fill color to black
    pen.fillStyle = "#000000";
    // Fill the canvas with the background color
    pen.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to draw
function draw() {
    // Handle input from players
    players.forEach(player => handleInput(player));

    // Handle collision for each player and ball
    players.forEach(player => balls.forEach(ball => handleCollision(player, ball)));

    // Clear canvas before drawing
    pen.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(pen, canvas);

    // Draw scores
    drawScores(pen, players[0], players[1], canvas);

    // Loop through each player and call its draw method to draw all players
    players.forEach(player => player.drawPlayer(canvas, pen));

    // Check for collision between ball and player

    // Loop through each ball and call its draw method to draw all balls
    balls.forEach(ball => ball.drawBall(canvas, pen));

    // Call the function recursively to update animation
    requestAnimationFrame(draw);
}

// Call the function to start the animation
draw();