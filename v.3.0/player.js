// Class for players
export class Player {

    // Initialize parameters for player (use deconstructors to easily pass the values I want while giving default to others)
    constructor({ x = 10, y = 10, width = 17, height = 170, upKey = "w", downKey = "s", facing = 1, hitKey = "d", playerCol = "#000000" } = {}) {
        // How far from the edge the player is supposed to be
        this.edgeDist = 50;
    
        this.width = width;
        this.height = height;

        // Speed in x direction
        this.xSpeed = 0;
        // Acceleration in x direction
        this.xAcc = 0;
        // Speed in y direction
        this.ySpeed = 0;

        // Defines key for moving player up
        this.upKey = upKey;
        // Defines key for moving player down
        this.downKey = downKey;
        // Key for hitting
        this.hitKey = hitKey;

        // Is the player hitting or not
        this.isHitting = false;

        // Defines what direction the player is facing (1 == right and -1 == left)
        this.facing = facing;

        // Player position based on facing direction
        this.x = x + this.edgeDist * this.facing;
        this.y = y;

        // Players points
        this.points = 0;

        this.playerCol = playerCol;
    }

    // Function for drawing the player
    drawPlayer(canvas, pen) {
        // Handles automatic physics. Only needed if player is currently hitting
        if (this.isHitting) 
            this.handlePhysics(canvas)

        // Move player according to ySpeed then reset ySpeed
        this.handlePlayerMovement();

        // Start new drawing path
        pen.beginPath();

        // Draw new rectangle with color from variable
        pen.fillStyle = this.playerCol;
        pen.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

        // End drawing path
        pen.closePath();
    }

    // Function for applying speed to player
    applySpeedPlayer(direction, canvas) {
        const speed = 10;
        if ((direction === "up") && (this.y > this.height / 2)) {
            this.ySpeed = -speed;
        } else if ((direction === "down") && (this.y < canvas.height - this.height / 2)) {
            this.ySpeed = speed;
        }
    }

    // Function to move player then reset player speed each frame
    handlePlayerMovement() {
        this.y += this.ySpeed;
        this.ySpeed = 0;
    }

    // Handles "automatic" physics
    handlePhysics(canvas) {
        // Set x acceleration to 0 if (x speed reaches 0) and (x acceleration is opposite to facing direction)
        // (the player has reached the peak of a hit)
        this.endHit();

        // Updates speed based on acceleration
        this.updateSpeed();

        // Updates position based on speed
        this.updatePosition();

        // Reset variables associated with hitting when player reaches original x position
        this.resetHit(canvas);
    }

    // Performs a hit in the direction player is facing if possible
    tryHit() {
        if (this.isHitting === false) { // Only allow hitting if player is not currently hitting
            this.isHitting = true;

            // Set speed and acceleration depending on facing direction
            this.xSpeed = 2 * this.facing;
            this.xAcc = 2 * this.facing;
        }
    }

    // Set players acceleration to 0 and speed to opposite of facing direction
    endHit(shouldEnd = this.isAtApex()) {
        const returnSpeed = 4; // Speed at which the player should travel back to the original position
        if (shouldEnd) {
            this.xAcc = 0;
            this.xSpeed = -returnSpeed * this.facing;
        }
    }

    // Return true if the player speed in facing direction is greater than the detirmined turning point speed
    // (the player has reached the peak of a hit)
    isAtApex() {
        const turnPointSpeed = 30; // Speed at which the player should start returning when reached
        return (this.xSpeed * this.facing >= turnPointSpeed);
    }

    // Reset variables associated with hitting when player reaches original x position
    resetHit(canvas) {
        // Position correct distance from edge
        const targetPos = ((canvas.width - canvas.width * this.facing) / 2) + this.edgeDist * this.facing;

        // Check if the player has passed or reached the target position
        if ((this.facing === 1 && this.x <= targetPos) || (this.facing === -1 && this.x >= targetPos)) {
            this.xSpeed = 0;
            this.isHitting = false;
            this.x = targetPos; // Snap player to target position to avoid overshooting
        }
    }

    // Updates position based on speed
    updatePosition() {
        this.x += this.xSpeed;
    }

    // Updates speed based on acceleration
    updateSpeed() {
        this.xSpeed += this.xAcc;
    }
}