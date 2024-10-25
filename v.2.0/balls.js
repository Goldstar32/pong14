// Environmental variables (maybe move to different file later)
const dragFactor = 0.0001;

// Class for balls
export class Ball {

    // Initialize parameters for ball (use deconstructors to easily pass the values I want while giving default to others)
    constructor({ ballRadius = 20, xSpeed = 5, ySpeed = 5, x = null, y = 100, ballCol = "#ffffff", mass = 1, playerLeft, playerRight } = {}) {
        // Radius of ball
        this.ballRadius = ballRadius;

        // Balls speed in x and y directions
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;

        // Set this.x based on the value of ballRadius if not provided
        this.x = x ?? this.ballRadius;

        // Initial y position
        this.y = y;

        // Total speed (for calculating)
        this.totSpeed = Math.sqrt(Math.pow(this.xSpeed, 2) + Math.pow(this.ySpeed, 2));

        // Set ball color to random if not provided
        this.ballCol = ballCol;

        // Mass of ball
        this.mass = mass;

        // Player instances
        this.playerLeft = playerLeft;
        this.playerRight = playerRight;

        // Facing direction of last player who hit ball
        this.lastHit = 0;
    }

    // Function for drawing the ball
    drawBall(canvas, pen) {
        this.handlePhysics(canvas);

        // Update ball color based on speed
        this.updateColor();

        // Start new drawing path
        pen.beginPath();

        // Draw new circle
        pen.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);

        // Fill circle with color from variable
        pen.fillStyle = this.ballCol;
        pen.fill();

        // End drawing path
        pen.closePath();
    }

    // Handles physics interactions
    handlePhysics(canvas) {
        // Check if ball is colliding
        this.isColliding(canvas);

        // Update speed based on acceleration
        this.updateSpeed();

        // Moves ball according to speed
        this.updatePosition();
    }

    // Check if ball is colliding with the canvas boundaries
    isColliding(canvas) {
        // Reacts to collisions with walls
        this.collidesWithWall(canvas);

        // Update total speed to account for directional speed changes from collisions
        this.utdateTotSpeed();
    }

    // Reacts to collisions with walls
    collidesWithWall(canvas) {
        // If edge of ball reaches a vertical canvas border, invert xSpeed
        if ((this.x > canvas.width - this.ballRadius) || (this.x < this.ballRadius)) {
            this.xSpeed = -this.xSpeed;
            this.hitWall(true, canvas);
        }

        // If edge of ball reaches a horizontal canvas border, invert ySpeed
        if ((this.y > canvas.height - this.ballRadius) || (this.y < this.ballRadius)) {
            this.ySpeed = -this.ySpeed;
        }
    }

    // Perform actions when ball collides with walls
    hitWall(isSide, canvas) {
        if (isSide) {
            if (this.x < canvas.width / 2)
                this.givePoint(this.playerRight); // -1 is facing direction of player recieving point
            else
                this.givePoint(this.playerLeft); // 1 is facing direction of player recieving point
        }
    }

    // Gives point to player
    givePoint(player) {
        player.points += 1;
    }

    // Change size of the ball
    changeSize(isSide) {
        this.ballRadius = Math.ceil(Math.random() * 30) + 5;
        // Avoid clipping with walls
        if (isSide) {
            if (this.xSpeed > 0) {
                this.x += this.ballRadius;
            } else {
                this.x -= this.ballRadius;
            }
        } else {
            if (this.ySpeed > 0) {
                this.y += this.ballRadius;
            } else {
                this.y -= this.ballRadius;
            }
        }
    }

    // Return a string with hex code for a random color
    getRandCol() {
        let col = "#" + this.getRandHex(255) + this.getRandHex(255) + this.getRandHex(255);
        return col;
    }

    // Return a single random hex value between 0 and MAX
    getRandHex(MAX) {
        let hex = (Math.round(Math.random() * parseInt(MAX))).toString(16);
        return hex;
    }

    // Update positions
    updatePosition() {
        // Moves ball in x according to xSpeed
        this.x += this.xSpeed;

        // Moves ball in y according to ySpeed
        this.y += this.ySpeed;
    }

    // Update speeds
    updateSpeed() {
        this.applyDrag();

        this.checkMinSpeed();
    }

    // Updates total speed for calculations
    utdateTotSpeed() {
        // Calculate total speed with pythagora theorem
        this.totSpeed = Math.sqrt(Math.pow(this.xSpeed, 2) + Math.pow(this.ySpeed, 2));
    }

    // Update acceleration based on speed of ball to simulate drag
    applyDrag() {
        // Force of drag
        let dragForce = dragFactor * Math.pow(this.totSpeed, 3) * Math.PI * Math.pow(this.ballRadius, 2) / 5000;

        // Normalize the velocity components
        if (this.totSpeed > 0) {  // Prevent division by zero
            const unitX = this.xSpeed / this.totSpeed;
            const unitY = this.ySpeed / this.totSpeed;

            // Apply drag in the opposite direction of velocity
            this.xSpeed -= (dragForce * unitX) / this.mass;
            this.ySpeed -= (dragForce * unitY) / this.mass;
            // console.log("dragForceX " + ((dragForce * unitX) / this.mass));
            // console.log("dragForceY " + ((dragForce * unitY) / this.mass));
        }
        // console.log("totSpeed: " + this.totSpeed + " Drag force: " + dragForce);
        // console.log("xSpeed " + this.xSpeed);
        // console.log("ySpeed " + this.ySpeed);
        // console.log(" ");
    }

    // Add speed if speed is too low
    checkMinSpeed() {
        const minSpeed = 3;

        if ((this.xSpeed > 0 && this.xSpeed < minSpeed) || (this.xSpeed > -minSpeed && this.xSpeed < 0)) {
            this.xSpeed = minSpeed * Math.sign(this.xSpeed);
        }
        if ((this.ySpeed > 0 && this.ySpeed < minSpeed) || (this.ySpeed > -minSpeed && this.ySpeed < 0)) {
            this.ySpeed = minSpeed * Math.sign(this.ySpeed);
        }
    }

    // Adjust the color based on the current speed
    updateColor() {
        // Normalize `totSpeed` to a range (e.g., 0-1) if `totSpeed` max is known
        const maxSpeed = 25;
        const speedFactor = Math.min(1, this.totSpeed / maxSpeed);

        // Change color intensity from dark to bright, adjusting hex values for the desired colors
        if (this.lastHit === 1) {  // Left player (blue)
            // Green transitions from 1f to cc (31 to 204), Blue from 7f to ff (127 to 255)
            const greenComponent = Math.floor(31 + (173 * speedFactor)).toString(16).padStart(2, '0'); // Adjusted range
            const blueComponent = Math.floor(127 + (128 * speedFactor)).toString(16).padStart(2, '0'); // No change

            // Combine to form the color hex
            this.ballCol = `#1f${greenComponent}${blueComponent}`;
        } else if (this.lastHit === -1) {  // Right player (orange)
            // Red transitions from 7f to ff (127 to 255), Green from 4f to ff (79 to 255)
            const redComponent = Math.floor(127 + (128 * speedFactor)).toString(16).padStart(2, '0'); // No change
            const greenComponent = Math.floor(79 + (176 * speedFactor)).toString(16).padStart(2, '0'); // Adjusted range

            // Combine to form the color hex
            this.ballCol = `#${redComponent}${greenComponent}1f`;
        }
    }
}