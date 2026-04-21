let scene, camera, renderer, controls;
let currentModel = null;
let arLabels = []; // Array to store { object3D, htmlElement } mappings

let isInitialized = false;
let aiVideo = null;

function initThreeViewer(modelType) {
    if (renderer) stopThreeViewer(); // Enforce strict cleanup to prevent crash loops

    const container = document.getElementById('three-container');
    
    // Scene Setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 5); // Pulled camera further back and up so dish fits onscreen perfectly

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(5, 5, 5);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const backLight = new THREE.PointLight(0xffffff, 0.5);
    backLight.position.set(-5, 2, -5);
    scene.add(backLight);

    // Ground Plane (Wooden Table)
    const textureLoader = new THREE.TextureLoader();
    const tableTexture = textureLoader.load('assets/table.png');
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
        map: tableTexture,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Plate
    const plateGeom = new THREE.CylinderGeometry(1.2, 1, 0.08, 64);
    const plateMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0,
        clearcoat: 1.0
    });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.y = 0.04;
    plate.receiveShadow = true;
    plate.castShadow = true;
    scene.add(plate);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0.5, 0); // Focus directly on the salad bowl


    // Load Model or Create Fallback
    loadModel(modelType);

    // Render Loop
    animate();

    // Handle Resize
    window.addEventListener('resize', onWindowResize);
}

function initAIAnimation(videoPath, features) {
    stopThreeViewer(); // Thorough cleanup of THREE.js and previous videos

    const container = document.getElementById('three-container');
    const overlay = document.getElementById('ar-labels-overlay');
    
    // Explicitly hide Three.js instructions
    const instructions = container.querySelector('.three-instructions');
    if (instructions) {
        instructions.style.visibility = 'hidden';
        instructions.style.display = 'none';
    }

    overlay.innerHTML = ''; // Fresh start for labels

    // Create Premium Video Element
    aiVideo = document.createElement('video');
    aiVideo.src = videoPath;
    aiVideo.className = 'ai-video-bg';
    aiVideo.loop = true;
    aiVideo.muted = true;
    aiVideo.playsInline = true;
    aiVideo.autoplay = true;
    
    // Insert video before the overlay
    container.insertBefore(aiVideo, overlay);
    
    // Generate AI Feature Labels
    features.forEach(feature => {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'ar-label video-label';
        labelDiv.style.top = feature.pos.top;
        labelDiv.style.left = feature.pos.left;
        labelDiv.style.position = 'absolute';
        labelDiv.style.display = 'flex';
        
        labelDiv.innerHTML = `
            <div class="ar-card pulsing">
                <div class="ar-title"><span>${feature.icon}</span> ${feature.title}</div>
            </div>
            <div class="ar-anchor-dot"></div>
        `;
        overlay.appendChild(labelDiv);
    });

    aiVideo.play().catch(err => console.warn("Video playback deferred:", err));
}

