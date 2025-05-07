document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("falling-objects-container");
    if (!container || !window.fallingImages || window.fallingImages.length === 0) return;

    container.style.position = "relative";
    container.style.height = "600px";

    const Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: container.clientWidth,
            height: 600,
            wireframes: false,
            background: "#f0f0f0"
        }
    });

    const ground = Bodies.rectangle(container.clientWidth / 2, 610, container.clientWidth, 20, {
        isStatic: true,
        render: { visible: false }
    });

    World.add(engine.world, [ground]);

    function spawnRandomImage(x, y) {
        const imgUrl = window.fallingImages[Math.floor(Math.random() * window.fallingImages.length)];
        const radius = 80; // Half of 160 (final image size)
    
        const body = Bodies.circle(x, y, radius, {
            restitution: 0.7,
            render: {
                sprite: {
                    texture: imgUrl,
                    xScale: 0.25, // 160 / 640
                    yScale: 0.25
                }
            }
        });
    
        World.add(engine.world, body);
    }

    // Auto spawn objects
    const autoCount = window.fallingAutoCount || 3;
    for (let i = 0; i < autoCount; i++) {
        const x = Math.random() * container.clientWidth;
        spawnRandomImage(x, -100);
    }

    // Click to spawn
    container.addEventListener("click", (e) => {
        spawnRandomImage(e.offsetX, 0);
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Engine.run(engine);
    Render.run(render);

// Initialize the canvas and Matter.js engine
const canvas = document.querySelector("canvas");
let width = canvas.width;
let height = canvas.height;
const wallThickness = 100; // Thickness of the walls

// Function to create and update walls
function createWalls() {
    // Floor (bottom) - Static, invisible wall at the bottom
    const floor = Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { visible: false }
    });

    // Left wall - Static, invisible wall on the left
    const leftWall = Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { visible: false }
    });

    // Right wall - Static, invisible wall on the right
    const rightWall = Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { visible: false }
    });

    // Add all walls to the world (no ceiling)
    Matter.World.add(engine.world, [floor, leftWall, rightWall]);

    // Log positions for debugging
    console.log("Walls Created:");
    console.log("Floor:", floor.position);
    console.log("Left Wall:", leftWall.position);
    console.log("Right Wall:", rightWall.position);
}

// Function to handle resizing of the canvas and updating wall positions
function updateCanvasSize() {
    // Update canvas width and height dynamically
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update width and height variables for the walls
    width = canvas.width;
    height = canvas.height;

    // Remove existing walls
    Matter.World.remove(engine.world, Matter.Composite.allBodies(engine.world));

    // Recreate the walls with the updated canvas size
    createWalls();
}

// Event listener for resizing the window
window.addEventListener('resize', updateCanvasSize);

// Initial wall creation
createWalls();

});
