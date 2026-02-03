// js/visualization.js

let camera, scene, renderer;
let controls;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };

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
    const helixRadius = 900;
    for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.35 + Math.PI;
        const y = -(i * 8) + 800;
        
        const object = new THREE.Object3D();
        
        // Create double helix by alternating between two helices
        if (i % 2 === 0) {
            // First helix
            object.position.setFromCylindricalCoords(helixRadius, theta, y);
        } else {
            // Second helix (offset by PI)
            object.position.setFromCylindricalCoords(helixRadius, theta + Math.PI, y);
        }
        
        const vector = new THREE.Vector3(object.position.x, object.position.y, object.position.z);
        object.lookAt(vector);
        
        targets.helix.push(object);
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