function loadModel(type) {
    const group = new THREE.Group();
    arLabels = []; // reset tracking
    document.getElementById('ar-labels-overlay').innerHTML = ''; // clear old labels
    
    // Create a high-quality "Salad Bowl/Plate" representing the user's reference photo.
    
    // Plate surface
    const plateGeom = new THREE.CylinderGeometry(1.2, 1, 0.08, 64);
    const plateMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, clearcoat: 1.0 });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.y = 0.04;
    plate.receiveShadow = true;
    plate.castShadow = true;
    group.add(plate);
    
    // Ingredients helper function
    const addIngredient = (color, x, y, z, scale, labelData, side) => {
        const geom = new THREE.DodecahedronGeometry(0.2, 1);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, y, z);
        mesh.scale.set(...scale);
        mesh.castShadow = true;
        group.add(mesh);
        
        // Add AR Label mapped to this specific mesh
        createARLabel(mesh, labelData, side);
    };

    // Avocado (Green)
    addIngredient(0x4a7c59, -0.6, 0.2, -0.3, [1, 0.5, 1.5], {
        title: 'Avocado', icon: '🥑', benefits: ['Omega 9', 'Good for Heart']
    }, 'left');
    
    // Tomato (Red)
    addIngredient(0xc1121f, -0.5, 0.2, 0.6, [1.5, 0.3, 1.5], {
        title: 'Tomato', icon: '🍅', benefits: ['Vitamin C', 'Antioxidants']
    }, 'left');

    // Chicken (Brownish strips)
    addIngredient(0xd4a373, 0.2, 0.3, 0, [2.5, 1.0, 2.0], {
        title: 'Chicken', icon: '🍗', benefits: ['Low Carbs', 'High Protein']
    }, 'center');

    // Onion (White/Purple slices)
    addIngredient(0x9d8189, 0.6, 0.2, -0.4, [1.5, 0.2, 0.8], {
        title: 'Onion', icon: '🧅', benefits: ['Digesters', 'Natural Detox']
    }, 'right');

    // Olives (Dark Green/Black)
    addIngredient(0x1a1c1a, 0.6, 0.2, 0.5, [0.6, 0.4, 0.6], {
        title: 'Olives', icon: '🫒', benefits: ['Good fats', 'Anti-inflammatory']
    }, 'right');

    group.scale.set(1.2, 1.2, 1.2); // Sized perfectly for mobile/desktop viewport

    scene.add(group);
    currentModel = group;
}

function createARLabel(object3D, data, side) {
    const overlay = document.getElementById('ar-labels-overlay');
    
    const labelDiv = document.createElement('div');
    labelDiv.className = `ar-label ${side}`;
    
    const benefitsHtml = data.benefits.map(b => `<li>${b}</li>`).join('');
    
    labelDiv.innerHTML = `
        <div class="ar-card">
            <div class="ar-title"><span>${data.icon}</span> ${data.title}</div>
            <ul class="ar-data">${benefitsHtml}</ul>
        </div>
        <div class="ar-line"></div>
        <div class="ar-anchor"></div>
    `;
    
    overlay.appendChild(labelDiv);
    
    // Push into our tracking array
    arLabels.push({
        object3D: object3D,
        element: labelDiv
    });
}


let animationId;

function stopThreeViewer() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    
    if (aiVideo) {
        aiVideo.pause();
        aiVideo.remove();
        aiVideo = null;
    }

    if (renderer) {
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
    }
    
    scene = null;
    camera = null;
    controls = null;
    arLabels = [];
    
    // Restore instructions for next potential 3D load
    const instructions = document.querySelector('.three-instructions');
    if (instructions) {
        instructions.style.visibility = 'visible';
        instructions.style.display = 'block';
    }
}


function animate() {
    animationId = requestAnimationFrame(animate);
    if (controls) controls.update();
    
    updateARLabels(); // Call the projection Engine
    
    if (renderer) renderer.render(scene, camera);
}

function updateARLabels() {
    if (!camera || arLabels.length === 0) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const widthHalf = width / 2;
    const heightHalf = height / 2;

    arLabels.forEach(label => {
        // 1. Get world position of the specific 3D ingredient
        const pos = new THREE.Vector3();
        label.object3D.getWorldPosition(pos);
        
        // Push the anchor slightly up so the dot sits visually "on top" of the ingredient
        pos.y += 0.2; 
        
        // 2. Project 3D vector to 2D camera viewport
        pos.project(camera);
        
        // 3. Convert to pixel coordinates correctly inside viewport bounds
        const x = (pos.x * widthHalf) + widthHalf;
        const y = -(pos.y * heightHalf) + heightHalf;
        
        // Hide if behind the camera
        if (pos.z > 1 || pos.z < -1) {
            label.element.style.display = 'none';
        } else {
            label.element.style.display = 'flex';
            label.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            
            let zIndex = Math.round((1 - pos.z) * 100);
            label.element.style.zIndex = zIndex + 205; // Base z-index + depth calculation
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
