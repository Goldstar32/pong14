// Create a canvas element
const canvas = document.createElement("canvas");

// Set the canvas width and height to match the window's size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the 2D context for drawing
const pen = canvas.getContext("2d");

// Append the canvas to the body of the HTML document
document.body.appendChild(canvas);

// Adjust canvas size when the window is resized
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Optionally clear the canvas or redraw on resize
    pen.clearRect(0, 0, canvas.width, canvas.height);
});

// Variable to end game when someone wins
let winner = false;

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
    ySpeed: 0,
    x: (canvas.width / 2),
    y: (canvas.height / 2),
    playerLeft: players[0],
    playerRight: players[1]
})];

function handleInput(player) {
    // Check if specific keys are currently pressed and act accordingly
    if (keys[player.upKey]) {
        player.applySpeedPlayer("up", canvas);  // Move player up
    }
    if (keys[player.downKey]) {
        player.applySpeedPlayer("down", canvas);  // Move player down
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

        // Add xSpeed of player to xSpeed of ball
        ball.xSpeed += player.xSpeed;

        // Set ySpeed relative to the player's ySpeed with a smaller adjustment to avoid drastic changes
        ball.ySpeed += (player.ySpeed - ball.ySpeed) * 0.7;

        // Calculate spin: proportional to how how much "spin" (yAcc) ball has and player's ySpeed
        let spinEffect = (ball.yAcc - player.ySpeed) / 25;

        // Apply acceleration based on spin effect
        ball.yAcc += spinEffect;

        // Cancel players hit
        player.endHit(true);
    }
}

// Checks if any player has won (has 14 points)
function checkForWin(player) {
    if (player.points === 14) { // If player has 14 points...
        drawWinText(pen, canvas, player) // Draw text displaying winner
        winner = true;
        // Unhide "back to title" button
        document.getElementById("returnButton").hidden = false;
    }
}

// Draw scores of players
function drawScores(pen, playerLeft, playerRight, canvas) {
    pen.font = "50px Arial";
    pen.fillStyle = playerLeft.playerCol;
    pen.fillText(`${playerLeft.points}`, (1 / 3) * canvas.width, canvas.height / 8);
    pen.fillStyle = playerRight.playerCol;
    pen.fillText(`${playerRight.points}`, (2 / 3) * canvas.width, canvas.height / 8);
}

// Draw background
function drawBackground(pen, canvas) {
    // Set the fill color to black
    pen.fillStyle = "#000000";
    // Fill the canvas with the background color
    pen.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw winner text
function drawWinText(pen, canvas, player) {
    pen.font = "5vw Arial";
    pen.fillStyle = player.playerCol;
    if (player.facing === 1) {// Check if player is facing right (1) or left (-1)
        pen.fillText("Blue player won!", (7 / 22) * canvas.width, canvas.height / 3);
    }
    else {
        pen.fillText("Orange player won!", (2 / 7) * canvas.width, canvas.height / 3);
    }
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

    // Loop through each player and call its draw method to draw all players
    players.forEach(player => player.drawPlayer(canvas, pen));

    // Check for collision between ball and player

    // Loop through each ball and call its draw method to draw all balls
    balls.forEach(ball => ball.drawBall(canvas, pen));

    // Draw scores
    drawScores(pen, players[0], players[1], canvas);

    // Checks if anyone has won
    if (players.forEach(player => checkForWin(player)));

    // Call the function recursively to update animation unless someone has won
    if (!winner) {
        requestAnimationFrame(draw);
    }
}

// Hide "back to title" button
document.getElementById("returnButton").hidden = true;

// Call the function to start the animation
draw();