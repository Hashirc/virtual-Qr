// Data Structure
const menuData = {
    categories: [
        { id: 'chinese', name: 'Chinese', image: 'assets/chinese.png' },
        { id: 'drinks', name: 'Cool Drinks', image: 'assets/drinks.png' },
        { id: 'shakes', name: 'Shakes', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800' },
        { id: 'desserts', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800' }
    ],
    items: [
        { 
            id: 1, 
            cat: 'chinese', 
            name: 'Dim Sum Platter', 
            price: 12.50, 
            desc: 'A variety of steamed dumplings with savory fillings.', 
            img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=800', 
            model: 'dimsum',
            aiAnimation: 'assets/dimsum_animation.mp4',
            features: [
                { title: 'Shrimp Har Gow', icon: '🥟', pos: { top: '35%', left: '40%' } },
                { title: 'Pork Siu Mai', icon: '🐷', pos: { top: '65%', left: '45%' } },
                { title: 'Bamboo Steamer', icon: '🎋', pos: { top: '45%', left: '75%' } }
            ]
        },
        { 
            id: 2, 
            cat: 'chinese', 
            name: 'Szechuan Noodles', 
            price: 14.00, 
            desc: 'Spicy hand-pulled noodles with chili oil and bok choy.', 
            img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800', 
            model: 'noodles',
            aiAnimation: 'assets/noodle_animation.mp4',
            features: [
                { title: 'Hand-pulled', icon: '🍜', pos: { top: '35%', left: '45%' } },
                { title: 'Szechuan Chili', icon: '🌶️', pos: { top: '65%', left: '35%' } },
                { title: 'Bok Choy', icon: '🥬', pos: { top: '55%', left: '75%' } }
            ]
        },
        { id: 3, cat: 'drinks', name: 'Blue Lagoon', price: 8.50, desc: 'Refreshing citrus mocktail with a hint of blueberry.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800', model: 'drink' },
        { id: 4, cat: 'shakes', name: 'Galaxy Shake', price: 10.00, desc: 'Ube and vanilla blended shake with edible glitter.', img: 'https://images.unsplash.com/photo-1553787499-6f9133860278?q=80&w=800', model: 'shake' },
        { id: 5, cat: 'desserts', name: 'Velvet Lava Cake', price: 9.00, desc: 'Warm chocolate cake with a molten center and raspberry coulis.', img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800', model: 'cake' },
        { id: 6, cat: 'drinks', name: 'Passion Fruit Fizz', price: 7.50, desc: 'Sparkling water infused with fresh passion fruit and mint.', img: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800', model: 'drink' },
        { 
            id: 7, 
            cat: 'chinese', 
            name: 'Peking Duck Wraps', 
            price: 18.00, 
            desc: 'Crispy duck skin with hoisin sauce and cucumber in thin pancakes.', 
            img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=800', 
            model: 'duck',
            aiAnimation: 'assets/duck_animation.mp4',
            features: [
                { title: 'Crispy Skin', icon: '🍗', pos: { top: '35%', left: '45%' } },
                { title: 'Hoisin Glaze', icon: '🍯', pos: { top: '65%', left: '35%' } },
                { title: 'Thin Pancakes', icon: '🫓', pos: { top: '55%', left: '75%' } }
            ]
        }
    ]
};

// State
let currentCart = [];
let selectedItem = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimation();
    renderCategories();
    setupEventListeners();
});

function switchView(viewId) {
    const homeView = document.getElementById('home-view');
    const categoryView = document.getElementById('category-view');

    if (viewId === 'category') {
        homeView.classList.add('hidden');
        categoryView.classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        homeView.classList.remove('hidden');
        categoryView.classList.add('hidden');
        window.scrollTo(0, 0);
    }
}

function initHeroAnimation() {
    const video = document.getElementById('entrance-video');
    const heroContent = document.querySelector('.hero-content');
    
    // Initial states
    gsap.set(heroContent, { opacity: 0, scale: 0.8 });
    gsap.set('#hero-animation', { pointerEvents: 'all' });

    // Pre-load the entrance video to ensure the first frame is ready as the "cover"
    video.load();

    const tl = gsap.timeline();
    tl.to(heroContent, { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.7)', delay: 0.5 });
    
    document.getElementById('enter-btn').addEventListener('click', () => {
        let revealed = false;
        
        // 1. Fade out the text & button overlay
        gsap.to(heroContent, { 
            opacity: 0, 
            duration: 0.5,
            onComplete: () => heroContent.style.display = 'none'
        });

        // Prepare App UI layer
        gsap.set('#app-ui', { display: 'block', opacity: 0 });
        document.body.style.overflow = 'hidden';

        // 2. Play the video (which is already the visible cover)
        video.play().then(() => {
            console.log("Cinematic entrance started.");
        }).catch(err => {
            console.warn("Video playback blocked. Jumping to menu.", err);
            revealMenu();
        });

        // Trigger reveal slightly before the video ends for a perfect, lag-free cross-fade
        const triggerTransition = () => {
            if (video.currentTime > video.duration - 0.8) {
                revealMenu();
                video.removeEventListener('timeupdate', triggerTransition);
            }
        };
        video.addEventListener('timeupdate', triggerTransition);
        
        video.onended = () => revealMenu();

        // Fallback for transition in case video event fails
        setTimeout(() => {
            revealMenu();
        }, 8000); 

        function revealMenu() {
            if (revealed) return;
            revealed = true;
            
            // Snappy fade out the entire hero container
            gsap.to('.hero-container', { 
                opacity: 0,
                duration: 0.8, // Faster transition
                ease: 'power2.inOut',
                onComplete: () => {
                    document.getElementById('hero-animation').style.display = 'none';
                    video.pause();
                }
            });
    
            // Snappy fade in the Menu
            gsap.to('#app-ui', { 
                opacity: 1, 
                duration: 0.8, 
                ease: 'power2.out' 
            });

            setTimeout(() => document.body.style.overflow = '', 1000);
        }
    });
}

function renderCategories() {
    const list = document.getElementById('category-list');
    list.innerHTML = menuData.categories.map(cat => `
        <div class="category-card" style="background-image: url('${cat.image}')" onclick="selectCategory('${cat.id}')">
            <span>${cat.name}</span>
        </div>
    `).join('');
}

function selectCategory(catId) {
    renderItems(catId);
    switchView('category');
}

function renderItems(catId) {
    const grid = document.getElementById('items-grid');
    const filtered = menuData.items.filter(item => item.cat === catId);
    
    const category = menuData.categories.find(c => c.id === catId);
    document.getElementById('current-category').innerText = category.name;

    grid.innerHTML = filtered.map(item => `
        <div class="item-card" onclick="open3DViewer(${item.id})">
            <img src="${item.img}" class="item-img" alt="${item.name}">
            <h4>${item.name}</h4>
            <p class="price">$${item.price.toFixed(2)}</p>
        </div>
    `).join('');
}

function open3DViewer(id) {
    const item = menuData.items.find(i => i.id === id);
    selectedItem = item;
    
    // Unhide the 3D container
    document.getElementById('three-container').classList.remove('hidden');
    
    if (item.aiAnimation) {
        // Use the premium AI Video Animation instead of standard 3D
        initAIAnimation(item.aiAnimation, item.features);
    } else {
        // Pass the model identifier to the viewer to build the AR scene
        initThreeViewer(selectedItem.model);
    }
}

function setupEventListeners() {
    // Back button to return to categories
    document.getElementById('back-to-home').addEventListener('click', () => {
        switchView('home');
    });

    // The 3D viewer is triggered directly from item cards.
    
    document.getElementById('close-3d').addEventListener('click', () => {
        document.getElementById('three-container').classList.add('hidden');
        stopThreeViewer();
    });
}

function updateCartCount() {
    document.querySelector('.cart-count').innerText = currentCart.length;
}
