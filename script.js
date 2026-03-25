// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when a link is clicked
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Countdown Timer Logic
const countdownContainer = document.querySelector('.countdown');
if (countdownContainer) {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const targetDate = new Date('March 28, 2026 10:00:00').getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((difference % (1000 * 60)) / 1000);

            if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();
}

// ScrollSpy Logic - Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id], header[id]');
const navLinksAnchors = document.querySelectorAll('.nav-links a');

const scrollSpyOptions = {
    threshold: 0.5 // Trigger when 50% of the section is in view
};

const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            // Remove active class from all li items
            document.querySelectorAll('.nav-links li').forEach(li => {
                li.classList.remove('active');
            });

            // Add active class to the li containing the link to the current section
            const activeLink = document.querySelector(`.nav-links a[href*="#${id}"]`);
            if (activeLink) {
                activeLink.parentElement.classList.add('active');
            }
        }
    });
}, scrollSpyOptions);

sections.forEach(section => {
    scrollSpyObserver.observe(section);
});

/* --- COMMERCE UX: APP LOGIC (FULLSCREEN CART & MODALS) --- */
document.addEventListener('DOMContentLoaded', () => {
    // Only run this logic if we are on the store page
    const cartFullscreen = document.getElementById('cartFullscreen');
    if (!cartFullscreen) return;

    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCart');
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartCountEl = document.getElementById('cartCount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const authModal = document.getElementById('authModal');
    const closeAuthBtn = document.getElementById('closeAuth');

    // Product Modal Links
    const productModal = document.getElementById('productModal');
    const closeProductBtn = document.getElementById('closeProduct');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    const modalOptionsContainer = document.getElementById('modalOptionsContainer');
    const modalAddToCartBtn = document.getElementById('modalAddToCart');

    let cart = [];
    let currentProduct = null;
    let currentVariant = null;

    // --- DRAWER & FULLSCREEN TOGGLING --- 
    function openCart() {
        cartFullscreen.classList.add('active');
        document.body.style.overflow = 'hidden'; // Immersive lock
    }

    function closeCart() {
        cartFullscreen.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function openAuthModal() {
        closeCart();
        authModal.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeAuthModal() {
        authModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    function openProductModal(item) {
        currentProduct = item;
        
        modalTitle.textContent = item.title;
        modalPrice.textContent = `$${item.price.toFixed(2)}`;
        modalImage.src = item.img;
        
        // Dynamic description and options based on product type
        if(item.title.toLowerCase().includes('digital') || item.title.toLowerCase().includes('download') || item.title.toLowerCase().includes('single')) {
            modalDesc.textContent = "High-fidelity digital download. Delivered instantly to your account upon checkout.";
            modalOptionsContainer.style.display = 'none';
            currentVariant = "Digital";
        } else if (item.title.toLowerCase().includes('vinyl') || item.title.toLowerCase().includes('cd')) {
            modalDesc.textContent = "Premium physical release. Includes exclusive liner notes and artwork.";
            modalOptionsContainer.style.display = 'none';
            currentVariant = "Physical Format";
        } else if (item.title.toLowerCase().includes('bundle')) {
            modalDesc.textContent = "The ultimate fan package. Includes the physical vinyl, an exclusive garment, and standard format digital releases.";
            modalOptionsContainer.style.display = 'none';
            currentVariant = "Complete Bundle";
        } else {
            modalDesc.textContent = "Created specifically for the true fans. High quality material, limited run. Select your preferred size below.";
            modalOptionsContainer.style.display = 'block';
            
            // Reset pills
            const pills = document.querySelectorAll('.option-pill');
            pills.forEach(p => p.classList.remove('active'));
            if(pills.length > 0) {
                pills[0].classList.add('active'); 
                currentVariant = pills[0].textContent;
            }
        }

        productModal.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeProductModal() {
        productModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    // --- OPTION PILLS CLICK ---
    document.querySelectorAll('.option-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            document.querySelectorAll('.option-pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            currentVariant = e.target.textContent;
        });
    });

    // --- MODAL ADD TO CART TICKER (FORCES AUTH) ---
    modalAddToCartBtn.addEventListener('click', () => {
        if(!currentProduct) return;

        const originalText = modalAddToCartBtn.innerHTML;
        modalAddToCartBtn.classList.add('loading');
        modalAddToCartBtn.innerHTML = 'Authenticating...';

        setTimeout(() => {
            modalAddToCartBtn.classList.remove('loading');
            modalAddToCartBtn.innerHTML = 'Done';
            
            // Add to cart array in background
            cart.push({ 
                title: currentProduct.title, 
                variant: currentVariant, 
                price: currentProduct.price, 
                img: currentProduct.img 
            });
            updateCartUI();
            
            // Instantly force Auth instead of Cart
            setTimeout(() => {
                modalAddToCartBtn.innerHTML = originalText;
                closeProductModal();
                openAuthModal(); 
            }, 600);
        }, 500);
    });

    // Handle Auth Form Submission (Simulate Auth -> Open Cart)
    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // User signs in, close auth, open the cart to see their item
            closeAuthModal();
            openCart();
        });
    }

    floatingCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    closeProductBtn.addEventListener('click', closeProductModal);
    
    cartOverlay.addEventListener('click', () => {
        closeAuthModal();
        closeProductModal();
    });
    
    closeAuthBtn.addEventListener('click', closeAuthModal);
    checkoutBtn.addEventListener('click', () => {
        if(cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        openAuthModal();
    });

    // --- CART LOGIC ---
    function updateCartUI() {
        cartCountEl.textContent = cart.length;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is currently empty.</div>';
            cartSubtotalEl.textContent = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-variant">Option: ${item.variant}</div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <button class="cart-item-remove" data-index="${index}">Remove Item</button>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        cartSubtotalEl.textContent = `$${total.toFixed(2)}`;

        // Attach remove listeners
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    // --- EXPOSED PRODUCT CLICKS ---
    const addToCartButtons = document.querySelectorAll('.store-card .btn-primary, .store-hero-info .btn-primary, .store-hero-info .btn-secondary, .store-bundle-content .btn-primary');
    
    addToCartButtons.forEach(btn => {
        if(btn.id === 'checkoutBtn' || btn.closest('.footer-form-premium')) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Extract info based on closest card or hero/bundle
            const card = btn.closest('.store-card');
            const hero = btn.closest('.store-hero-info');
            const bundle = btn.closest('.store-bundle-content');
            
            let itemData = { title: "Exclusive Item", price: 0.00, img: "images/sa-logo.png" };

            if (card) {
                itemData.title = card.querySelector('.store-card-title').textContent;
                const priceText = card.querySelector('.store-card-price span').textContent;
                itemData.price = parseFloat(priceText.replace('$', ''));
                itemData.img = card.querySelector('.store-card-image img').src;
            } else if (hero) {
                itemData.title = hero.querySelector('h1').textContent;
                itemData.price = btn.textContent.includes('Vinyl') ? 35.00 : 9.99;
                itemData.img = document.querySelector('.store-hero-image img').src;
            } else if (bundle) {
                itemData.title = bundle.querySelector('h2').textContent;
                itemData.price = 110.00;
                itemData.img = "images/Normally.png";
            }

            // Instead of adding immediately, open the Product UX Option Modal
            openProductModal(itemData);
        });
    });

    // --- SHOPIFY STATIC INTEGRATION (HANDOFF) ---
    /*
      DEVELOPER NOTE:
      Currently, the products added to the '.product-modal' and cart array above are hardcoded from dummy HTML data.
      To activate the real store without moving to a Next.js framework:
      
      1. Insert your Shopify Storefront API Access Token below.
      2. Uncomment the fetchShopifyProducts function and call it on page load.
      3. Loop through 'products.edges' and dynamically create the '.store-card' elements inside '.store-grid'.
      4. Use the Shopify JS SDK to generate a real checkout URL: `window.location.href = checkout.webUrl;` inside the AuthForm handler.
    */
    const SHOPIFY_DOMAIN = 'your-shop-name.myshopify.com';
    const STOREFRONT_ACCESS_TOKEN = 'INSERT_YOUR_PUBLIC_TOKEN_HERE';

    async function fetchShopifyProducts() {
        const query = `
        {
          products(first: 10) {
            edges {
              node {
                id
                title
                description
                images(first: 1) { edges { node { url } } }
                variants(first: 10) { edges { node { id, title, price { amount, currencyCode } } } }
              }
            }
          }
        }`;

        try {
            const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
                },
                body: JSON.stringify({ query })
            });
            const { data } = await response.json();
            console.log("Shopify Products Loaded:", data.products);
            // TODO: Render data into DOM (.store-card)
        } catch (error) {
            console.error("Error fetching Shopify Products:", error);
        }
    }
    // fetchShopifyProducts();
});
