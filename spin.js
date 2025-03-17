// Mobile Viewport Meta Tag (add to HTML head)
document.head.insertAdjacentHTML('beforeend', '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');

// Popup Handling
window.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('prizePopup');
    popup.classList.add('active');
    setTimeout(closePopup, 3000);

    try {
        if(localStorage.getItem('hasSpun')) {
            disableSpinButton();
            showSavedResult();
            setTimeout(closePopup, 500);
        }
    } catch (e) {
        console.error('Storage error:', e);
    }
});

function showSavedResult() {
    const elements = {
        wheel: document.querySelector('.wheel-container'),
        image: document.getElementById('resultImage'),
        card: document.getElementById('resultCard'),
        badge: document.getElementById('discountBadge'),
        price: document.getElementById('finalPrice')
    };

    if(elements.wheel && elements.image && elements.card) {
        elements.wheel.style.display = 'none';
        elements.image.style.display = 'block';
        elements.card.classList.add('active');
    }

    try {
        const savedResult = JSON.parse(localStorage.getItem('spinResult'));
        if(savedResult) {
            elements.badge.textContent = savedResult.message;
            elements.price.innerHTML = savedResult.priceText;
        }
    } catch (e) {
        console.error('Result load error:', e);
    }
}

function closePopup() {
    document.getElementById('prizePopup').classList.remove('active');
}

// Spin Logic
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const SPIN_KEY = 'hasSpun';
let isSpinning = false;

const segments = [
    { type: 'percent', value: 55, weight: 3 },
    { type: 'percent', value: 50, weight: 2 },
    { type: 'percent', value: 30, weight: 2 },
    { type: 'percent', value: 50, weight: 2 },
    { type: 'package', value: 24000, weight: 1 },
    { type: 'percent', value: 30, weight: 1 }
];

spinBtn.addEventListener('click', handleSpin);
spinBtn.addEventListener('touchstart', handleSpin);

function handleSpin(e) {
    if(e.type === 'touchstart') e.preventDefault();
    startSpin();
}

function disableSpinButton() {
    spinBtn.disabled = true;
    spinBtn.textContent = 'ALREADY SPUN';
    spinBtn.style.cssText = 'cursor: not-allowed; user-select: none;';
}

function startSpin() {
    if (isSpinning || localStorage.getItem(SPIN_KEY)) return;
    isSpinning = true;
    spinBtn.disabled = true;
    document.getElementById('resultCard').classList.remove('active');

    const weightedArray = segments.flatMap((seg, index) => Array(seg.weight).fill(index));
    const resultIndex = weightedArray[Math.random() * weightedArray.length | 0];
    
    const baseRotation = 1440 + (resultIndex * 60);
    const targetRotation = baseRotation + Math.random() * 60;
    wheel.style.transform = `rotate(${targetRotation}deg)`;

    setTimeout(() => showResult(resultIndex), 3000);
}

function showResult(index) {
    const offer = segments[index];
    let message, priceText;
    
    if(offer.type === 'percent') {
        const price = 12000 * (1 - offer.value/100);
        message = `${offer.value}% OFF!`;
        priceText = `Now Only ₹${price.toLocaleString('en-IN')}/yr`;
    } else {
        message = "3 Years Package!";
        priceText = `Pay ₹24,000 Once<br><small>(Save ₹12,000 vs yearly)</small>`;
    }

    requestAnimationFrame(() => {
        document.querySelector('.wheel-container').style.display = 'none';
        document.getElementById('resultImage').style.display = 'block';
        document.getElementById('discountBadge').textContent = message;
        document.getElementById('finalPrice').innerHTML = priceText;
        document.getElementById('resultCard').classList.add('active');
    });

    localStorage.setItem('spinResult', JSON.stringify({ message, priceText }));
    localStorage.setItem(SPIN_KEY, 'true');

    createClaimButton();
    isSpinning = false;
    disableSpinButton();
}

function createClaimButton() {
    const claimBtn = document.createElement('button');
    claimBtn.className = 'claim-btn';
    claimBtn.textContent = 'CLAIM NOW';
    claimBtn.onclick = () => document.getElementById('claimModal').classList.add('active');
    
    document.getElementById('resultCard').after(claimBtn);
}

function closeClaimModal() {
    document.getElementById('claimModal').classList.remove('active');
}

function handleSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const shopName = document.querySelector('input[placeholder="Shop Name"]').value;
    const ownerName = document.querySelector('input[placeholder="Owner Name"]').value;
    const phone = document.querySelector('input[placeholder="Phone Number"]').value;
    const location = document.querySelector('input[placeholder="Location"]').value;
    const prize = document.getElementById('discountBadge').innerText;

    // Create WhatsApp message
    const message = `*New RisePOS Claim Request*%0A%0A
        🏪 *Shop Name:* ${shopName}%0A
        👤 *Owner Name:* ${ownerName}%0A
        📞 *Phone:* ${phone}%0A
        📍 *Location:* ${location}%0A
        🎉 *Prize Won:* ${prize}%0A%0A
        _Claim generated from Spin & Save promotion_`;

    // Close modal and show success
    closeClaimModal();
    document.getElementById('successAnimation').style.display = 'block';
    
    // Redirect to WhatsApp after 3 seconds
    setTimeout(() => {
        window.location.href = `https://wa.me/918484936431?text=${message}`;
    }, 3000);
}
// CSS Injection
const mobileCSS = `
    @keyframes mobileConfetti {
        0% { transform: translateY(-100vh) rotate(0); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    .confetti-piece { width: 8px; height: 8px; }
    @media (max-width: 480px) {
        .wheel-container { width: 260px; height: 260px; }
        .spin-btn { width: 70px!important; height: 70px!important; }
        .result-card { padding: 1rem; margin: 1rem 0; }
        #resultImage img { max-width: 95%; }
    }
    * { -webkit-tap-highlight-color: transparent; }
`;
document.head.insertAdjacentHTML('beforeend', `<style>${mobileCSS}</style>`);
