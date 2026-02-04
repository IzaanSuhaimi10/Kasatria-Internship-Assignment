// js/visualization.js

let camera, scene, renderer;
let controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [], pyramid: [] };

function init3DVisualization() {
    // Create camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    // Create scene
    scene = new THREE.Scene();

    // Create elements from people data
    for (let i = 0; i < peopleData.length; i++) {
        const person = peopleData[i];
        
        // Create element div
        const element = document.createElement('div');
        element.className = 'element ' + getColorByNetWorth(person.netWorth);
        
        // Add photo
        const photo = document.createElement('img');
        photo.className = 'element-photo';
        photo.src = person.photo;
        photo.alt = person.name;
        element.appendChild(photo);
        
        // Add name
        const name = document.createElement('div');
        name.className = 'element-name';
        name.textContent = person.name;
        element.appendChild(name);
        
        // Add age
        const age = document.createElement('div');
        age.className = 'element-age';
        age.textContent = `Age: ${person.age}`;
        element.appendChild(age);
        
        // Add country
        const country = document.createElement('div');
        country.className = 'element-country';
        country.textContent = person.country;
        element.appendChild(country);
        
        // Add interest
        const interest = document.createElement('div');
        interest.className = 'element-interest';
        interest.textContent = person.interest;
        element.appendChild(interest);
        
        // Add net worth
        const netWorth = document.createElement('div');
        netWorth.className = 'element-networth';
        netWorth.textContent = person.netWorth;
        element.appendChild(netWorth);

        // Create CSS3D object
        const objectCSS = new THREE.CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);

        objects.push(objectCSS);
    }

    // Define target positions for each layout
    
    // TABLE layout - 20 columns x 10 rows (as specified)
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        object.position.x = (i % 20) * 200 - 1900; // 20 columns
        object.position.y = -(Math.floor(i / 20) * 200) + 900; // 10 rows
        object.position.z = 0;
        targets.table.push(object);
    }

    // SPHERE layout
    const sphereRadius = 800;
    for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;
        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(sphereRadius, phi, theta);
        targets.sphere.push(object);
    }

    // HELIX layout - DOUBLE HELIX (as specified)
    const vector = new THREE.Vector3();

// First, we need to distribute elements between two strands
// Split the 201 elements: 101 in first strand, 100 in second strand
const halfPoint = Math.ceil(objects.length / 2);

let helixIndex = 0;

// FIRST STRAND - First half of elements
for (let i = 0; i < halfPoint; i++) {
    const theta = helixIndex * 0.175 + Math.PI;
    const y = -(helixIndex * 8) + 800;

    const object = new THREE.Object3D();
    object.position.setFromCylindricalCoords(900, theta, y);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;
    object.lookAt(vector);

    targets.helix.push(object);
    helixIndex++;
}

// Reset index for second strand
helixIndex = 0;

// SECOND STRAND - Second half of elements (offset by 180 degrees)
for (let i = halfPoint; i < objects.length; i++) {
    const theta = helixIndex * 0.175 + Math.PI + Math.PI; // +Math.PI adds 180° offset
    const y = -(helixIndex * 8) + 800;

    const object = new THREE.Object3D();
    object.position.setFromCylindricalCoords(900, theta, y);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;
    object.lookAt(vector);

    targets.helix.push(object);
    helixIndex++;
}

    // GRID layout - 5x4x10 (as specified)
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        
        const x = (i % 5) * 400 - 800;  // 5 columns
        const y = -(Math.floor((i / 5) % 4) * 400) + 600;  // 4 rows
        const z = Math.floor(i / 20) * 400 - 1800;  // 10 layers
        
        object.position.x = x;
        object.position.y = y;
        object.position.z = z;
        
        targets.grid.push(object);
    }

    // Tetrahedron vertices (4 faces pyramid)
// We'll distribute elements on the faces of a tetrahedron
const pyramidScale = 1200;
const tetrahedronVertices = [
    new THREE.Vector3(1, 1, 1).multiplyScalar(pyramidScale),       // vertex 0
    new THREE.Vector3(-1, -1, 1).multiplyScalar(pyramidScale),     // vertex 1
    new THREE.Vector3(-1, 1, -1).multiplyScalar(pyramidScale),     // vertex 2
    new THREE.Vector3(1, -1, -1).multiplyScalar(pyramidScale)      // vertex 3
];

// Tetrahedron faces (triangles) - indices into vertices array
const tetrahedronFaces = [
    [2, 1, 0],  // face 0
    [0, 3, 2],  // face 1
    [1, 3, 0],  // face 2
    [2, 3, 1]   // face 3
];

// Distribute elements across the 4 faces
const elementsPerFace = Math.ceil(objects.length / 4);

for (let i = 0; i < objects.length; i++) {
    const object = new THREE.Object3D();
    
    // Determine which face this element belongs to
    const faceIndex = Math.floor(i / elementsPerFace);
    const indexInFace = i % elementsPerFace;
    
    // Get the three vertices of the current face
    const face = tetrahedronFaces[Math.min(faceIndex, 3)]; // Cap at face 3
    const v0 = tetrahedronVertices[face[0]];
    const v1 = tetrahedronVertices[face[1]];
    const v2 = tetrahedronVertices[face[2]];
    
    // Create a grid on the triangular face
    const gridSize = Math.ceil(Math.sqrt(elementsPerFace));
    const row = Math.floor(indexInFace / gridSize);
    const col = indexInFace % gridSize;
    
    // Calculate barycentric coordinates (position on triangle)
    // This ensures even distribution across the triangle
    const maxRow = gridSize - 1 || 1;
    const maxCol = gridSize - 1 || 1;
    
    // Normalized position (0 to 1)
    let u = col / maxCol;
    let v = row / maxRow;
    
    // Adjust to stay within triangle bounds
    if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
    }
    
    const w = 1 - u - v;
    
    // Calculate position using barycentric interpolation
    object.position.x = v0.x * w + v1.x * u + v2.x * v;
    object.position.y = v0.y * w + v1.y * u + v2.y * v;
    object.position.z = v0.z * w + v1.z * u + v2.z * v;
    
    // Calculate face normal (perpendicular to triangle)
    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
    
    // Make element face outward from the face
    const lookAtPoint = object.position.clone().add(normal.multiplyScalar(100));
    object.lookAt(lookAtPoint);
    
    targets.pyramid.push(object);
}


    // Create CSS3D renderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Add mouse/touch controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    // Add button event listeners
    document.getElementById('table').addEventListener('click', () => transform(targets.table, 2000));
    document.getElementById('sphere').addEventListener('click', () => transform(targets.sphere, 2000));
    document.getElementById('helix').addEventListener('click', () => transform(targets.helix, 2000));
    document.getElementById('grid').addEventListener('click', () => transform(targets.grid, 2000));
    document.getElementById('pyramid').addEventListener('click', () => transform(targets.pyramid, 2000));

    // Start with table view
    transform(targets.table, 2000);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

function transform(targets, duration) {
    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }

    new TWEEN.Tween({})
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}
