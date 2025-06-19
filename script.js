const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
let correctPin = null;

// Local storage utilities
function store(key, value) {
  localStorage.setItem(key, value);
}
function retrieve(key) {
  return localStorage.getItem(key);
}
function clear() {
  localStorage.clear();
}

// Random 3-digit number generator
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// SHA256 hashing
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Display or get the target hash
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) return cached;

  const randomPin = getRandomArbitrary(MIN, MAX).toString();
  const hash = await sha256(randomPin);
  store('sha256', hash);
  store('pin', randomPin); // Store actual pin for testing
  return hash;
}

// Main function to display hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Check entered value
async function test() {
  const pin = pinInput.value;
  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hash = sha256HashView.innerHTML;
  const hashedPin = await sha256(pin);

  if (hashedPin === hash) {
    resultView.innerHTML = `🎉 Success! ${pin} is correct`;
  } else {
    resultView.innerHTML = '❌ Incorrect';
  }
  resultView.classList.remove('hidden');
}

// Brute-force decoder
async function bruteForce() {
  resultView.innerHTML = '⏳ Cracking...';
  resultView.classList.remove('hidden');

  const targetHash = sha256HashView.innerHTML;

  for (let i = MIN; i <= MAX; i++) {
    const testPin = i.toString();
    const hashed = await sha256(testPin);
    if (hashed === targetHash) {
      resultView.innerHTML = `🔓 Found: ${testPin}`;
      pinInput.value = testPin;
      return;
    }
  }

  resultView.innerHTML = '❌ No match found';
}

// Only numbers in input
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// Attach check and brute force buttons
document.getElementById('check').addEventListener('click', test);
document.getElementById('brute').addEventListener('click', bruteForce);

// Run main on load
main();
